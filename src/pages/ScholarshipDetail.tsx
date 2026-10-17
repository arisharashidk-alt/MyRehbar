import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import { Tag } from '../components/Tag'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { CheckList, StepList } from '../components/CheckList'
import { EmptyState } from '../components/EmptyState'
import { DeadlineText, LastVerified } from '../components/ScholarshipMeta'
import { getScholarship } from '../data'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-line py-3 last:border-0">
      <dt className="text-sm text-slate">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  )
}

export default function ScholarshipDetail() {
  const { slug } = useParams()
  const { t } = useI18n()
  const s = getScholarship(slug)
  usePageMeta(s?.name ?? t.empty.notFoundScholarship, s?.eligibility)

  if (!s) {
    return (
      <div className="container-page section">
        <EmptyState
          title={t.empty.notFoundScholarship}
          action={<Button to="/scholarships">{t.common.backToScholarships}</Button>}
        />
      </div>
    )
  }

  const steps = s.howToApply && s.howToApply.length > 0 ? s.howToApply : t.scholarships.defaultSteps

  return (
    <div className="container-page py-8 md:py-12">
      <Link to="/scholarships" className="inline-flex min-h-tap items-center gap-2 font-semibold no-underline hover:underline">
        <ArrowLeft aria-hidden size={18} strokeWidth={1.5} className="rtl:rotate-180" />
        {t.common.backToScholarships}
      </Link>

      <div className="mt-6 flex flex-wrap gap-2">
        {s.sample && <Tag tone="sand">{t.common.sample}</Tag>}
        <Tag tone={s.fundingType === 'full' ? 'mint' : 'outline'}>{t.funding[s.fundingType]}</Tag>
      </div>
      <h1 className="mt-4 max-w-3xl text-2xl md:text-3xl">{s.name}</h1>
      {s.provider && <p className="mt-2 text-lg text-slate">{s.provider}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {(s.description || s.eligibility) && (
            <section aria-labelledby="about">
              <h2 id="about" className="text-xl">
                {t.scholarships.aboutTitle}
              </h2>
              <div className="prose-simple mt-4">
                {s.description && <p>{s.description}</p>}
                {s.eligibility && (
                  <p>
                    <strong>{t.common.eligibility}: </strong>
                    {s.eligibility}
                  </p>
                )}
              </div>
            </section>
          )}

          {s.covers && s.covers.length > 0 && (
            <section aria-labelledby="covers">
              <h2 id="covers" className="text-xl">
                {t.scholarships.coversTitle}
              </h2>
              <CheckList className="mt-4 text-lg" items={s.covers} />
            </section>
          )}

          <section aria-labelledby="how">
            <h2 id="how" className="text-xl">
              {t.scholarships.howToApplyTitle}
            </h2>
            <div className="mt-4 text-lg">
              <StepList items={steps} />
            </div>
          </section>

          <div className="flex gap-3 rounded-xl bg-sand p-4">
            <Info aria-hidden size={20} strokeWidth={1.5} className="mt-1 shrink-0 text-mint-900" />
            <p>{t.common.checkOfficial}</p>
          </div>

          <section aria-labelledby="help" className="rounded-card border border-line bg-mint-50 p-6 md:p-8">
            <h2 id="help" className="text-xl">
              {t.scholarships.getHelpTitle}
            </h2>
            <p className="mt-2 text-slate">{t.scholarships.getHelpText}</p>
            <Button to={`/students?scholarship=${s.slug}#signup`} size="lg" className="mt-6">
              {t.scholarships.getHelpCta}
            </Button>
          </section>
        </div>

        <aside className="order-first lg:order-none">
          <Card className="lg:sticky lg:top-24">
            <dl>
              {s.country && <Fact label={t.common.country}>{s.country}</Fact>}
              {s.levels.length > 0 && <Fact label={t.common.level}>{s.levels.map((l) => t.levels[l]).join(', ')}</Fact>}
              <Fact label={t.common.funding}>{t.funding[s.fundingType]}</Fact>
              <Fact label={t.common.deadline}>
                <DeadlineText deadline={s.deadline} />
              </Fact>
              {s.applicationWindow && <Fact label={t.common.applicationWindow}>{s.applicationWindow}</Fact>}
            </dl>
            {s.officialUrl && (
              <Button href={s.officialUrl} variant="secondary" className="mt-4 w-full">
                {t.common.officialWebsite}
              </Button>
            )}
            <div className="mt-4 text-sm text-slate">
              <LastVerified date={s.lastVerified} />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
