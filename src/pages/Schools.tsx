import { HeartHandshake, Megaphone, Video, Wifi } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { Card } from '../components/Card'
import { Timeline } from '../components/Timeline'
import { Button } from '../components/Button'
import { forms, formLink } from '../config/forms'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

const icons = [Megaphone, Video, HeartHandshake, Wifi]

export default function Schools() {
  const { t } = useI18n()
  usePageMeta(t.schools.title, t.schools.intro)

  return (
    <>
      <PageHeader title={t.schools.title} intro={t.schools.intro}>
        <p className="inline-flex rounded-full bg-white px-4 py-2 font-semibold text-mint-900">{t.schools.pilot}</p>
      </PageHeader>

      <Section labelledBy="program">
        <SectionHeading id="program" title={t.schools.programTitle} />
        <div className="grid gap-6 md:grid-cols-2">
          {t.schools.program.map((item, i) => {
            const Icon = icons[i] ?? Megaphone
            return (
              <Card key={item.title}>
                <Icon aria-hidden size={28} strokeWidth={1.5} className="text-mint-700" />
                <h3 className="mt-4 text-xl">{item.title}</h3>
                <p className="mt-2 text-slate">{item.text}</p>
              </Card>
            )
          })}
        </div>
      </Section>

      <Section tint labelledBy="timeline">
        <SectionHeading id="timeline" title={t.schools.timelineTitle} />
        <Timeline items={t.schools.timeline} />
      </Section>

      <Section labelledBy="bring">
        <div className="rounded-card border border-line bg-white p-6 text-center md:p-12">
          <h2 id="bring" className="text-2xl">
            {t.schools.ctaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate">{t.schools.ctaText}</p>
          <Button href={formLink(forms.contact, { topic: 'School program' })} size="lg" className="mt-8">
            {t.schools.ctaButton}
          </Button>
        </div>
      </Section>
    </>
  )
}
