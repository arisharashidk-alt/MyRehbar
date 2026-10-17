import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Tag } from '../components/Tag'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { getResource } from '../content'
import { usePageMeta } from '../hooks/usePageMeta'
import { fmt, useI18n } from '../i18n'

export default function ResourceDetail() {
  const { slug } = useParams()
  const { t } = useI18n()
  const guide = getResource(slug)
  usePageMeta(guide?.title ?? t.empty.notFoundGuide, guide?.summary)

  if (!guide) {
    return (
      <div className="container-page section">
        <EmptyState title={t.empty.notFoundGuide} action={<Button to="/resources">{t.common.backToGuides}</Button>} />
      </div>
    )
  }

  return (
    <div className="container-page py-8 md:py-12">
      <Link to="/resources" className="inline-flex min-h-tap items-center gap-2 font-semibold no-underline hover:underline">
        <ArrowLeft aria-hidden size={18} strokeWidth={1.5} className="rtl:rotate-180" />
        {t.common.backToGuides}
      </Link>

      {/* Guide content is English for now, so keep it left-to-right even in Urdu mode. */}
      <article lang="en" dir="ltr" className="mx-auto mt-6 max-w-2xl">
        <div className="flex items-center gap-3">
          {guide.draft && <Tag tone="sand">{t.common.draft}</Tag>}
          <span className="text-sm text-slate">{fmt(t.common.minutesRead, { count: guide.readingMinutes })}</span>
        </div>
        <h1 className="mt-4 text-2xl md:text-3xl">{guide.title}</h1>
        <p className="mt-4 text-lg text-slate">{guide.summary}</p>

        <div className="prose-simple mt-10 space-y-10">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-4 text-xl">{section.heading}</h2>
              {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}
              {section.list && section.list.length > 0 && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.steps && section.steps.length > 0 && (
                <ol>
                  {section.steps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-card border border-line bg-mint-50 p-6">
          <h2 className="text-xl">{t.scholarships.getHelpTitle}</h2>
          <p className="mt-2 text-slate">{t.scholarships.getHelpText}</p>
          <Button to="/rehbars" className="mt-4">
            {t.home.finalCta}
          </Button>
        </div>
      </article>
    </div>
  )
}
