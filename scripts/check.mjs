#!/usr/bin/env node
/**
 * MyRehbar link and scholarship checker
 * =====================================
 * Runs on YOUR computer only, when YOU run it. Nothing is deployed, nothing runs automatically,
 * and nothing on the website changes unless you use --verify.
 *
 *   npm run check                      Check every official link in the data files
 *   npm run check -- --only scholarships   (or: universities, lists)
 *   npm run verify -- <slug> [<slug>...]   After YOU have re-read the official page(s),
 *                                          set lastVerified to today for those entries.
 *
 * What it checks for each official link:
 *   - Is the page still online? (broken / down / blocked)
 *   - Does it now send you to a DIFFERENT website? (a sign a domain expired or changed hands)
 *   - Did the page change since your last run? (dates or rules may have changed: re-read it)
 *   - For scholarships: does the page still mention the program's name?
 *   - Deadline-like dates it can see on the page, and deadlines in our data that have passed
 *   - Entries nobody has checked by hand for 90+ days
 *   - New scholarship links on trusted listing pages (scripts/watch-pages.json)
 *
 * Output: a summary in the terminal, and a full report in reports/check-YYYY-MM-DD.md
 * (open it in VS Code and press Cmd+Shift+V to preview). Reports and saved page fingerprints
 * stay on your computer (they are in .gitignore).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FILES = {
  scholarships: path.join(ROOT, 'src/data/scholarships.json'),
  universities: path.join(ROOT, 'src/data/universities.json'),
  officialLists: path.join(ROOT, 'src/config/officialLists.ts'),
  watch: path.join(ROOT, 'scripts/watch-pages.json'),
  state: path.join(ROOT, '.check-state.json'),
  reports: path.join(ROOT, 'reports'),
}

const USER_AGENT = 'MyRehbar-LinkChecker/1.0 (+https://myrehbar.org; run by hand)'
// Some sites refuse automated checkers (403/410). If so, we retry once as a normal browser would,
// so a working page is not reported as broken.
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const TIMEOUT_MS = 25_000
const CONCURRENCY = 4
const STALE_DAYS = 90
const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec'
// Government and university domains. Other domains are fine, but get a "make sure this is official" note.
const OFFICIAL_SUFFIXES = ['.gov.pk', '.edu.pk', '.gov', '.edu', '.gov.uk', '.ac.uk', '.go.jp', '.go.kr', '.gov.tr', '.gov.au', '.gov.cn', '.edu.cn', '.ac.jp', '.ac.kr', '.edu.au', '.gov.hu', '.hu', '.int']

// Secure-connection (TLS) problems on the site's side.
const CERT_EXPIRED = new Set(['CERT_HAS_EXPIRED'])
const CERT_CHAIN = new Set(['UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'UNABLE_TO_GET_ISSUER_CERT', 'SELF_SIGNED_CERT_IN_CHAIN'])

const today = new Date().toISOString().slice(0, 10)
const args = process.argv.slice(2)
const color = process.stdout.isTTY
  ? { red: (s) => `\x1b[31m${s}\x1b[0m`, yellow: (s) => `\x1b[33m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, bold: (s) => `\x1b[1m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m` }
  : { red: String, yellow: String, green: String, bold: String, dim: String }

/* ------------------------------------------------------------------ */
/* --verify: a human confirms entries, we stamp today's date           */
/* ------------------------------------------------------------------ */

if (args[0] === '--verify') {
  const slugs = args.slice(1)
  if (slugs.length === 0) {
    console.log('Usage: npm run verify -- <slug> [<slug> ...]\nOnly do this after you have re-read the official page(s) yourself.')
    process.exit(1)
  }
  for (const [file, key] of [[FILES.scholarships, 'scholarships'], [FILES.universities, 'universities']]) {
    const data = JSON.parse(await readFile(file, 'utf8'))
    let changed = false
    for (const item of data[key] ?? []) {
      if (slugs.includes(item.slug)) {
        item.lastVerified = today
        changed = true
        console.log(color.green(`✓ ${item.slug}: lastVerified = ${today}`))
        slugs.splice(slugs.indexOf(item.slug), 1)
      }
    }
    if (changed) await writeFile(file, JSON.stringify(data, null, 2) + '\n')
  }
  if (slugs.length) console.log(color.red(`Not found: ${slugs.join(', ')}`))
  console.log('Now commit and push to update the website.')
  process.exit(0)
}

