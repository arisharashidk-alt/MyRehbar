import { Link } from 'react-router-dom'
import { Home, MapPin } from 'lucide-react'
import type { University } from '../types'
import { Card } from './Card'
import { Tag } from './Tag'
import { Button } from './Button'
import { fmt, useI18n } from '../i18n'

export function UniversityCard({ uni }: { uni: University }) {
  const { t } = useI18n()
  const u = t.universities
  const tabLabel = { engineering: u.tabEngineering, medical: u.tabMedical, business: u.tabBusiness, general: u.tabGeneral }
  const hostelAid = uni.aid.some((a) => a.coversHostel)

  return (
    <Card as="article" interactive className="flex h-full flex-col">
      <div className="flex flex-wrap gap-2">
        {uni.categories.map((c) => (
          <Tag key={c}>{tabLabel[c]}</Tag>
        ))}
        <Tag tone="outline">{uni.sector === 'public' ? u.public : u.private}</Tag>
      </div>
      <h2 className="mt-4 text-lg leading-snug">
        <Link to={`/universities/${uni.slug}`} className="text-mint-900 no-underline hover:underline">
          {uni.shortName && uni.shortName !== uni.name ? `${uni.shortName}: ${uni.name}` : uni.name}
        </Link>
      </h2>
      <p className="mt-1 flex items-center gap-1 text-sm text-slate">
        <MapPin aria-hidden size={14} strokeWidth={1.5} />
        {[uni.city, uni.province].filter(Boolean).join(', ')}
      </p>
      {uni.about && <p className="mt-3 line-clamp-3 text-ink">{uni.about}</p>}

      <ul className="mt-4 space-y-1 text-sm">
        <li className="font-semibold text-mint-900">
          {uni.aid.length === 1 ? u.oneAidProgram : fmt(u.aidPrograms, { count: uni.aid.length })}
        </li>
        {hostelAid && (
          <li className="flex items-center gap-1 text-slate">
            <Home aria-hidden size={14} strokeWidth={1.5} />
            {u.hostelAidOnly}
          </li>
        )}
      </ul>

      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <Button to={`/universities/${uni.slug}`} variant="secondary" size="sm">
          {t.common.viewDetails}
        </Button>
        <Button href={uni.website} variant="ghost" size="sm">
          {u.detail.website}
        </Button>
      </div>
    </Card>
  )
}
