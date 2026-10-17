import { Link } from 'react-router-dom'
import { Languages, MapPin } from 'lucide-react'
import type { Rehbar } from '../types'
import { Card } from './Card'
import { Tag } from './Tag'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { forms, formLink } from '../config/forms'
import { useI18n } from '../i18n'

export function RehbarCard({ rehbar, headingLevel = 2 }: { rehbar: Rehbar; headingLevel?: 2 | 3 }) {
  const { t } = useI18n()
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const place = [rehbar.city, rehbar.country].filter(Boolean).join(', ')

  return (
    <Card as="article" interactive className="flex h-full flex-col">
      <div className="flex items-start gap-4">
        <Avatar name={rehbar.name} photo={rehbar.photo} />
        <div className="min-w-0">
          <Heading className="text-lg leading-snug">
            <Link to={`/rehbars/${rehbar.slug}`} className="text-mint-900 no-underline hover:underline">
              {rehbar.name}
            </Link>
          </Heading>
          {rehbar.university && <p className="text-sm text-slate">{rehbar.university}</p>}
          {place && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate">
              <MapPin aria-hidden size={14} strokeWidth={1.5} />
              {place}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {rehbar.sample && <Tag tone="sand">{t.common.sample}</Tag>}
        <Tag>{t.fields[rehbar.field]}</Tag>
        {rehbar.tags.map((tag) => (
          <Tag key={tag} tone="outline">
            {tag}
          </Tag>
        ))}
      </div>

      {rehbar.story && <p className="mt-4 text-ink">{rehbar.story}</p>}

      {rehbar.languages.length > 0 && (
        <p className="mt-3 flex items-center gap-2 text-sm text-slate">
          <Languages aria-hidden size={16} strokeWidth={1.5} />
          <span className="sr-only">{t.common.languages}:</span>
          {rehbar.languages.join(', ')}
        </p>
      )}

      {/* Contact always goes through the request form. Never show emails or phone numbers. */}
      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <Button href={formLink(forms.mentorshipRequest, { rehbarName: rehbar.name })} variant="secondary" size="sm">
          {t.common.requestRehbar}
        </Button>
        <Button to={`/rehbars/${rehbar.slug}`} variant="ghost" size="sm">
          {t.common.viewProfile}
        </Button>
      </div>
    </Card>
  )
}