/* ------------------------------------------------------------------ */
/* Load what to check                                                  */
/* ------------------------------------------------------------------ */

const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
const scholarshipsData = JSON.parse(await readFile(FILES.scholarships, 'utf8')).scholarships ?? []
const universitiesData = JSON.parse(await readFile(FILES.universities, 'utf8'))
const officialListsSrc = await readFile(FILES.officialLists, 'utf8')
const officialLists = [...officialListsSrc.matchAll(/label:\s*'([^']+)',\s*url:\s*'([^']+)'/g)].map((m) => ({ label: m[1], url: m[2] }))
const watchPages = JSON.parse(await readFile(FILES.watch, 'utf8').catch(() => '[]'))
const state = JSON.parse(await readFile(FILES.state, 'utf8').catch(() => '{}'))
state.pages ??= {}
state.watch ??= {}

/** Each entry = something on the website, with the official links that back it up. */
const entries = []
const want = (group) => !only || only === group

if (want('scholarships')) {
  for (const s of scholarshipsData) {
    entries.push({
      group: s.country === 'Pakistan' ? 'Scholarships: in Pakistan' : 'Scholarships: abroad',
      slug: s.slug,
      name: s.name,
      main: s.officialUrl,
      urls: unique([s.officialUrl, ...(s.sources ?? [])]),
      keywords: distinctiveWords(s.name),
      deadline: s.deadline ?? null,
      lastVerified: s.lastVerified ?? null,
    })
  }
}
if (want('universities')) {
  for (const u of universitiesData.universities ?? []) {
    entries.push({
      group: 'Universities',
      slug: u.slug,
      name: u.shortName ? `${u.shortName} (${u.name})` : u.name,
      main: u.website,
      urls: unique([u.website, u.admissionsUrl, u.financialAidUrl, u.feesUrl, u.costs?.sourceUrl, u.hostel?.sourceUrl, ...(u.aid ?? []).map((a) => a.sourceUrl), ...(u.sources ?? [])]),
      keywords: [],
      deadline: null,
      lastVerified: u.lastVerified ?? null,
    })
  }
  const mp = universitiesData.medicalProcess
  if (mp) {
    entries.push({
      group: 'Universities',
      slug: 'medical-admission-process',
      name: 'Medical admission process (MDCAT, provinces)',
      main: mp.officialListUrl,
      urls: unique([mp.officialListUrl, ...(mp.provinces ?? []).map((p) => p.url), ...(mp.sources ?? [])]),
      keywords: [],
      deadline: null,
      lastVerified: null,
      noStaleCheck: true,
    })
  }
}
if (want('lists')) {
  for (const l of officialLists) {
    entries.push({ group: 'Official lists', slug: l.url, name: l.label, main: l.url, urls: [l.url], keywords: [], deadline: null, lastVerified: null, noStaleCheck: true })
  }
}

const allUrls = unique(entries.flatMap((e) => e.urls))
console.log(color.bold(`\nMyRehbar checker: ${entries.length} entries, ${allUrls.length} official links\n`))

/* ------------------------------------------------------------------ */
/* Fetch every link once (politely)                                    */
/* ------------------------------------------------------------------ */

const robotsCache = new Map()
const results = new Map()
let done = 0

await runPool(allUrls, CONCURRENCY, async (url) => {
  results.set(url, await checkUrl(url))
  done++
  if (process.stdout.isTTY) process.stdout.write(`\r  checked ${done}/${allUrls.length} links`)
})
if (process.stdout.isTTY) process.stdout.write('\n')

/* ------------------------------------------------------------------ */
/* Turn results into findings per entry                                */
/* ------------------------------------------------------------------ */

