/**
 * Builds each application's step-by-step plan, and the calendar, from its deadline.
 *
 * Every step is dated by counting back from the application deadline. If the deadline is
 * not known yet, a typical one for the semester is used and marked "estimated".
 * The offsets below are a sensible default for master's applications; people can change any date.
 */
import type { Application, AppColor, Group, Milestone, Requirements, Semester, TestKind, TestPlan, TrackerData } from './model'
import { newId } from './model'
import type { TrackerText } from './text'

/* ---------------- Dates ---------------- */

export function toIso(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, days: number): string {
  const date = fromIso(iso)
  date.setDate(date.getDate() + days)
  return toIso(date)
}

export function todayIso(): string {
  return toIso(new Date())
}

/** Whole days from today. Negative = in the past. */
export function daysFromToday(iso: string): number {
  return Math.round((fromIso(iso).getTime() - fromIso(todayIso()).getTime()) / 86_400_000)
}

/** "today", "in 3 days", "5 days ago" */
export function relativeDay(iso: string, tt: TrackerText): string {
  const days = daysFromToday(iso)
  const s = tt.tracker.summary
  if (days === 0) return s.today
  if (days === 1) return s.tomorrow
  if (days < 0) return s.daysAgo.replace('{days}', String(-days))
  return s.inDays.replace('{days}', String(days))
}

/** A typical deadline: mid-December before a fall start, mid-September before a spring start. */
export function estimateDeadline(sem: Semester): string {
  return sem.season === 'fall' ? `${sem.year - 1}-12-15` : `${sem.year - 1}-09-15`
}

/** The next fall semester that is still realistic to apply for: this year's until May, then next year's. */
export function defaultSemester(): Semester {
  const now = new Date()
  return { season: 'fall', year: now.getMonth() <= 4 ? now.getFullYear() : now.getFullYear() + 1 }
}

/* ---------------- Requirements ---------------- */

/** Sensible defaults by country. People tick or untick before the steps are built. */
export function defaultRequirements(country: string, kind: Application['kind']): Requirements {
  const c = country.toLowerCase()
  const germany = /german|deutschland/.test(c)
  const us = /united states|usa|america/.test(c)
  return {
    englishTest: !/pakistan/.test(c),
    gre: us,
    essay: kind === 'scholarship' ? 'sop' : germany ? 'motivation' : 'sop',
    lors: us ? 3 : 2,
    vpd: germany,
    attestation: true,
    interview: kind === 'scholarship',
  }
}

const COLORS: AppColor[] = ['mint', 'blue', 'violet', 'pink', 'orange', 'amber', 'red', 'slate']

/** The least-used colour, so new applications are easy to tell apart. */
export function nextColor(apps: Application[]): AppColor {
  const counts = new Map(COLORS.map((c) => [c, 0]))
  for (const a of apps) counts.set(a.color, (counts.get(a.color) ?? 0) + 1)
  return COLORS.reduce((best, c) => ((counts.get(c) ?? 0) < (counts.get(best) ?? 0) ? c : best), COLORS[0])
}

/* ---------------- Steps ---------------- */

interface Step {
  key: string
  title: string
  group: Group
  /** Days before (-) or after (+) the deadline. undefined = no date */
  offset?: number
  test?: TestKind
}

