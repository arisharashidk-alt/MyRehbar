import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, ListPlus } from 'lucide-react'
import { Button } from './Button'
import { useI18n } from '../i18n'
import { useSession } from '../tracker/session'

/**
 * Small, quiet invitations to the application tracker.
 * The tracker itself (src/pages/Tracker.tsx) only downloads when someone opens it.
 */

/** On a university or scholarship page: one click adds it to the tracker. */
export function AddToTracker({ type, slug, className = '' }: { type: 'university' | 'scholarship'; slug: string; className?: string }) {
  const { t } = useI18n()
  const session = useSession()
  const target = `/tracker?add=${type}:${slug}`
  if (session) {
    return (
      <Button to={target} variant="ghost" className={`w-full ${className}`} icon={<ListPlus aria-hidden size={18} strokeWidth={1.5} />}>
        {t.common.addToTracker}
      </Button>
    )
  }
  return (
    <p className={`flex gap-2 text-sm text-slate ${className}`}>
      <CalendarCheck aria-hidden size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-mint-700" />
      <Link to={`/login?mode=signup&next=${encodeURIComponent(target)}`} className="font-semibold">
        {t.common.trackTeaser}
      </Link>
    </p>
  )
}

/** Home page: a compact card under the featured scholarships. */
export function TrackerTeaser() {
  const { t } = useI18n()
  const session = useSession()
  const h = t.home
  return (
    <div className="mt-10 grid items-center gap-8 rounded-card border border-line bg-white p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-mint-700">{h.trackerEyebrow}</p>
        <h3 className="text-xl">{h.trackerTitle}</h3>
        <p className="mt-2 text-slate">{h.trackerText}</p>
        <ul className="mt-4 space-y-2">
          {h.trackerPoints.map((point) => (
            <li key={point} className="flex gap-2">
              <CheckCircle2 aria-hidden size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-mint-700" />
              {point}
            </li>
          ))}
        </ul>
        <Button to={session ? '/tracker' : '/login?mode=signup'} variant="secondary" className="mt-6">
          {session ? t.nav.myTracker : h.trackerCta}
        </Button>
      </div>
      {/* A small picture of the tracker: three applications and how close their deadlines are. */}
      <div aria-hidden className="hidden rounded-xl border border-line bg-paper p-4 md:block">
        {[
          { name: 'TU Munich · MSc', step: 'uni-assist VPD', chip: 'bg-red-50 text-red-700 border-red-200', days: '3d', dot: 'bg-blue-700' },
          { name: 'Chevening', step: 'Final essay', chip: 'bg-orange-50 text-orange-700 border-orange-200', days: '6d', dot: 'bg-violet-700' },
          { name: 'Edinburgh · MSc', step: 'Ask 2 recommenders', chip: 'bg-amber-50 text-amber-700 border-amber-200', days: '24d', dot: 'bg-mint-700' },
        ].map((row) => (
          <div key={row.name} className="mb-2 flex items-center gap-3 rounded-lg border border-line bg-white p-3 last:mb-0">
            <span className={`h-8 w-8 shrink-0 rounded-lg ${row.dot}`} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-mint-900">{row.name}</span>
              <span className="block truncate text-xs text-slate">{row.step}</span>
            </span>
            <span className={`rounded-full border px-2 text-xs font-semibold ${row.chip}`} dir="ltr">
              {row.days}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
