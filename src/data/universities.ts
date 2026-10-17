/**
 * Loads src/data/universities.json and cleans it up so a missing field never crashes a page.
 * Kept separate from data/index.ts so only the university pages download this data.
 */
import file from './universities.json'
import type { AidProgram, AidType, MedicalProcess, UniCategory, University } from '../types'

type Raw = Record<string, unknown>

const CATEGORIES: UniCategory[] = ['engineering', 'medical', 'business', 'general']
const AID_TYPES: AidType[] = ['need-based', 'merit', 'loan', 'outreach', 'external']

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const opt = (v: unknown) => str(v) || undefined
const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : [])
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined)
const bool = (v: unknown) => (typeof v === 'boolean' ? v : undefined)
/** Only https links are shown. */
const url = (v: unknown) => {
  const s = str(v)
  return /^https:\/\/[^\s]+$/.test(s) ? s : undefined
}
const obj = (v: unknown): Raw | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : null)

function toAid(raw: Raw): AidProgram | null {
  const name = str(raw.name)
  if (!name) return null
  return {
    name,
    type: AID_TYPES.includes(raw.type as AidType) ? (raw.type as AidType) : 'need-based',
    covers: list(raw.covers),
    coversHostel: bool(raw.coversHostel),
    amount: opt(raw.amount),
    whoCanApply: opt(raw.whoCanApply),
    howToApply: list(raw.howToApply),
    sourceUrl: url(raw.sourceUrl),
  }
}

function toUniversity(raw: Raw): University | null {
  const slug = str(raw.slug)
  const name = str(raw.name)
  const website = url(raw.website)
  if (!slug || !name || !website) {
    if (import.meta.env.DEV) console.warn(`[MyRehbar data] university "${slug || name}" is missing slug, name or an https website and was skipped.`)
    return null
  }
  const hostel = obj(raw.hostel)
  const costs = obj(raw.costs)
  const categories = list(raw.categories).filter((c): c is UniCategory => CATEGORIES.includes(c as UniCategory))
  return {
    slug,
    name,
    shortName: opt(raw.shortName),
    city: str(raw.city),
    province: opt(raw.province),
    sector: raw.sector === 'private' ? 'private' : 'public',
    categories: categories.length ? categories : ['general'],
    website,
    admissionsUrl: url(raw.admissionsUrl),
    financialAidUrl: url(raw.financialAidUrl),
    feesUrl: url(raw.feesUrl),
    about: opt(raw.about),
    admissionSteps: list(raw.admissionSteps),
    hostel: hostel ? { available: bool(hostel.available), notes: opt(hostel.notes), sourceUrl: url(hostel.sourceUrl) } : undefined,
    costs: costs
      ? {
          academicYear: opt(costs.academicYear),
          tuitionPerYear: num(costs.tuitionPerYear),
          hostelPerYear: num(costs.hostelPerYear),
          otherNotes: opt(costs.otherNotes),
          sourceUrl: url(costs.sourceUrl),
        }
      : undefined,
    aid: (Array.isArray(raw.aid) ? raw.aid : []).map((a) => (obj(a) ? toAid(a as Raw) : null)).filter((a): a is AidProgram => a !== null),
    sources: list(raw.sources).filter((s) => s.startsWith('https://')),
    lastVerified: /^\d{4}-\d{2}-\d{2}$/.test(str(raw.lastVerified)) ? str(raw.lastVerified) : null,
  }
}

const rawList = Array.isArray(file.universities) ? (file.universities as unknown[]) : []
export const universities: University[] = rawList
  .map((u) => (obj(u) ? toUniversity(u as Raw) : null))
  .filter((u): u is University => u !== null)
  .sort((a, b) => (a.shortName ?? a.name).localeCompare(b.shortName ?? b.name))

export const getUniversity = (slug: string | undefined) => universities.find((u) => u.slug === slug)

const mp = obj(file.medicalProcess)
export const medicalProcess: MedicalProcess | null = mp
  ? {
      mdcat: opt(mp.mdcat),
      provinces: (Array.isArray(mp.provinces) ? mp.provinces : [])
        .map((p) => obj(p))
        .filter((p): p is Raw => p !== null && !!str(p.province) && !!str(p.explanation))
        .map((p) => ({ province: str(p.province), explanation: str(p.explanation), url: url(p.url) })),
      officialListUrl: url(mp.officialListUrl),
      sources: list(mp.sources),
    }
  : null

/** Lowest-cost reading of the costs, for "home vs hostel" comparisons. */
export function costTotals(u: University) {
  const tuition = u.costs?.tuitionPerYear
  const hostel = u.costs?.hostelPerYear
  return {
    home: tuition,
    withHostel: tuition !== undefined && hostel !== undefined ? tuition + hostel : undefined,
  }
}
