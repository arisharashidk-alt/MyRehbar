import { daysUntil, formatDate } from '../data'
import { fmt, useI18n } from '../i18n'

/** "12 Mar 2027 · 30 days left", "Closed", or "Check official website". */
export function DeadlineText({ deadline }: { deadline?: string | null }) {
  const { t, lang } = useI18n()
  const date = formatDate(deadline, lang)
  const days = daysUntil(deadline)
  if (!date || days === null) return <>{t.common.deadlineUnknown}</>
  if (days < 0)
    return (
      <>
        {date} · {t.common.closed}
      </>
    )
  return (
    <>
      {date} · <span className="font-semibold text-mint-900">{fmt(t.common.daysLeft, { count: days })}</span>
    </>
  )
}

export function LastVerified({ date }: { date?: string | null }) {
  const { t, lang } = useI18n()
  const formatted = formatDate(date, lang)
  return <p>{formatted ? fmt(t.common.lastVerified, { date: formatted }) : t.common.notVerified}</p>
}
