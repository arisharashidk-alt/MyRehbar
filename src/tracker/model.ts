/**
 * The shape of one person's tracker, as saved (as JSON) in their row of the "Tracker data" tab.
 *
 * normalise() checks everything loaded from the server, field by field, so a damaged or
 * hand-edited row can never crash the page or put unsafe links or images on it.
 * If you add a field, add it to normalise() too.
 */

export type Status = 'researching' | 'preparing' | 'submitted' | 'interview' | 'offer' | 'accepted' | 'rejected' | 'withdrawn'
export const STATUSES: Status[] = ['researching', 'preparing', 'submitted', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn']

export type Season = 'fall' | 'spring'
export interface Semester {
  season: Season
  year: number
}

export type Group = 'research' | 'tests' | 'documents' | 'essay' | 'lor' | 'portal' | 'application' | 'scholarship' | 'after'
export const GROUPS: Group[] = ['research', 'tests', 'documents', 'essay', 'lor', 'portal', 'application', 'scholarship', 'after']

export type TestKind = 'english' | 'gre'

export interface Milestone {
  id: string
  title: string
  group: Group
  /** "YYYY-MM-DD" */
  due?: string
  done: boolean
  /** Ticked automatically when this test is marked done on the Tests tab */
  test?: TestKind
}

export type ColumnType = 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'link'
export const COLUMN_TYPES: ColumnType[] = ['text', 'number', 'date', 'checkbox', 'select', 'link']

/** A column the person added to the applications table. Date columns also show on the calendar. */
export interface Column {
  id: string
  name: string
  type: ColumnType
  options: string[]
}

/** A field for one application only, e.g. "Portfolio: 3 projects" */
export interface ExtraField {
  id: string
  label: string
  value: string
}

export interface Requirements {
  englishTest: boolean
  gre: boolean
  essay: 'sop' | 'motivation' | 'none'
  lors: number
  /** Germany: uni-assist and its VPD */
  vpd: boolean
  /** HEC / IBCC attestation of degrees and transcripts */
  attestation: boolean
  interview: boolean
}

export type AppColor = 'mint' | 'blue' | 'violet' | 'pink' | 'orange' | 'amber' | 'red' | 'slate'
export const APP_COLORS: AppColor[] = ['mint', 'blue', 'violet', 'pink', 'orange', 'amber', 'red', 'slate']

export interface Application {
  id: string
  kind: 'program' | 'scholarship'
  /** Added from the MyRehbar directory */
  source?: { type: 'university' | 'scholarship'; slug: string }
  name: string
  program: string
  country: string
  semester: Semester
  /** "YYYY-MM-DD" */
  deadline?: string
  /** true until the person enters the real deadline */
  deadlineEstimated: boolean
  status: Status
  starred: boolean
  color: AppColor
  url: string
  notes: string
  requirements: Requirements
  milestones: Milestone[]
  /** Values for the person's own columns, by column id */
  values: Record<string, string | boolean>
  extra: ExtraField[]
  createdAt: string
}

export type TestStatus = 'not-started' | 'preparing' | 'booked' | 'done' | 'not-needed'
export const TEST_STATUSES: TestStatus[] = ['not-started', 'preparing', 'booked', 'done', 'not-needed']

export interface TestPlan {
  id: string
  kind: TestKind
  /** e.g. IELTS Academic, TOEFL iBT, GRE */
  name: string
  status: TestStatus
  prepStart?: string
  testDate?: string
  score: string
}

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'white'
export const NOTE_COLORS: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'white']

/** A sticky note on the softboard. With appId it shows that application's card. */
export interface Note {
  id: string
  x: number
  y: number
  color: NoteColor
  text: string
  appId?: string
  /** Small JPEG thumbnail as a data: URL (made in the browser, see images.ts) */
  image?: string
}

export interface Thread {
  id: string
  from: string
  to: string
}

export interface TrackerData {
  schema: 1
  target: Semester | null
  tests: TestPlan[]
  columns: Column[]
  applications: Application[]
  notes: Note[]
  threads: Thread[]
}

export const BOARD_WIDTH = 2400
export const BOARD_HEIGHT = 1600
export const NOTE_WIDTH = 208

export const LIMITS = {
  text: 200,
  longText: 5000,
  applications: 200,
  milestones: 80,
  columns: 40,
  extra: 40,
  notes: 300,
  threads: 600,
  /** Characters of JSON. The server refuses more than 1,500,000. */
  data: 1_450_000,
}

export function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9))
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 14)
}

export function emptyTracker(): TrackerData {
  return { schema: 1, target: null, tests: [], columns: [], applications: [], notes: [], threads: [] }
}

/* ---------------- Checking loaded data ---------------- */

type Raw = Record<string, unknown>
const obj = (v: unknown): Raw | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : null)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const str = (v: unknown, max = LIMITS.text) => (typeof v === 'string' ? v.slice(0, max) : '')
const oneOf = <T extends string>(v: unknown, list: readonly T[], fallback: T): T => (list.includes(v as T) ? (v as T) : fallback)
const id = (v: unknown) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : newId())
const num = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback

/** "YYYY-MM-DD" or undefined */
export function cleanDate(v: unknown): string | undefined {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) ? v : undefined
}

