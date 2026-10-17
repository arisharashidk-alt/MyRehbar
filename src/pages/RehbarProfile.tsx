import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Cake, Clock, Languages, Linkedin, MapPin, ShieldCheck } from 'lucide-react'
import { Avatar } from '../components/Avatar'
import { Tag } from '../components/Tag'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { CheckList } from '../components/CheckList'
import { EmptyState } from '../components/EmptyState'
import { getRehbar } from '../data'
import { usePageMeta } from '../hooks/usePageMeta'
import { fmt, useI18n } from '../i18n'

export default function RehbarProfile() {
  const { slug } = useParams()
  const { t } = useI18n()
  const rehbar = getRehbar(slug)
  usePageMeta(rehbar?.name ?? t.empty.notFoundRehbar, rehbar?.story)

  if (!rehbar) {
    return (
      <div className="container-page section">
        <EmptyState title={t.empty.notFoundRehbar} action={<Button to="/rehbars">{t.common.backToRehbars}</Button>} />
      </div>
    )
  }

  const place = [rehbar.city, rehbar.country].filter(Boolean).join(', ')
  const story = rehbar.fullStory && rehbar.fullStory.length > 0 ? rehbar.fullStory : [rehbar.story].filter(Boolean)

  return (
    <div className="container-page py-8 md:py-12">
      <Link to="/rehbars" className="inline-flex min-h-tap items-center gap-2 font-semibold no-underline hover:underline">
        <ArrowLeft aria-hidden size={18} strokeWidth={1.5} className="rtl:rotate-180" />
        {t.common.backToRehbars}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar name={rehbar.name} photo={rehbar.photo} size={96} />
            <div>
              <h1 className="text-2xl md:text-3xl">{rehbar.name}</h1>
              <p className="mt-1 text-lg text-slate">
                {[rehbar.program, rehbar.university].filter(Boolean).join(' · ')}
              </p>
              {place && (
                <p className="mt-1 flex items-center gap-1 text-slate">
                  <MapPin aria-hidden size={16} strokeWidth={1.5} />
                  {place}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {rehbar.sample && <Tag tone="sand">{t.common.sample}</Tag>}
            <Tag>{t.fields[rehbar.field]}</Tag>
            {rehbar.tags.map((tag) => (
              <Tag key={tag} tone="outline">
                {tag}
              </Tag>
            ))}
          </div>

          {story.length > 0 && (
            <section className="mt-10" aria-labelledby="story">
              <h2 id="story" className="text-xl">
                {t.rehbars.storyTitle}
              </h2>
              <div className="prose-simple mt-4">
                {story.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {rehbar.helpsWith && rehbar.helpsWith.length > 0 && (
            <section className="mt-10" aria-labelledby="helps">
              <h2 id="helps" className="text-xl">
                {fmt(t.rehbars.helpTitle, { name: rehbar.name })}
              </h2>
              <CheckList className="mt-4 text-lg" items={rehbar.helpsWith.map((h) => t.helpsWith[h])} />
            </section>
          )}
        </div>

        <aside>
          <Card className="lg:sticky lg:top-24">
            <dl className="space-y-4">
              {rehbar.age && (
                <div className="flex gap-3">
                  <Cake aria-hidden size={20} strokeWidth={1.5} className="mt-0.5 text-mint-700" />
                  <div>
                    <dt className="text-sm text-slate">{t.common.age}</dt>
                    <dd className="font-semibold">{fmt(t.common.yearsOld, { count: rehbar.age })}</dd>
                  </div>
                </div>
              )}
              {rehbar.availability && (
                <div className="flex gap-3">
                  <Clock aria-hidden size={20} strokeWidth={1.5} className="mt-0.5 text-mint-700" />
                  <div>
                    <dt className="text-sm text-slate">{t.common.availability}</dt>
                    <dd className="font-semibold">{rehbar.availability}</dd>
                  </div>
                </div>
              )}
              {rehbar.languages.length > 0 && (
                <div className="flex gap-3">
                  <Languages aria-hidden size={20} strokeWidth={1.5} className="mt-0.5 text-mint-700" />
                  <div>
                    <dt className="text-sm text-slate">{t.common.languages}</dt>
                    <dd className="font-semibold">{rehbar.languages.join(', ')}</dd>
                  </div>
                </div>
              )}
            </dl>
            <Button to={`/request?rehbar=${rehbar.slug}`} className="mt-6 w-full" size="lg">
              {t.common.requestRehbar}
            </Button>
            {/* LinkedIn is shown for credibility only. Mentoring requests still go through the form. */}
            {rehbar.linkedin && (
              <Button href={rehbar.linkedin} variant="secondary" className="mt-3 w-full" icon={<Linkedin aria-hidden size={18} strokeWidth={1.5} />}>
                LinkedIn
              </Button>
            )}
            <p className="mt-4 flex gap-2 text-sm text-slate">
              <ShieldCheck aria-hidden size={18} strokeWidth={1.5} className="shrink-0 text-mint-700" />
              {t.rehbars.requestNote}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