function steps(app: Pick<Application, 'kind' | 'requirements'>, t: TrackerText, tests: TestPlan[]): Step[] {
  const m = t.milestones
  const r = app.requirements
  const essay = r.essay === 'motivation' ? m.essayMotivation : m.essaySop
  const testDone = (kind: TestKind) => tests.some((x) => x.kind === kind && (x.status === 'done' || x.status === 'not-needed'))
  const list: Step[] = [
    { key: 'requirements', title: m.requirements, group: 'research', offset: -180 },
    app.kind === 'scholarship'
      ? { key: 'eligibility', title: m.eligibility, group: 'research', offset: -150 }
      : { key: 'shortlist', title: m.shortlist, group: 'research', offset: -150 },
  ]
  if (r.englishTest && !testDone('english')) list.push({ key: 'englishReady', title: m.englishReady, group: 'tests', offset: -28, test: 'english' })
  if (r.gre && !testDone('gre')) list.push({ key: 'greReady', title: m.greReady, group: 'tests', offset: -28, test: 'gre' })
  list.push({ key: 'transcripts', title: m.transcripts, group: 'documents', offset: -90 })
  if (r.attestation) list.push({ key: 'attestation', title: m.attestation, group: 'documents', offset: -75 })
  list.push({ key: 'passport', title: m.passport, group: 'documents', offset: -90 })
  list.push({ key: 'cv', title: m.cv, group: 'documents', offset: -45 })
  if (r.essay !== 'none') {
    list.push(
      { key: 'essayOutline', title: m.essayOutline.replace('{essay}', essay), group: 'essay', offset: -70 },
      { key: 'essayDraft', title: m.essayDraft.replace('{essay}', essay), group: 'essay', offset: -49 },
      { key: 'essayFeedback', title: m.essayFeedback.replace('{essay}', essay), group: 'essay', offset: -35 },
      { key: 'essayFinal', title: m.essayFinal.replace('{essay}', essay), group: 'essay', offset: -21 },
    )
  }
  if (r.lors > 0) {
    list.push(
      { key: 'lorAsk', title: m.lorAsk.replace('{count}', String(r.lors)), group: 'lor', offset: -56 },
      { key: 'lorSend', title: m.lorSend, group: 'lor', offset: -49 },
      { key: 'lorRemind', title: m.lorRemind, group: 'lor', offset: -21 },
      { key: 'lorDone', title: m.lorDone, group: 'lor', offset: -7 },
    )
  }
  if (r.vpd) {
    list.push(
      { key: 'vpdAccount', title: m.vpdAccount, group: 'portal', offset: -84 },
      { key: 'vpdSubmit', title: m.vpdSubmit, group: 'portal', offset: -63 },
      { key: 'vpdUpload', title: m.vpdUpload, group: 'portal', offset: -14 },
    )
  }
  list.push({ key: 'account', title: m.account, group: 'application', offset: -60 })
  list.push({ key: 'form', title: m.form, group: 'application', offset: -21 })
  if (app.kind === 'scholarship') list.push({ key: 'scholarshipEssay', title: m.scholarshipEssay, group: 'scholarship', offset: -35 })
  else list.push({ key: 'fee', title: m.fee, group: 'application', offset: -10 })
  list.push({ key: 'submit', title: m.submit, group: app.kind === 'scholarship' ? 'scholarship' : 'application', offset: -3 })
  if (r.interview) list.push({ key: 'interview', title: m.interview, group: 'after' })
  list.push({ key: 'decision', title: m.decision, group: 'after' })
  if (app.kind === 'program') {
    list.push(
      { key: 'accept', title: m.accept, group: 'after' },
      { key: 'visa', title: m.visa, group: 'after' },
      { key: 'housing', title: m.housing, group: 'after' },
    )
  }
  return list
}

const PLAN_DAYS = 180

/**
 * The full suggested plan for an application.
 * If the deadline is less than 6 months away, the steps are squeezed into the time left
 * (in the same order), instead of starting the plan with a wall of overdue steps.
 */
export function buildMilestones(
  app: Pick<Application, 'kind' | 'requirements' | 'deadline' | 'semester'>,
  t: TrackerText,
  tests: TestPlan[],
): Milestone[] {
  const deadline = app.deadline ?? estimateDeadline(app.semester)
  const left = daysFromToday(deadline)
  const scale = left > 0 && left < PLAN_DAYS ? left / PLAN_DAYS : 1
  return steps(app, t, tests).map((s) => ({
    id: newId(),
    title: s.title,
    group: s.group,
    due: s.offset === undefined ? undefined : addDays(deadline, Math.round(s.offset * scale)),
    done: false,
    ...(s.test ? { test: s.test } : {}),
  }))
}

/** Suggested steps that this application does not have yet (matched by name). */
export function missingMilestones(app: Application, t: TrackerText, tests: TestPlan[]): Milestone[] {
  const have = new Set(app.milestones.map((m) => m.title.trim().toLowerCase()))
  return buildMilestones(app, t, tests).filter((m) => !have.has(m.title.trim().toLowerCase()))
}

/**
 * When the deadline changes, move every dated step by the same number of days,
 * so the plan keeps its shape. Steps already done keep their dates.
 */
