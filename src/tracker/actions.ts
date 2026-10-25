/**
 * Small helpers that return a changed copy of the tracker. Pass them to update() from useTracker:
 *   update(patchApp(id, (a) => ({ ...a, starred: !a.starred })))
 */
import type { Application, Milestone, Note, TestKind, TrackerData } from './model'
import { BOARD_HEIGHT, BOARD_WIDTH, LIMITS, NOTE_WIDTH } from './model'
import { estimateDeadline, shiftMilestones } from './plan'

type Change = (d: TrackerData) => TrackerData

export const patchApp =
  (id: string, fn: (a: Application) => Application): Change =>
  (d) => ({ ...d, applications: d.applications.map((a) => (a.id === id ? fn(a) : a)) })

export const patchMilestone = (appId: string, milestoneId: string, fn: (m: Milestone) => Milestone): Change =>
  patchApp(appId, (a) => ({ ...a, milestones: a.milestones.map((m) => (m.id === milestoneId ? fn(m) : m)) }))

/** Delete an application, its card on the softboard and any thread tied to that card. */
export const removeApp =
  (id: string): Change =>
  (d) => {
    const gone = new Set(d.notes.filter((n) => n.appId === id).map((n) => n.id))
    return {
      ...d,
      applications: d.applications.filter((a) => a.id !== id),
      notes: d.notes.filter((n) => !gone.has(n.id)),
      threads: d.threads.filter((t) => !gone.has(t.from) && !gone.has(t.to)),
    }
  }

/** Change the deadline and move the steps that aren't done by the same number of days. */
export function withDeadline(app: Application, deadline: string | undefined): Application {
  if (!deadline) return { ...app, deadline: undefined, deadlineEstimated: true }
  return { ...app, milestones: shiftMilestones(app, deadline), deadline, deadlineEstimated: false }
}

/** Change the semester. With no real deadline, the estimated plan moves with it. */
export function withSemester(app: Application, semester: Application['semester']): Application {
  if (app.deadline && !app.deadlineEstimated) return { ...app, semester }
  const moved = { ...app, milestones: shiftMilestones(app, estimateDeadline(semester)) }
  return { ...moved, semester, deadline: undefined, deadlineEstimated: true }
}

/** Tick every "score ready" step for this test in every application. */
export const completeTestSteps =
  (kind: TestKind): Change =>
  (d) => ({
    ...d,
    applications: d.applications.map((a) =>
      a.milestones.some((m) => m.test === kind && !m.done)
        ? { ...a, milestones: a.milestones.map((m) => (m.test === kind ? { ...m, done: true } : m)) }
        : a,
    ),
  })

/** A free spot near the top-left of what the person can see on the board. */
export function placeNote(notes: Note[], viewX = 0, viewY = 0): { x: number; y: number } {
  for (let i = 0; i < 40; i++) {
    const x = Math.min(BOARD_WIDTH - NOTE_WIDTH - 20, viewX + 40 + (i % 5) * (NOTE_WIDTH + 24))
    const y = Math.min(BOARD_HEIGHT - 220, viewY + 40 + Math.floor(i / 5) * 230)
    if (!notes.some((n) => Math.abs(n.x - x) < 60 && Math.abs(n.y - y) < 60)) return { x, y }
  }
  return { x: viewX + 60, y: viewY + 60 }
}

export const addNote =
  (note: Note): Change =>
  (d) =>
    d.notes.length >= LIMITS.notes ? d : { ...d, notes: [...d.notes, note] }

export const removeNote =
  (id: string): Change =>
  (d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id), threads: d.threads.filter((t) => t.from !== id && t.to !== id) })