const findings = entries.map((e) => {
  const problems = [] // must fix
  const warnings = [] // should look at
  const notes = [] // good to know
  const dates = []

  for (const url of e.urls) {
    const r = results.get(url)
    const label = url === e.main ? 'Main link' : 'Source'
    if (r.kind === 'broken') problems.push(`${label} is broken (${r.status}): ${url}`)
    else if (r.kind === 'down') problems.push(`${label} did not load (${r.error}). Try again later; if it keeps failing, find the new official page: ${url}`)
    else if (r.kind === 'blocked') notes.push(`${label} blocks automated checks (${r.status}). Open it by hand: ${url}`)
    else if (r.kind === 'cert-expired') warnings.push(`${label}: the site's security certificate has EXPIRED. Visitors will see a "not secure" browser warning. Consider telling the organisation, or warn students: ${url}`)
    else if (r.kind === 'cert-chain') notes.push(`${label} has an incomplete security certificate setup. Browsers usually still open it fine; check once by hand: ${url}`)
    else if (r.kind === 'robots') notes.push(`${label} asks robots not to visit, so it was skipped. Open it by hand: ${url}`)
    if (r.refusedBots) notes.push(`${label} refuses automated checkers, but loads fine in a normal browser: ${url}`)
    if (r.otherSite) warnings.push(`${label} now sends you to a DIFFERENT website (${r.finalHost}). Make sure it is still official: ${url}`)
    if (r.changed) warnings.push(`${label} changed since your last check (${r.previousCheck}). Re-read it for new dates or rules: ${url}`)
    if (r.firstSeen) notes.push(`${label} checked for the first time (future runs will spot changes): ${url}`)
    if (!r.official && url === e.main) notes.push(`Main link is not a government or university domain (${hostOf(url)}). That can be fine (e.g. chevening.org), but make sure it is the official site.`)
    if (r.dates?.length) dates.push(...r.dates.map((d) => `${d} — ${url}`))
  }

  if (e.keywords.length) {
    const main = results.get(e.main)
    if (main?.text && !e.keywords.some((k) => fold(main.text).includes(fold(k)))) {
      warnings.push(`The main page no longer mentions "${e.keywords.join('" or "')}". The program may have moved or ended.`)
    }
  }
  if (e.deadline && e.deadline < today) warnings.push(`Deadline in our data (${e.deadline}) has passed. Update it to the next cycle, or set it to null.`)
  if (!e.noStaleCheck) {
    if (!e.lastVerified) warnings.push(`Never checked by a person. Read the official page, then run: npm run verify -- ${e.slug}`)
    else if (daysBetween(e.lastVerified, today) > STALE_DAYS) warnings.push(`Last checked by a person on ${e.lastVerified} (over ${STALE_DAYS} days ago). Re-read it, then run: npm run verify -- ${e.slug}`)
  }

  const level = problems.length ? 'problem' : warnings.length ? 'warning' : 'ok'
  return { ...e, problems, warnings, notes, dates: unique(dates).slice(0, 6), level }
})

/* ------------------------------------------------------------------ */
/* Watch trusted listing pages for NEW scholarship links               */
/* ------------------------------------------------------------------ */

const discoveries = []
if (!only || only === 'scholarships') {
  for (const w of watchPages) {
    const r = await checkUrl(w.url, { keepLinks: true })
    if (!r.links) continue
    const interesting = r.links.filter((l) => new RegExp(w.match ?? 'scholar|fellowship|grant|loan|endowment|award', 'i').test(`${l.text} ${l.href}`))
    const known = new Set(state.watch[w.url] ?? [])
    const isFirstRun = !state.watch[w.url]
    const fresh = interesting.filter((l) => !known.has(l.href))
    if (!isFirstRun && fresh.length) discoveries.push({ page: w, links: fresh })
    state.watch[w.url] = unique([...known, ...interesting.map((l) => l.href)])
  }
}

/* ------------------------------------------------------------------ */
/* Save state, print summary, write report                             */
/* ------------------------------------------------------------------ */

await writeFile(FILES.state, JSON.stringify(state, null, 2) + '\n')

const count = (lvl) => findings.filter((f) => f.level === lvl).length
console.log(`\n  ${color.green(`✓ ${count('ok')} look fine`)}   ${color.yellow(`! ${count('warning')} need a look`)}   ${color.red(`✗ ${count('problem')} have problems`)}`)
if (discoveries.length) console.log(color.yellow(`  ★ ${discoveries.reduce((n, d) => n + d.links.length, 0)} new scholarship links found on watched pages`))
for (const f of findings.filter((x) => x.level === 'problem')) {
  console.log(color.red(`\n  ✗ ${f.name}`))
  for (const p of f.problems) console.log(color.red(`      ${p}`))
}

await mkdir(FILES.reports, { recursive: true })
const reportPath = path.join(FILES.reports, `check-${today}.md`)
await writeFile(reportPath, renderReport(findings, discoveries))
console.log(`\n  Full report: ${color.bold(path.relative(ROOT, reportPath))}  ${color.dim('(open in VS Code, then Cmd+Shift+V)')}\n`)
process.exit(count('problem') ? 1 : 0)

