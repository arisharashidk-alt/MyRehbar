#!/usr/bin/env node
/**
 * Export scholarships and universities to CSV files for Google Sheets.
 *
 *   npm run export
 *
 * Creates (in exports/, which stays on your computer):
 *   scholarships-pakistan.csv   scholarships-abroad.csv
 *   universities.csv            university-aid.csv
 *
 * Import each one into your Google Sheet: File -> Import -> Upload ->
 * "Insert new sheet(s)" (first time) or "Replace current sheet" (to update).
 *
 * The website reads from src/data/*.json, NOT from the sheet. The sheet is a copy for your team
 * to read, sort and filter. To change the website, edit the JSON files (or ask Claude), then export again.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'exports')
const SITE = 'https://myrehbar.org'

const { scholarships = [] } = JSON.parse(await readFile(path.join(ROOT, 'src/data/scholarships.json'), 'utf8'))
const { universities = [] } = JSON.parse(await readFile(path.join(ROOT, 'src/data/universities.json'), 'utf8'))

const LEVEL = { school: 'School (Grade 9–12)', undergraduate: 'Undergraduate', masters: "Master's", phd: 'PhD', exchange: 'Exchange' }
const list = (v) => (Array.isArray(v) ? v.filter(Boolean).join('\n') : '')
const steps = (v) => (Array.isArray(v) ? v.map((s, i) => `${i + 1}. ${s}`).join('\n') : '')
const yes = (v) => (v === true ? 'Yes' : v === false ? 'No' : '')

/** One CSV cell. Text starting with = + - @ is prefixed with ' so Sheets never runs it as a formula. */
function cell(value) {
  let text = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function csv(columns, rows) {
  const lines = [columns.map(([header]) => cell(header)).join(',')]
  for (const row of rows) lines.push(columns.map(([, get]) => cell(get(row))).join(','))
  return '﻿' + lines.join('\r\n') + '\r\n' // BOM so Urdu and ü show correctly
}

const scholarshipColumns = [
  ['Name', (s) => s.name],
  ['Provider', (s) => s.provider],
  ['Study in', (s) => s.country],
  ['Only for students from', (s) => list(s.regions) || 'Anywhere in Pakistan'],
  ['Levels', (s) => (s.levels ?? []).map((l) => LEVEL[l] ?? l).join(', ')],
  ['Funding', (s) => (s.fundingType === 'full' ? 'Fully funded' : 'Partial')],
  ['Who can apply', (s) => s.eligibility],
  ['What it pays for', (s) => list(s.covers)],
  ['Application window', (s) => s.applicationWindow],
  ['Deadline', (s) => s.deadline],
  ['How to apply', (s) => steps(s.howToApply)],
  ['Official website', (s) => s.officialUrl],
  ['Sources', (s) => list(s.sources)],
  ['Last verified', (s) => s.lastVerified ?? 'Not verified yet'],
  ['MyRehbar page', (s) => `${SITE}/scholarships/${s.slug}`],
  ['ID (slug)', (s) => s.slug],
]

const universityColumns = [
  ['Short name', (u) => u.shortName],
  ['Name', (u) => u.name],
  ['City', (u) => u.city],
  ['Province', (u) => u.province],
  ['Public / private', (u) => u.sector],
  ['Categories', (u) => (u.categories ?? []).join(', ')],
  ['Fee year', (u) => u.costs?.academicYear],
  ['Tuition per year (PKR)', (u) => u.costs?.tuitionPerYear],
  ['Hostel per year (PKR)', (u) => u.costs?.hostelPerYear],
  ['Total with hostel (PKR)', (u) => (u.costs?.tuitionPerYear && u.costs?.hostelPerYear ? u.costs.tuitionPerYear + u.costs.hostelPerYear : '')],
  ['Fee notes', (u) => u.costs?.otherNotes],
  ['Hostel available', (u) => yes(u.hostel?.available)],
  ['Hostel notes', (u) => u.hostel?.notes],
  ['Number of aid programs', (u) => (u.aid ?? []).length],
  ['Any aid covers hostel', (u) => ((u.aid ?? []).some((a) => a.coversHostel) ? 'Yes' : '')],
  ['How to get in', (u) => steps(u.admissionSteps)],
  ['Website', (u) => u.website],
  ['Admissions page', (u) => u.admissionsUrl],
  ['Financial aid page', (u) => u.financialAidUrl],
  ['Fee page', (u) => u.feesUrl],
  ['Last verified', (u) => u.lastVerified ?? 'Not verified yet'],
  ['MyRehbar page', (u) => `${SITE}/universities/${u.slug}`],
  ['ID (slug)', (u) => u.slug],
]

const aidRows = universities.flatMap((u) => (u.aid ?? []).map((a) => ({ ...a, uni: u })))
const aidColumns = [
  ['University', (a) => a.uni.shortName ?? a.uni.name],
  ['City', (a) => a.uni.city],
  ['Aid program', (a) => a.name],
  ['Type', (a) => a.type],
  ['What it covers', (a) => list(a.covers)],
  ['Covers hostel', (a) => yes(a.coversHostel)],
  ['How much', (a) => a.amount],
  ['Who can apply', (a) => a.whoCanApply],
  ['How to apply', (a) => steps(a.howToApply)],
  ['Official page', (a) => a.sourceUrl],
]

await mkdir(OUT, { recursive: true })
const files = {
  'scholarships-pakistan.csv': csv(scholarshipColumns, scholarships.filter((s) => s.country === 'Pakistan')),
  'scholarships-abroad.csv': csv(scholarshipColumns, scholarships.filter((s) => s.country !== 'Pakistan')),
  'universities.csv': csv(universityColumns, universities),
  'university-aid.csv': csv(aidColumns, aidRows),
}
for (const [name, content] of Object.entries(files)) await writeFile(path.join(OUT, name), content)

console.log(`\nExported to exports/:`)
console.log(`  scholarships-pakistan.csv  ${scholarships.filter((s) => s.country === 'Pakistan').length} rows`)
console.log(`  scholarships-abroad.csv    ${scholarships.filter((s) => s.country !== 'Pakistan').length} rows`)
console.log(`  universities.csv           ${universities.length} rows`)
console.log(`  university-aid.csv         ${aidRows.length} rows`)
console.log(`\nImport into Google Sheets: File -> Import -> Upload -> "Insert new sheet(s)".\n`)
