import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { AlertTriangle, CalendarDays, CheckCircle2, CircleDashed, CloudOff, LayoutGrid, Loader2, StickyNote, Table2, UserRound } from 'lucide-react'
import { Button } from '../components/Button'
import { formatDate } from '../data'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'
import { LIMITS } from '../tracker/model'
import { collectEvents, daysFromToday, estimateDeadline, relativeDay, todayIso } from '../tracker/plan'
import { sessionEndedByServer, useSession, type Session } from '../tracker/session'
import { useTrackerText } from '../tracker/text'
import { useTracker, type SyncState } from '../tracker/useTracker'
import { ApplicationsView } from '../tracker/components/ApplicationsView'
import { AddApplication, type Preset } from '../tracker/components/AddApplication'
import { ApplicationPanel } from '../tracker/components/ApplicationPanel'
import { CalendarView } from '../tracker/components/CalendarView'
import { BoardView } from '../tracker/components/BoardView'
import { TestsView } from '../tracker/components/TestsView'
import { AccountView } from '../tracker/components/AccountView'

type Tab = 'applications' | 'calendar' | 'board' | 'tests' | 'account'
const TABS: Tab[] = ['applications', 'calendar', 'board', 'tests', 'account']
const TAB_ICONS = { applications: Table2, calendar: CalendarDays, board: StickyNote, tests: LayoutGrid, account: UserRound }
const TAB_KEY = 'myrehbar-tracker-tab' // only which tab was open, never tracker data