/* ================================================================== */
/* Helpers                                                             */
/* ================================================================== */

async function checkUrl(url, opts = {}) {
  const first = await checkUrlAs(url, USER_AGENT, opts)
  if (first.kind === 'blocked' || (first.kind === 'broken' && [404, 410].includes(first.status))) {
    const retry = await checkUrlAs(url, BROWSER_UA, opts)
    if (retry.kind === 'ok') return { ...retry, refusedBots: true }
  }
  return first
}

async function checkUrlAs(url, userAgent, { keepLinks = false } = {}) {
  if (!/^https?:\/\//.test(url ?? '')) return { kind: 'broken', status: 'not a valid link' }
  if (!(await robotsAllows(url))) return { kind: 'robots', official: isOfficial(url) }

  let res, body, error, isHtml
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': userAgent, Accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      isHtml = (res.headers.get('content-type') ?? '').includes('html')
      if (isHtml) {
        body = Buffer.from(await res.arrayBuffer())
      } else {
        // PDFs and files can be huge (100+ MB). Don't download them: their headers are enough.
        await res.body?.cancel()
        body = Buffer.from(res.headers.get('content-length') ?? 'unknown-size')
      }
      error = null
      break
    } catch (err) {
      error = err.name === 'TimeoutError' ? 'timed out' : err.cause?.code ?? err.message
      if (CERT_EXPIRED.has(error) || CERT_CHAIN.has(error)) break
      await sleep(1500)
    }
  }
  if (CERT_EXPIRED.has(error)) return { kind: 'cert-expired', official: isOfficial(url) }
  if (CERT_CHAIN.has(error)) return { kind: 'cert-chain', official: isOfficial(url) }
  if (error) return { kind: 'down', error, official: isOfficial(url) }

  const finalHost = hostOf(res.url)
  const otherSite = baseDomain(finalHost) !== baseDomain(hostOf(url))
  const status = res.status
  const base = { status, finalHost, otherSite, official: isOfficial(url) }
  if (status === 403 || status === 429 || status === 401) return { ...base, kind: 'blocked' }
  if (status >= 400) return { ...base, kind: status >= 500 ? 'down' : 'broken', error: `error ${status}` }

  const html = isHtml ? body.toString('utf8') : ''
  const text = isHtml ? htmlToText(html) : ''
  const fingerprint = createHash('sha256').update(isHtml ? stable(text) : body).digest('hex')
  const prev = state.pages[url]
  state.pages[url] = { fingerprint, status, finalUrl: res.url, checkedAt: today }

  return {
    ...base,
    kind: 'ok',
    text,
    firstSeen: !prev,
    changed: Boolean(prev && prev.fingerprint !== fingerprint),
    previousCheck: prev?.checkedAt,
    dates: isHtml ? findDeadlineDates(text) : [],
    links: keepLinks && isHtml ? extractLinks(html, res.url) : undefined,
  }
}

async function robotsAllows(url) {
  const { origin, pathname } = new URL(url)
  if (!robotsCache.has(origin)) {
    let rules = []
    try {
      const res = await fetch(`${origin}/robots.txt`, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(10_000) })
      const type = res.headers.get('content-type') ?? ''
      if (res.ok && type.includes('text/plain')) rules = parseRobots(await res.text())
    } catch {
      // No robots.txt reachable: allowed.
    }
    robotsCache.set(origin, rules)
  }
  return !robotsCache.get(origin).some((rule) => rule && pathname.startsWith(rule))
}

/** Disallow rules that apply to every robot ("User-agent: *"). */
function parseRobots(txt) {
  const rules = []
  let applies = false
  for (const raw of txt.split('\n')) {
    const line = raw.split('#')[0].trim()
    const [key, ...rest] = line.split(':')
    const value = rest.join(':').trim()
    if (/^user-agent$/i.test(key)) applies = value === '*'
    else if (applies && /^disallow$/i.test(key)) rules.push(value)
  }
  return rules
}

