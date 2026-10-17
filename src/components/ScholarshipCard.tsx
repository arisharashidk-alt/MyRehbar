import { Link } from 'react-router-dom'
import { CalendarClock, Globe2 } from 'lucide-react'
import type { Scholarship } from '../types'
import { Card } from './Card'
import { Tag } from './Tag'
import { Button } from './Button'
import { DeadlineText, LastVerified } from './ScholarshipMeta'
import { fmt, useI18n } from '../i18n'

export function ScholarshipCard({ scholarship: s, headingLevel = 2 }: { scholarship: Scholarship; headingLevel?: 2 | 3 }) {
  const { t } = useI18n()
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <Card as="article" interactive className="flex h-full flex-col">
      <div className="flex flex-wrap gap-2">
        {s.sample && <Tag tone="sand">{t.common.sample}</Tag>}
        <Tag tone={s.fundingType === 'full' ? 'mint' : 'outline'}>{t.funding[s.fundingType]}</Tag>
        {s.levels.map((l) => (
          <Tag key={l} tone="outline">
            {t.levels[l]}
          </Tag>
        ))}
      </div>
      {s.regions && s.regions.length > 0 && (
        <p className="mt-3 text-sm font-semibold text-mint-900">{fmt(t.scholarships.regionOnly, { regions: s.regions.join(' / ') })}</p>
      )}

      <Heading className="mt-4 text-lg leading-snug">
        <Link to={`/scholarships/${s.slug}`} className="text-mint-900 no-underline hover:underline">
          {s.name}
        </Link>
      </Heading>
      {s.provider && <p className="text-sm text-slate">{s.provider}</p>}

      <dl className="mt-4 space-y-2 text-sm">
        {s.country && (
          <div className="flex items-center gap-2">
            <Globe2 aria-hidden size={16} strokeWidth={1.5} className="text-slate" />
            <dt className="sr-only">{t.common.country}</dt>
            <dd>{s.country}</dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CalendarClock aria-hidden size={16} strokeWidth={1.5} className="text-slate" />
          <dt className="sr-only">{t.common.deadline}</dt>
          <dd>
            <DeadlineText deadline={s.deadline} />
          </dd>
        </div>
      </dl>

      {s.eligibility && <p className="mt-4 line-clamp-3 text-ink">{s.eligibility}</p>}

      <div className="mt-auto pt-6">
        <div className="flex flex-wrap gap-2">
          <Button to={`/scholarships/${s.slug}`} variant="secondary" size="sm">
            {t.common.viewDetails}
          </Button>
          {s.officialUrl && (
            <Button href={s.officialUrl} variant="ghost" size="sm">
              {t.common.officialWebsite}
            </Button>
          )}
        </div>
        <div className="mt-4 border-t border-line pt-3 text-sm text-slate">
          <LastVerified date={s.lastVerified} />
          <p>{t.common.checkOfficial}</p>
        </div>
      </div>
    </Card>
  )
}