export function shiftMilestones(app: Application, newDeadline: string): Milestone[] {
  const old = app.deadline ?? estimateDeadline(app.semester)
  const diff = Math.round((fromIso(newDeadline).getTime() - fromIso(old).getTime()) / 86_400_000)
  if (!diff) return app.milestones
  return app.milestones.map((m) => (m.due && !m.done ? { ...m, due: addDays(m.due, diff) } : m))
}

/* ---------------- Urgency and calendar ---------------- */

export type Urgency = 'done' | 'overdue' | 'week' | 'month' | 'later'

export function urgency(date: string, done: boolean): Urgency {
  if (done) return 'done'
  const days = daysFromToday(date)
  if (days < 0) return 'overdue'
  if (days <= 7) return 'week'
  if (days <= 30) return 'month'
  return 'later'
}

/** Tailwind classes for each urgency. Text colours pass WCAG AA on their backgrounds. */
export const URGENCY_CLASSES: Record<Urgency, { chip: string; dot: string }> = {
  overdue: { chip: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-700' },
  week: { chip: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-700' },
  month: { chip: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-700' },
  later: { chip: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-700' },
  done: { chip: 'bg-mint-50 text-mint-900 border-mint-200 line-through', dot: 'bg-mint-700' },
}

/** Solid, light and border classes per application colour. */
export const APP_COLOR_CLASSES: Record<AppColor, { solid: string; soft: string; border: string }> = {
  mint: { solid: 'bg-mint-700', soft: 'bg-mint-50', border: 'border-mint-700' },
  blue: { solid: 'bg-blue-700', soft: 'bg-blue-50', border: 'border-blue-700' },
  violet: { solid: 'bg-violet-700', soft: 'bg-violet-50', border: 'border-violet-700' },
  pink: { solid: 'bg-pink-700', soft: 'bg-pink-50', border: 'border-pink-700' },
  orange: { solid: 'bg-orange-700', soft: 'bg-orange-50', border: 'border-orange-700' },
  amber: { solid: 'bg-amber-700', soft: 'bg-amber-50', border: 'border-amber-700' },
  red: { solid: 'bg-red-700', soft: 'bg-red-50', border: 'border-red-700' },
  slate: { solid: 'bg-slate', soft: 'bg-paper', border: 'border-slate' },
}

export interface CalEvent {
  id: string
  date: string
  title: string
  /** e.g. the application name */
  context: string
  appId?: string
  color?: AppColor
  kind: 'deadline' | 'milestone' | 'test' | 'column'
  done: boolean
  milestoneId?: string
}

export function collectEvents(data: TrackerData, t: TrackerText): CalEvent[] {
  const events: CalEvent[] = []
  const dateColumns = data.columns.filter((c) => c.type === 'date')
  for (const app of data.applications) {
    const context = app.program ? `${app.name} · ${app.program}` : app.name
    const closed = app.status === 'rejected' || app.status === 'withdrawn'
    const deadline = app.deadline ?? estimateDeadline(app.semester)
    const submitted = ['submitted', 'interview', 'offer', 'accepted'].includes(app.status)
    events.push({ id: `${app.id}-deadline`, date: deadline, title: t.calendar.deadline, context, appId: app.id, color: app.color, kind: 'deadline', done: submitted || closed })
    for (const m of app.milestones) {
      if (!m.due) continue
      events.push({ id: `${app.id}-${m.id}`, date: m.due, title: m.title, context, appId: app.id, color: app.color, kind: 'milestone', done: m.done || closed, milestoneId: m.id })
    }
    for (const c of dateColumns) {
      const v = app.values[c.id]
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
        events.push({ id: `${app.id}-col-${c.id}`, date: v, title: c.name, context, appId: app.id, color: app.color, kind: 'column', done: closed })
      }
    }
  }
  for (const test of data.tests) {
    const done = test.status === 'done' || test.status === 'not-needed'
    if (test.prepStart) events.push({ id: `${test.id}-prep`, date: test.prepStart, title: t.calendar.prepStart, context: test.name, kind: 'test', done: done || test.status !== 'not-started' })
    if (test.testDate) events.push({ id: `${test.id}-day`, date: test.testDate, title: t.calendar.testDay, context: test.name, kind: 'test', done })
  }
  return events.sort((a, b) => a.date.localeCompare(b.date))
}

/** The first step not done yet, by date. */
export function nextMilestone(app: Application): Milestone | undefined {
  return app.milestones
    .filter((m) => !m.done)
    .sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999'))[0]
}
