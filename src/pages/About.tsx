import { Handshake } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { Card } from '../components/Card'
import { FounderStory } from '../components/FounderStory'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

export default function About() {
  const { t } = useI18n()
  usePageMeta(t.about.title, t.about.missionText)

  return (
    <>
      <PageHeader title={t.about.title} intro={t.about.intro} />

      <Section labelledBy="story">
        <h2 id="story" className="mb-8 text-2xl">
          {t.about.storyTitle}
        </h2>
        <FounderStory showHeading={false} />
      </Section>

      <Section tint labelledBy="mission">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="mission" className="text-2xl">
            {t.about.missionTitle}
          </h2>
          <p className="mt-4 text-xl text-mint-900">{t.about.missionText}</p>
        </div>
      </Section>

      <Section labelledBy="values">
        <SectionHeading id="values" title={t.about.valuesTitle} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.about.values.map((v) => (
            <Card key={v.title}>
              <h3 className="text-lg">{v.title}</h3>
              <p className="mt-2 text-slate">{v.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tint labelledBy="sdg">
        <SectionHeading id="sdg" title={t.about.sdgTitle} intro={t.about.sdgIntro} />
        <ul className="grid gap-4 sm:grid-cols-3">
          {t.about.sdgs.map((g) => (
            <li key={g.number} className="flex items-center gap-4 rounded-card border border-line bg-white p-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mint-900 text-xl font-bold text-white">
                {g.number}
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate">SDG {g.number}</span>
                <span className="block text-lg font-semibold text-mint-900">{g.title}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="partners">
        <SectionHeading id="partners" title={t.about.partnersTitle} />
        {/* TODO: when you have partners, replace this empty state with their names or logos. */}
        <EmptyState
          icon={<Handshake aria-hidden size={28} strokeWidth={1.5} />}
          title={t.about.partnersCta}
          text={t.about.partnersEmpty}
          action={<Button to="/contact">{t.about.partnersCta}</Button>}
        />
      </Section>
    </>
  )
}
