import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '../../data'
import { useI18n } from '../../i18n'
import type { TrackerData } from '../model'
import { patchMilestone } from '../actions'
import { APP_COLOR_CLASSES, URGENCY_CLASSES, addDays, collectEvents, relativeDay, toIso, todayIso, urgency, type CalEvent, type Urgency } from '../plan'
import { useTrackerText } from '../text'
import { chipButtonClass, iconButtonClass } from './ui'

type Update = (fn: (d: TrackerData) => TrackerData) => void

export function UrgencyLegend() {
  const tt = useTrackerText()
  const keys: Urgency[] = ['overdue', 'week', 'month', 'later', 'done']
  return (
    <ul className="flex flex-wrap gap-2 text-xs" aria-label={tt.urgency.legend}>
      {keys.map((k) => (
        <li key={k} className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-semibold ${URGENCY_CLASSES[k].chip.replace('line-through', '')}`}>
          <span aria-hidden className={`h-2 w-2 rounded-full ${URGENCY_CLASSES[k].dot}`} />
          {tt.urgency[k]}
        </li>
      ))}
    </ul>
  )
}

export function CalendarView({ data, update, onOpen, onTests }: { data: TrackerData; update: Update; onOpen: (id: string) => void; onTests: () => void }) {
  const tt = useTrackerText()
  const { lang } = useI18n()
  const c = tt.calendar
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const events = useMemo(() => collectEvents(data, tt), [data, tt])
  const byDate = useMemo(() => {
    const map = new Map<string, CalEvent[]>()
    for (const e of events) map.set(e.date, [...(map.get(e.date) ?? []), e])
    return map
  }, [events])

  const today = todayIso()
  const horizon = addDays(today, 60)
  const upcoming = events.filter((e) => !e.done && e.date <= horizon)

  // Six weeks starting on the Monday on or before the 1st.
  const first = new Date(month)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset)
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  const monthLabel = month.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-GB', { month: 'long', year: 'numeric' })

  const open = (e: CalEvent) => (e.appId ? onOpen(e.appId) : onTests())
  const chip = (e: CalEvent) => URGENCY_CLASSES[urgency(e.date, e.done)].chip

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section aria-labelledby="cal-month" className="rounded-card border border-line bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="cal-month" className="text-xl" aria-live="polite">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-1">
            <button type="button" className={iconButtonClass} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              <ChevronLeft aria-hidden size={20} strokeWidth={1.5} className="rtl:rotate-180" />
              <span className="sr-only">{c.prev}</span>
            </button>
            <button type="button" className={chipButtonClass} onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
              {c.today}
            </button>
            <button type="button" className={iconButtonClass} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              <ChevronRight aria-hidden size={20} strokeWidth={1.5} className="rtl:rotate-180" />
              <span className="sr-only">{c.next}</span>
            </button>
          </div>
        </div>
        <UrgencyLegend />

        <div className="mt-4 overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-7 border-s border-t border-line text-xs">
            {c.weekdays.map((d) => (
              <div key={d} className="border-b border-e border-line bg-paper px-2 py-1 font-semibold text-slate">
                {d}
              </div>
            ))}
            {days.map((d) => {
              const iso = toIso(d)
              const list = byDate.get(iso) ?? []
              const inMonth = d.getMonth() === month.getMonth()
              return (
                <div key={iso} className={`min-h-[96px] border-b border-e border-line p-1 ${inMonth ? 'bg-white' : 'bg-paper text-slate'}`}>
                  <span
                    className={`mb-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 font-semibold ${iso === today ? 'bg-mint-700 text-white' : ''}`}
                    aria-label={formatDate(iso, lang) ?? iso}
                  >
                    {d.getDate()}
                  </span>
                  <ul className="space-y-1">
                    {list.slice(0, 3).map((e) => (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={() => open(e)}
                          title={`${e.title} · ${e.context}`}
                          className={`flex w-full items-center gap-1 truncate rounded border px-1 py-0.5 text-start font-semibold ${chip(e)} ${e.kind === 'deadline' ? 'ring-1 ring-inset ring-current' : ''}`}
                        >
                          <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${e.color ? APP_COLOR_CLASSES[e.color].solid : 'bg-ink'}`} />
                          <span className="truncate">
                            {e.kind === 'deadline' || e.kind === 'test' ? `${e.title}: ${e.context}` : e.title}
                          </span>
                        </button>
                      </li>
                    ))}
                    {list.length > 3 && <li className="px-1 text-slate">{c.more.replace('{count}', String(list.length - 3))}</li>}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="cal-upcoming" className="rounded-card border border-line bg-white p-4">
        <h2 id="cal-upcoming" className="text-xl">
          {c.upcoming}
        </h2>
        <p className="mt-1 text-sm text-slate">{c.upcomingHint}</p>
        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-xl bg-mint-50 p-4 text-sm text-mint-900">{c.nothing}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {upcoming.slice(0, 60).map((e) => (
              <li key={e.id} className={`flex items-start gap-2 rounded-xl border p-2 ${chip(e)}`}>
                {e.milestoneId && e.appId ? (
                  <label className="inline-flex min-h-tap min-w-tap items-center justify-center">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => update(patchMilestone(e.appId!, e.milestoneId!, (m) => ({ ...m, done: true })))}
                      className="h-5 w-5 accent-mint-700"
                    />
                    <span className="sr-only">
                      {c.markDone}: {e.title}
                    </span>
                  </label>
                ) : (
                  <span aria-hidden className={`ms-3 mt-4 h-2.5 w-2.5 shrink-0 rounded-full ${e.color ? APP_COLOR_CLASSES[e.color].solid : 'bg-ink'}`} />
                )}
                <button type="button" onClick={() => open(e)} className="min-h-tap min-w-0 flex-1 py-1 text-start">
                  <span className="block font-semibold text-ink">{e.title}</span>
                  <span className="block text-xs text-slate">{e.context}</span>
                  <span className="mt-0.5 block text-xs font-semibold">
                    {formatDate(e.date, lang)} · {relativeDay(e.date, tt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