/** Remove things that change on every visit (visitor counters, clocks), so they don't count as "changed". */
function stable(text) {
  return text
    .replace(/\b(visitors?|visits|views?|hits|page views|online( users)?|total visitors?)\s*[:\-]?\s*[\d,]+/gi, '')
    .replace(/\b\d{1,2}:\d{2}(:\d{2})?\s*(am|pm)?\b/gi, '')
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

/** Dates that appear near words like "deadline" or "last date". Only this year and next. */
function findDeadlineDates(text) {
  const year = new Date().getFullYear()
  const years = `(?:${year}|${year + 1})`
  const date = `(?:\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS}),?\\s+${years}|(?:${MONTHS})\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+${years})`
  const re = new RegExp(`(deadline|last date|closing date|closes|apply by|applications? (?:open|close)[a-z]*)[^.]{0,80}?${date}`, 'gi')
  return unique([...text.matchAll(re)].map((m) => m[0].replace(/\s+/g, ' ').slice(0, 140)))
}

function extractLinks(html, baseUrl) {
  const links = []
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      links.push({ href: new URL(m[1], baseUrl).href, text: htmlToText(m[2]).slice(0, 120) })
    } catch {
      // ignore bad links
    }
  }
  return links
}

/** Words from the program name to look for on its page, e.g. ["Chevening"]. */
function distinctiveWords(name) {
  const generic = /^(scholarships?|programm?e?s?|fund|funding|program|education|educational|endowment|undergraduate|international|government|national|need|based|foundation|pakistan|university|award|awards|the|and|for)$/i
  const words = name.split(/[^\p{L}\p{N}-]+/u).filter((w) => w.length >= 4 && !generic.test(w))
  return [...new Set(words)].sort((a, b) => b.length - a.length).slice(0, 3)
}

/** Lower-case and drop accents, so "Bursları" matches "burslari". */
function fold(text) {
  return text.toLocaleLowerCase('en').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isOfficial(url) {
  const host = hostOf(url)
  return OFFICIAL_SUFFIXES.some((s) => host.endsWith(s))
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** "admissions.nust.edu.pk" -> "nust.edu.pk"; "pk.linkedin.com" -> "linkedin.com" */
function baseDomain(host) {
  const parts = host.split('.')
  const twoLevel = /^(gov|edu|ac|org|com|net|go|co)$/.test(parts[parts.length - 2] ?? '') && parts.length >= 3
  return parts.slice(twoLevel ? -3 : -2).join('.')
}

function renderReport(items, found) {
  const icon = { ok: '✅', warning: '⚠️', problem: '❌' }
  const lines = [
    `# MyRehbar check: ${today}`,
    '',
    `✅ ${count('ok')} look fine · ⚠️ ${count('warning')} need a look · ❌ ${count('problem')} have problems`,
    '',
    '**How to use this report:** fix ❌ first (broken links). For ⚠️, open the official page and compare it with what the website says. After you have checked an entry by hand, run `npm run verify -- <slug>` to stamp today\'s date on it, then commit and push.',
    '',
  ]
  if (found.length) {
    lines.push('## ★ New links on watched pages', '', 'These appeared since your last run. They might be new scholarships. Check each one before adding it to `src/data/scholarships.json`.', '')
    for (const d of found) {
      lines.push(`**${d.page.label}** (${d.page.url})`, '')
      for (const l of d.links.slice(0, 30)) lines.push(`- [${l.text || l.href}](${l.href})`)
      lines.push('')
    }
  }
  for (const group of unique(items.map((i) => i.group))) {
    lines.push(`## ${group}`, '')
    const inGroup = items.filter((i) => i.group === group).sort((a, b) => rank(a.level) - rank(b.level))
    for (const f of inGroup) {
      lines.push(`### ${icon[f.level]} ${f.name}`, '', `\`${f.slug}\` · main link: ${f.main ?? '—'}${f.lastVerified ? ` · last checked by a person: ${f.lastVerified}` : ''}`, '')
      for (const p of f.problems) lines.push(`- ❌ ${p}`)
      for (const w of f.warnings) lines.push(`- ⚠️ ${w}`)
      for (const n of f.notes) lines.push(`- ℹ️ ${n}`)
      if (f.dates.length) {
        lines.push('- 📅 Dates seen on the official pages (compare with our data):')
        for (const d of f.dates) lines.push(`  - ${d}`)
      }
      if (!f.problems.length && !f.warnings.length && !f.notes.length && !f.dates.length) lines.push('- All links work and nothing changed.')
      lines.push('')
    }
  }
  return lines.join('\n')
}

function rank(level) {
  return { problem: 0, warning: 1, ok: 2 }[level]
}

async function runPool(items, size, worker) {
  const queue = [...items]
  await Promise.all(Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) await worker(queue.shift())
  }))
}

function unique(list) {
  return [...new Set(list.filter(Boolean))]
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86_400_000)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
