import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Bus, CheckCircle2, ExternalLink, Home, Info, XCircle } from 'lucide-react'
import { Tag } from '../components/Tag'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { StepList } from '../components/CheckList'
import { EmptyState } from '../components/EmptyState'
import { AskCta } from '../components/AskCta'
import { AddToTracker } from '../components/TrackerCta'
import { LastVerified } from '../components/ScholarshipMeta'
import { costTotals, getUniversity } from '../data/universities'
import { usePageMeta } from '../hooks/usePageMeta'
import { fmt, useI18n } from '../i18n'
import type { AidProgram } from '../types'

const pkr = (n: number) => `Rs ${new Intl.NumberFormat('en-PK').format(n)}`

function OfficialLink({ href, children }: { href?: string; children: ReactNode }) {
  const { t } = useI18n()
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-tap items-center gap-1 font-semibold">
      {children}
      <ExternalLink aria-hidden size={14} strokeWidth={1.5} />
      <span className="sr-only">{t.common.opensNewTab}</span>
    </a>
  )
}

function AidCard({ aid }: { aid: AidProgram }) {
  const { t } = useI18n()
  const d = t.universities.detail
  return (
    <Card as="article">
      <div className="flex flex-wrap items-center gap-2">
        <Tag>{t.universities.aidTypeLabels[aid.type]}</Tag>
        {aid.coversHostel === true && (
          <Tag tone="sand">
            <Home aria-hidden size={14} strokeWidth={1.5} />
            {d.coversHostel}
          </Tag>
        )}
        {aid.coversHostel === false && <Tag tone="outline">{d.notHostel}</Tag>}
      </div>
      <h3 className="mt-3 text-lg">{aid.name}</h3>
      <dl className="mt-3 space-y-3">
        {aid.covers.length > 0 && (
          <div>
            <dt className="text-sm text-slate">{d.covers}</dt>
            <dd className="font-semibold">{aid.covers.join(' · ')}</dd>
          </div>
        )}
        {aid.amount && (
          <div>
            <dt className="text-sm text-slate">{d.amount}</dt>
            <dd className="font-semibold">{aid.amount}</dd>
          </div>
        )}
        {aid.whoCanApply && (
          <div>
            <dt className="text-sm text-slate">{d.whoCanApply}</dt>
            <dd>{aid.whoCanApply}</dd>
          </div>
        )}
      </dl>
      {aid.howToApply.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-3 font-semibold text-mint-900">{d.howToApply}</h4>
          <StepList items={aid.howToApply} />
        </div>
      )}
      {aid.sourceUrl && (
        <p className="mt-4 border-t border-line pt-3 text-sm">
          <OfficialLink href={aid.sourceUrl}>{t.common.officialWebsite}</OfficialLink>
        </p>
      )}
    </Card>
  )
}