export default function TrackerPage() {
  const session = useSession()
  const location = useLocation()
  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}${sessionEndedByServer() ? '&ended=1' : ''}`} replace />
  }
  return <TrackerApp key={session.token} session={session} />
}

function readTab(): Tab {
  try {
    const v = sessionStorage.getItem(TAB_KEY)
    return TABS.includes(v as Tab) ? (v as Tab) : 'applications'
  } catch {
    return 'applications'
  }
}

function TrackerApp({ session }: { session: Session }) {
  const tt = useTrackerText()
  const { lang } = useI18n()
  usePageMeta(tt.meta.trackerTitle, tt.meta.description)
  const { data, email, phase, sync, conflict, size, update, resolveConflict, reload, saveNow } = useTracker(session)
  const [tab, setTabState] = useState<Tab>(readTab)
  const [openId, setOpenId] = useState<string | null>(null)
  const [adding, setAdding] = useState<{ preset?: Preset } | null>(null)
  const [params, setParams] = useSearchParams()
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ applications: null, calendar: null, board: null, tests: null, account: null })

  function setTab(next: Tab) {
    setTabState(next)
    try {
      sessionStorage.setItem(TAB_KEY, next)
    } catch {
      // Not remembered: fine.
    }
  }

  // "Add to my tracker" links from university and scholarship pages: /tracker?add=university:slug
  useEffect(() => {
    if (phase !== 'ready') return
    const add = params.get('add')
    if (!add) return
    const match = /^(university|scholarship):([\w-]{1,80})$/.exec(add)
    setParams({}, { replace: true })
    if (match) {
      setTab('applications')
      setAdding({ preset: { type: match[1] as Preset['type'], slug: match[2] } })
    }
  }, [phase, params, setParams])

  const summary = useMemo(() => {
    if (!data) return null
    const events = collectEvents(data, tt).filter((e) => !e.done)
    const today = todayIso()
    const overdue = events.filter((e) => e.date < today).length
    const week = events.filter((e) => e.date >= today && daysFromToday(e.date) <= 7).length
    const next = data.applications
      .filter((a) => ['researching', 'preparing'].includes(a.status))
      .map((a) => ({ app: a, date: a.deadline ?? estimateDeadline(a.semester) }))
      .filter((x) => x.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0]
    return { overdue, week, next }
  }, [data, tt])

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const dir = document.documentElement.dir === 'rtl' ? -1 : 1
    let next = -1
    if (e.key === 'ArrowRight') next = (index + dir + TABS.length) % TABS.length
    if (e.key === 'ArrowLeft') next = (index - dir + TABS.length) % TABS.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = TABS.length - 1
    if (next >= 0) {
      e.preventDefault()
      setTab(TABS[next])
      tabRefs.current[TABS[next]]?.focus()
    }
  }

  if (phase === 'loading' || (phase === 'ready' && !data)) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center" aria-busy="true">
        <p className="flex items-center gap-3 text-slate" role="status">
          <Loader2 aria-hidden size={22} strokeWidth={1.5} className="animate-spin" />
          {tt.tracker.loading}
        </p>
      </div>
    )
  }

  if (phase === 'error' || !data || !summary) {
    return (
      <div className="container-page section text-center">
        <p className="text-lg">{tt.tracker.loadError}</p>
        <Button className="mt-4" onClick={() => void reload()}>
          {tt.tracker.retry}
        </Button>
      </div>
    )
  }

  const openApp = openId ? data.applications.find((a) => a.id === openId) : undefined
  const percent = Math.round((size / LIMITS.data) * 100)

  return (
    <div className="bg-paper">
      <div className="border-b border-line bg-mint-50">
        <div className="container-page py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl">{tt.tracker.title}</h1>
              <p className="mt-1 text-slate">{tt.tracker.intro}</p>
            </div>
            <SyncBadge state={sync} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label={tt.tracker.summary.applications} value={String(data.applications.length)} />
            <Stat label={tt.tracker.summary.overdue} value={String(summary.overdue)} tone={summary.overdue ? 'red' : undefined} />
            <Stat label={tt.tracker.summary.week} value={String(summary.week)} tone={summary.week ? 'orange' : undefined} />
            <Stat
              label={tt.tracker.summary.next}
              value={summary.next ? `${formatDate(summary.next.date, lang)}` : tt.tracker.summary.none}
              sub={summary.next ? `${summary.next.app.name} · ${relativeDay(summary.next.date, tt)}` : undefined}
            />
          </dl>
        </div>
      </div>

      <div className="container-page py-6">
        {conflict && (
          <div role="alert" className="mb-6 rounded-card border border-orange-200 bg-orange-50 p-5">
            <h2 className="flex items-center gap-2 text-lg text-orange-700">
              <AlertTriangle aria-hidden size={20} strokeWidth={1.5} />
              {tt.tracker.conflict.title}
            </h2>
            <p className="mt-1">{tt.tracker.conflict.text}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="sm" onClick={() => resolveConflict('mine')}>
                {tt.tracker.conflict.mine}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => resolveConflict('theirs')}>
                {tt.tracker.conflict.theirs}
              </Button>
            </div>
          </div>
        )}
        {percent >= 85 && (
          <p role="status" className="mb-6 rounded-xl bg-sand p-3 text-sm">
            {tt.tracker.sizeWarning.replace('{percent}', String(percent))}
          </p>
        )}

        <div role="tablist" aria-label={tt.tracker.title} className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1">
          {TABS.map((key, i) => {
            const Icon = TAB_ICONS[key]
            const active = tab === key
            return (
              <button
                key={key}
                ref={(el) => (tabRefs.current[key] = el)}
                type="button"
                role="tab"
                id={`tab-${key}`}
                aria-selected={active}
                aria-controls={`panel-${key}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(key)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`inline-flex min-h-tap shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
                  active ? 'bg-mint-700 text-white' : 'text-slate hover:bg-mint-50 hover:text-mint-900'
                }`}
              >
                <Icon aria-hidden size={18} strokeWidth={1.5} />
                {tt.tracker.tabs[key]}
              </button>
            )
          })}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'applications' && <ApplicationsView data={data} update={update} onOpen={setOpenId} onAdd={() => setAdding({})} />}
          {tab === 'calendar' && <CalendarView data={data} update={update} onOpen={setOpenId} onTests={() => setTab('tests')} />}
          {tab === 'board' && <BoardView data={data} update={update} onOpen={setOpenId} />}
          {tab === 'tests' && <TestsView data={data} update={update} />}
          {tab === 'account' && <AccountView data={data} email={email} session={session} size={size} beforeLogout={saveNow} />}
        </div>
      </div>

      {adding && (
        <AddApplication
          data={data}
          preset={adding.preset}
          onClose={() => setAdding(null)}
          onAdd={(app) => {
            update((d) => ({ ...d, applications: [...d.applications, app] }))
            setAdding(null)
            setOpenId(app.id)
          }}
        />
      )}
      {openApp && <ApplicationPanel app={openApp} data={data} update={update} onClose={() => setOpenId(null)} />}
    </div>
  )
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'red' | 'orange' }) {
  const color = tone === 'red' ? 'text-red-700' : tone === 'orange' ? 'text-orange-700' : 'text-mint-900'
  return (
    <div className="rounded-card border border-line bg-white p-4">
      <dt className="text-sm text-slate">{label}</dt>
      <dd className={`mt-1 text-xl font-bold ${color}`}>{value}</dd>
      {sub && <dd className="truncate text-sm text-slate">{sub}</dd>}
    </div>
  )
}

function SyncBadge({ state }: { state: SyncState }) {
  const tt = useTrackerText()
  const s = tt.tracker.sync
  const map: Record<SyncState, { text: string; Icon: typeof CheckCircle2; cls: string }> = {
    saved: { text: s.saved, Icon: CheckCircle2, cls: 'bg-white text-mint-900' },
    pending: { text: s.pending, Icon: CircleDashed, cls: 'bg-white text-slate' },
    saving: { text: s.saving, Icon: Loader2, cls: 'bg-white text-slate' },
    offline: { text: s.offline, Icon: CloudOff, cls: 'bg-orange-50 text-orange-700' },
    error: { text: s.error, Icon: AlertTriangle, cls: 'bg-orange-50 text-orange-700' },
    tooLarge: { text: s.tooLarge, Icon: AlertTriangle, cls: 'bg-red-50 text-red-700' },
    conflict: { text: tt.tracker.conflict.title, Icon: AlertTriangle, cls: 'bg-orange-50 text-orange-700' },
  }
  const { text, Icon, cls } = map[state]
  return (
    <p role="status" aria-live="polite" className={`inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm font-semibold ${cls}`}>
      <Icon aria-hidden size={16} strokeWidth={1.5} className={state === 'saving' ? 'animate-spin' : ''} />
      {text}
    </p>
  )
}

