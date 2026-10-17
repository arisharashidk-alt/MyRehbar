import { Clock, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { Card } from '../components/Card'
import { CheckList } from '../components/CheckList'
import { MyRehbarForm } from '../components/MyRehbarForm'
import { rehbarForm } from '../forms/schema'
import { site } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

export default function BecomeRehbar() {
  const { t } = useI18n()
  usePageMeta(t.become.title, t.become.intro)

  return (
    <>
      <PageHeader title={t.become.title} intro={t.become.intro} />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="text-xl">{t.become.whyTitle}</h2>
            <CheckList className="mt-4" items={t.become.whyList} />
          </Card>
          <Card>
            <h2 className="text-xl">{t.become.goodTitle}</h2>
            <CheckList className="mt-4" items={t.become.goodList} />
          </Card>
        </div>
        <div className="mt-6 flex gap-4 rounded-card border border-line bg-mint-50 p-6">
          <Clock aria-hidden size={28} strokeWidth={1.5} className="shrink-0 text-mint-700" />
          <div>
            <h2 className="text-xl">{t.become.timeTitle}</h2>
            <p className="mt-2 text-lg">{t.become.timeText}</p>
          </div>
        </div>
      </Section>

      <Section tint>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="text-xl">{t.become.conductTitle}</h2>
            <CheckList className="mt-4" items={t.become.conductList} />
          </Card>
          {/* Safeguarding note: keep this visible and clear. */}
          <section aria-labelledby="safeguarding" className="rounded-card border border-line bg-sand p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck aria-hidden size={28} strokeWidth={1.5} className="text-mint-900" />
              <h2 id="safeguarding" className="text-xl">
                {t.become.safeTitle}
              </h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 ps-6">
              {t.become.safeList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </Section>

      <Section labelledBy="apply">
        <SectionHeading id="apply" title={t.become.applyTitle} intro={t.become.applyText} />
        <div className="max-w-3xl">
          <MyRehbarForm def={rehbarForm} />
          {site.contactEmail && (
            <p className="mt-6 text-slate">
              {t.become.questions}{' '}
              <a href={`mailto:${site.contactEmail}`} className="font-semibold" dir="ltr">
                {site.contactEmail}
              </a>
            </p>
          )}
        </div>
      </Section>
    </>
  )
}
