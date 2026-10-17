import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { Card } from '../components/Card'
import { Tag } from '../components/Tag'
import { resources } from '../content'
import { usePageMeta } from '../hooks/usePageMeta'
import { fmt, useI18n } from '../i18n'

export default function Resources() {
  const { t } = useI18n()
  usePageMeta(t.resources.title, t.resources.intro)

  return (
    <>
      <PageHeader title={t.resources.title} intro={t.resources.intro} />
      <Section>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <Card as="li" key={r.slug} interactive className="flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <BookOpen aria-hidden size={26} strokeWidth={1.5} className="text-mint-700" />
                {r.draft && <Tag tone="sand">{t.common.draft}</Tag>}
              </div>
              {/* Guides are written in English for now. */}
              <h2 className="mt-4 text-lg" lang="en" dir="ltr">
                <Link to={`/resources/${r.slug}`} className="text-mint-900 no-underline hover:underline">
                  {r.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-slate" lang="en" dir="ltr">
                {r.summary}
              </p>
              <p className="mt-4 text-sm text-slate">{fmt(t.common.minutesRead, { count: r.readingMinutes })}</p>
            </Card>
          ))}
        </ul>
      </Section>
    </>
  )
}
