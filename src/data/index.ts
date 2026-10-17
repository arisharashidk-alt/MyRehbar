/**
 * Loads the JSON data files and cleans them up, so a missing optional field
 * (or a small typo) never crashes a page. Bad entries are skipped with a warning
 * in the browser console during development.
 */
import rehbarsFile from './rehbars.json'
import scholarshipsFile from './scholarships.json'
import type { FieldId, FundingType, HelpId, LevelId, Rehbar, Scholarship } from '../types'

const FIELDS: FieldId[] = ['engineering', 'medicine', 'business', 'cs', 'arts', 'social-sciences', 'law', 'sciences']
const LEVELS: LevelId[] = ['school', 'undergraduate', 'masters', 'phd', 'exchange']
const HELPS: HelpId[] = ['choosing-field', 'applications', 'essays', 'interviews', 'english-tests', 'university-life']

type Raw = Record<string, unknown>

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')
const bool = (v: unknown): boolean => v === true
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []
const oneOf = <T extends string>(v: unknown, allowed: T[]): v is T =>
  typeof v === 'string' && (allowed as string[]).includes(v)

function warn(message: string) {
  if (import.meta.env.DEV) console.warn(`[MyRehbar data] ${message}`)
}

function toRehbar(raw: Raw, index: number): Rehbar | null {
  const slug = str(raw.slug)
  const name = str(raw.name)
  if (!slug || !name) {
    warn(`rehbars.json entry #${index + 1} is missing "slug" or "name" and was skipped.`)
    return null
  }
  if (!oneOf(raw.field, FIELDS)) warn(`Rehbar "${slug}" has an unknown field "${String(raw.field)}".`)
  return {
    slug,
    name,
    photo: str(raw.photo) || undefined,
    university: str(raw.university),
    country: str(raw.country),
    city: str(raw.city) || undefined,
    age: typeof raw.age === 'number' && raw.age >= 10 && raw.age < 100 ? Math.round(raw.age) : undefined,
    field: oneOf(raw.field, FIELDS) ? raw.field : 'arts',
    program: str(raw.program) || undefined,
    story: str(raw.story),
    fullStory: strList(raw.fullStory),
    languages: strList(raw.languages),
    tags: strList(raw.tags),
    woman: bool(raw.woman),
    scholarshipRecipient: bool(raw.scholarshipRecipient),
    helpsWith: strList(raw.helpsWith).filter((h): h is HelpId => oneOf(h, HELPS)),
    availability: str(raw.availability) || undefined,
    linkedin: linkedinUrl(raw.linkedin, slug),
    featured: bool(raw.featured),
    sample: bool(raw.sample),
  }
}

/** Only https links to linkedin.com (any country subdomain, e.g. pk.linkedin.com) are shown. */
function linkedinUrl(value: unknown, slug: string): string | undefined {
  const s = str(value)
  if (!s) return undefined
  try {
    const url = new URL(/^https?:\/\//.test(s) ? s : `https://${s}`)
    if (url.protocol === 'https:' && (url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com'))) return url.href
  } catch {
    // fall through
  }
  warn(`Rehbar "${slug}" has a linkedin value that is not a linkedin.com link, so it was hidden.`)
  return undefined
}

function toScholarship(raw: Raw, index: number): Scholarship | null {
  const slug = str(raw.slug)
  const name = str(raw.name)
  if (!slug || !name) {
    warn(`scholarships.json entry #${index + 1} is missing "slug" or "name" and was skipped.`)
    return null
  }
  const deadline = str(raw.deadline)
  if (deadline && !parseDate(deadline)) warn(`Scholarship "${slug}" has an invalid deadline "${deadline}". Use YYYY-MM-DD.`)
  return {
    slug,
    name,
    provider: str(raw.provider),
    country: str(raw.country),
    levels: strList(raw.levels).filter((l): l is LevelId => oneOf(l, LEVELS)),
    fundingType: (raw.fundingType === 'full' ? 'full' : 'partial') as FundingType,
    eligibility: str(raw.eligibility),
    description: str(raw.description) || undefined,
    covers: strList(raw.covers),
    howToApply: strList(raw.howToApply),
    officialUrl: str(raw.officialUrl),
    applicationWindow: str(raw.applicationWindow) || undefined,
    deadline: parseDate(deadline) ? deadline : null,
    lastVerified: parseDate(str(raw.lastVerified)) ? str(raw.lastVerified) : null,
    openToPakistani: raw.openToPakistani === true,
    sources: strList(raw.sources).filter((u) => u.startsWith('https://')),
    regions: strList(raw.regions),
    featured: bool(raw.featured),
    sample: bool(raw.sample),
  }
}

function load<T>(list: unknown, map: (raw: Raw, i: number) => T | null): T[] {
  if (!Array.isArray(list)) return []
  return list
    .map((item, i) => (item && typeof item === 'object' ? map(item as Raw, i) : null))
    .filter((x): x is T => x !== null)
}

export const rehbars: Rehbar[] = load(rehbarsFile.rehbars, toRehbar)
// MyRehbar only lists scholarships that Pakistani students can apply for.
export const scholarships: Scholarship[] = load(scholarshipsFile.scholarships, toScholarship).filter((s) => s.openToPakistani)

export const getRehbar = (slug: string | undefined) => rehbars.find((r) => r.slug === slug)
export const getScholarship = (slug: string | undefined) => scholarships.find((s) => s.slug === slug)

/** Featured items first, then fill up to `count` with the rest. */
export function pickFeatured<T extends { featured?: boolean }>(items: T[], count = 3): T[] {
  return [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)].slice(0, count)
}

/* ---------- Dates ---------- */

/** Parse "YYYY-MM-DD" as a local date (avoids time-zone shifts). Returns null if invalid. */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: string | null | undefined, lang: string): string | null {
  const date = parseDate(value)
  if (!date) return null
  return date.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Whole days from today until the date. Negative = in the past. */
export function daysUntil(value: string | null | undefined): number | null {
  const date = parseDate(value)
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((date.getTime() - today.getTime()) / 86_400_000)
}