/** Only http(s) links are ever turned into clickable links. */
export function safeUrl(v: unknown): string {
  const s = str(v, 2000).trim()
  return /^https?:\/\/[^\s"'<>]+$/i.test(s) ? s : ''
}

/** Only small JPEG/PNG/WebP data: URLs we made ourselves are shown as images. */
export function safeImage(v: unknown): string | undefined {
  return typeof v === 'string' && v.length < 200_000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(v) ? v : undefined
}

function semester(v: unknown): Semester | null {
  const o = obj(v)
  if (!o) return null
  return { season: oneOf(o.season, ['fall', 'spring'] as const, 'fall'), year: num(o.year, 2000, 2100, new Date().getFullYear() + 1) }
}

function requirements(v: unknown): Requirements {
  const o = obj(v) ?? {}
  return {
    englishTest: o.englishTest !== false,
    gre: o.gre === true,
    essay: oneOf(o.essay, ['sop', 'motivation', 'none'] as const, 'sop'),
    lors: num(o.lors, 0, 5, 2),
    vpd: o.vpd === true,
    attestation: o.attestation !== false,
    interview: o.interview === true,
  }
}

function milestone(v: unknown): Milestone | null {
  const o = obj(v)
  if (!o) return null
  const title = str(o.title)
  const test = oneOf(o.test, ['english', 'gre', ''] as const, '')
  return { id: id(o.id), title, group: oneOf(o.group, GROUPS, 'application'), due: cleanDate(o.due), done: o.done === true, ...(test ? { test } : {}) }
}

function application(v: unknown, columnIds: Set<string>): Application | null {
  const o = obj(v)
  if (!o) return null
  const name = str(o.name) || '—'
  const src = obj(o.source)
  const values: Record<string, string | boolean> = {}
  for (const [k, val] of Object.entries(obj(o.values) ?? {})) {
    if (!columnIds.has(k)) continue
    if (typeof val === 'boolean') values[k] = val
    else if (typeof val === 'string') values[k] = val.slice(0, LIMITS.longText)
  }
  return {
    id: id(o.id),
    kind: o.kind === 'scholarship' ? 'scholarship' : 'program',
    source:
      src && (src.type === 'university' || src.type === 'scholarship') && typeof src.slug === 'string' && /^[\w-]{1,80}$/.test(src.slug)
        ? { type: src.type, slug: src.slug }
        : undefined,
    name,
    program: str(o.program),
    country: str(o.country),
    semester: semester(o.semester) ?? { season: 'fall', year: new Date().getFullYear() + 1 },
    deadline: cleanDate(o.deadline),
    deadlineEstimated: o.deadlineEstimated === true,
    status: oneOf(o.status, STATUSES, 'researching'),
    starred: o.starred === true,
    color: oneOf(o.color, APP_COLORS, 'mint'),
    url: safeUrl(o.url),
    notes: str(o.notes, LIMITS.longText),
    requirements: requirements(o.requirements),
    milestones: arr(o.milestones).map(milestone).filter((m): m is Milestone => m !== null).slice(0, LIMITS.milestones),
    values,
    extra: arr(o.extra)
      .map((e) => {
        const x = obj(e)
        return x ? { id: id(x.id), label: str(x.label), value: str(x.value, LIMITS.longText) } : null
      })
      .filter((e): e is ExtraField => e !== null)
      .slice(0, LIMITS.extra),
    createdAt: typeof o.createdAt === 'string' ? o.createdAt.slice(0, 30) : new Date().toISOString(),
  }
}

export function normalise(input: unknown): TrackerData {
  const o = obj(input)
  if (!o) return emptyTracker()
  const columns: Column[] = arr(o.columns)
    .map((c) => {
      const x = obj(c)
      if (!x) return null
      return {
        id: id(x.id),
        name: str(x.name) || '—',
        type: oneOf(x.type, COLUMN_TYPES, 'text'),
        options: arr(x.options).map((s) => str(s)).filter(Boolean).slice(0, 30),
      }
    })
    .filter((c): c is Column => c !== null)
    .slice(0, LIMITS.columns)
  const columnIds = new Set(columns.map((c) => c.id))
  const applications = arr(o.applications)
    .map((a) => application(a, columnIds))
    .filter((a): a is Application => a !== null)
    .slice(0, LIMITS.applications)
  const appIds = new Set(applications.map((a) => a.id))
  const notes: Note[] = arr(o.notes)
    .map((n): Note | null => {
      const x = obj(n)
      if (!x) return null
      const appId = typeof x.appId === 'string' && appIds.has(x.appId) ? x.appId : undefined
      return {
        id: id(x.id),
        x: num(x.x, 0, BOARD_WIDTH - NOTE_WIDTH, 40),
        y: num(x.y, 0, BOARD_HEIGHT - 80, 40),
        color: oneOf(x.color, NOTE_COLORS, 'yellow'),
        text: str(x.text, LIMITS.longText),
        appId,
        image: safeImage(x.image),
      }
    })
    .filter((n): n is Note => n !== null)
    .slice(0, LIMITS.notes)
  const noteIds = new Set(notes.map((n) => n.id))
  const threads: Thread[] = arr(o.threads)
    .map((t) => {
      const x = obj(t)
      return x && typeof x.from === 'string' && typeof x.to === 'string' && noteIds.has(x.from) && noteIds.has(x.to) && x.from !== x.to
        ? { id: id(x.id), from: x.from, to: x.to }
        : null
    })
    .filter((t): t is Thread => t !== null)
    .slice(0, LIMITS.threads)
  const tests: TestPlan[] = arr(o.tests)
    .map((t): TestPlan | null => {
      const x = obj(t)
      if (!x) return null
      return {
        id: id(x.id),
        kind: oneOf(x.kind, ['english', 'gre'] as const, 'english'),
        name: str(x.name) || 'IELTS Academic',
        status: oneOf(x.status, TEST_STATUSES, 'not-started'),
        prepStart: cleanDate(x.prepStart),
        testDate: cleanDate(x.testDate),
        score: str(x.score),
      }
    })
    .filter((t): t is TestPlan => t !== null)
    .slice(0, 20)
  return { schema: 1, target: semester(o.target), tests, columns, applications, notes, threads }
}
