import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

export default function Privacy() {
  const { t } = useI18n()
  usePageMeta(t.privacy.title, t.privacy.intro)

  return (
    <>
      <PageHeader title={t.privacy.title} intro={t.privacy.intro} />
      <Section>
        <div className="max-w-2xl space-y-10">
          {t.privacy.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl">{s.heading}</h2>
              <p className="mt-3 text-lg">{s.text}</p>
            </section>
          ))}
        </div>
      </Section>
    </>
  )
}