export default function UniversityDetail() {
  const { slug } = useParams()
  const { t } = useI18n()
  const d = t.universities.detail
  const uni = getUniversity(slug)
  usePageMeta(uni ? uni.shortName ?? uni.name : d.notFound, uni?.about)

  if (!uni) {
    return (
      <div className="container-page section">
        <EmptyState title={d.notFound} action={<Button to="/universities">{d.back}</Button>} />
      </div>
    )
  }

  const tabLabel = {
    engineering: t.universities.tabEngineering,
    medical: t.universities.tabMedical,
    business: t.universities.tabBusiness,
    general: t.universities.tabGeneral,
  }
  const totals = costTotals(uni)
  const hostelAvailable = uni.hostel?.available
  const displayName = uni.shortName ?? uni.name

  return (
    <div className="container-page py-8 md:py-12">
      <Link to="/universities" className="inline-flex min-h-tap items-center gap-2 font-semibold no-underline hover:underline">
        <ArrowLeft aria-hidden size={18} strokeWidth={1.5} className="rtl:rotate-180" />
        {d.back}
      </Link>

      <div className="mt-6 flex flex-wrap gap-2">
        {uni.categories.map((c) => (
          <Tag key={c}>{tabLabel[c]}</Tag>
        ))}
        <Tag tone="outline">{uni.sector === 'public' ? t.universities.public : t.universities.private}</Tag>
      </div>
      <h1 className="mt-4 max-w-3xl text-2xl md:text-3xl">{uni.name}</h1>
      <p className="mt-2 text-lg text-slate">{[uni.city, uni.province].filter(Boolean).join(', ')}</p>
      {uni.about && <p className="mt-4 max-w-3xl text-lg">{uni.about}</p>}

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
        <OfficialLink href={uni.website}>{d.website}</OfficialLink>
        <OfficialLink href={uni.admissionsUrl}>{d.admissions}</OfficialLink>
        <OfficialLink href={uni.financialAidUrl}>{d.aidPage}</OfficialLink>
        <OfficialLink href={uni.feesUrl}>{d.feesPage}</OfficialLink>
      </div>
      <div className="mt-4 max-w-md">
        <AddToTracker type="university" slug={uni.slug} className="sm:w-auto" />
      </div>

      {/* Cost: home vs hostel */}
      <section aria-labelledby="costs" className="mt-12">
        <h2 id="costs" className="text-xl">
          {d.costsTitle}
        </h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <Bus aria-hidden size={24} strokeWidth={1.5} className="text-mint-700" />
              <h3 className="text-lg">{d.totalHome}</h3>
            </div>
            {totals.home !== undefined ? (
              <>
                <p className="mt-3 text-2xl font-bold text-mint-900">{pkr(totals.home)}</p>
                <p className="text-sm text-slate">{d.perYear}</p>
                <p className="mt-3 text-sm">
                  {d.tuition}: <strong>{pkr(totals.home)}</strong>
                </p>
              </>
            ) : (
              <p className="mt-3 text-slate">{d.costsUnknown}</p>
            )}
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <Home aria-hidden size={24} strokeWidth={1.5} className="text-mint-700" />
              <h3 className="text-lg">{d.totalHostel}</h3>
            </div>
            {hostelAvailable === false ? (
              <p className="mt-3 text-slate">{d.hostelNo}</p>
            ) : totals.withHostel !== undefined ? (
              <>
                <p className="mt-3 text-2xl font-bold text-mint-900">{pkr(totals.withHostel)}</p>
                <p className="text-sm text-slate">{d.perYear}</p>
                <p className="mt-3 text-sm">
                  {d.tuition}: <strong>{pkr(totals.home as number)}</strong> + {d.hostel}: <strong>{pkr(uni.costs?.hostelPerYear as number)}</strong>
                </p>
              </>
            ) : (
              <p className="mt-3 text-slate">{totals.home !== undefined ? d.hostelUnknownCost : d.costsUnknown}</p>
            )}
            <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-sm">
              {hostelAvailable === true ? (
                <CheckCircle2 aria-hidden size={18} strokeWidth={1.5} className="shrink-0 text-mint-700" />
              ) : hostelAvailable === false ? (
                <XCircle aria-hidden size={18} strokeWidth={1.5} className="shrink-0 text-slate" />
              ) : (
                <Info aria-hidden size={18} strokeWidth={1.5} className="shrink-0 text-slate" />
              )}
              <span>
                <strong>{hostelAvailable === true ? d.hostelYes : hostelAvailable === false ? d.hostelNo : d.hostelUnknown}</strong>
                {uni.hostel?.notes && <>. {uni.hostel.notes}</>}
              </span>
            </p>
          </Card>
        </div>
        <p className="mt-4 text-sm text-slate">
          {uni.costs?.academicYear && totals.home !== undefined && fmt(d.costsNote, { year: uni.costs.academicYear })}{' '}
          {uni.costs?.otherNotes}{' '}
          <OfficialLink href={uni.costs?.sourceUrl ?? uni.feesUrl}>{d.feesPage}</OfficialLink>
        </p>
      </section>

      {/* Financial aid */}
      <section aria-labelledby="aid" className="mt-12">
        <h2 id="aid" className="text-xl">
          {d.aidTitle}
        </h2>
        {uni.aid.length > 0 ? (
          <div className="mt-4 grid items-start gap-6 lg:grid-cols-2">
            {uni.aid.map((a) => (
              <AidCard key={a.name} aid={a} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-slate">
            {d.noAid} <OfficialLink href={uni.financialAidUrl ?? uni.website}>{d.aidPage}</OfficialLink>
          </p>
        )}
      </section>

      {/* Admission */}
      {uni.admissionSteps.length > 0 && (
        <section aria-labelledby="admission" className="mt-12 max-w-3xl">
          <h2 id="admission" className="text-xl">
            {d.admissionTitle}
          </h2>
          <div className="mt-4 text-lg">
            <StepList items={uni.admissionSteps} />
          </div>
        </section>
      )}

      <div className="mt-12 flex gap-3 rounded-xl bg-sand p-4">
        <Info aria-hidden size={20} strokeWidth={1.5} className="mt-1 shrink-0 text-mint-900" />
        <div>
          <p>{t.common.checkOfficial}</p>
          <div className="mt-1 text-sm text-slate">
            <LastVerified date={uni.lastVerified} />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <AskCta about={displayName} />
      </div>
    </div>
  )
}
