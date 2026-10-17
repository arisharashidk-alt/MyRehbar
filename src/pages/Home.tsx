import { ClipboardList, Handshake, Send } from 'lucide-react'
import { Button } from '../components/Button'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { ScholarshipCard } from '../components/ScholarshipCard'
import { RehbarCard } from '../components/RehbarCard'
import { StatCard } from '../components/StatCard'
import { FounderStory } from '../components/FounderStory'
import { HeroDecor } from '../components/Decor'
import { pickFeatured, rehbars, scholarships } from '../data'
import { stats } from '../data/stats'
import { useI18n } from '../i18n'
import { usePageMeta } from '../hooks/usePageMeta'

const stepIcons = [ClipboardList, Handshake, Send]

export default function Home() {
  const { t, lang } = useI18n()
  usePageMeta('', t.meta.defaultDescription)

  const featuredScholarships = pickFeatured(scholarships)
  const featuredRehbars = pickFeatured(rehbars)
  const visibleStats = stats.filter((s) => s.value !== null)
  const numberFormat = new Intl.NumberFormat(lang === 'ur' ? 'ur-PK' : 'en-GB')

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="container-page grid items-center gap-10 py-12 md:grid-cols-[1.3fr_1fr] md:py-20 lg:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-mint-50 px-3 py-1 text-sm font-semibold text-mint-900">
              {t.home.eyebrow}
            </p>
            <h1 className="text-2xl md:text-[40px] md:leading-[52px] lg:text-3xl">
              {t.brand.missionPart1} <span className="text-mint-700">{t.brand.missionPart2}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate">{t.home.heroText}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/rehbars" size="lg">
                {t.home.ctaStudent}
              </Button>
              <Button to="/become-a-rehbar" size="lg" variant="secondary">
                {t.home.ctaRehbar}
              </Button>
            </div>
          </div>
          <HeroDecor className="mx-auto hidden w-full max-w-sm md:block" />
        </div>
      </section>

      {/* How it works */}
      <Section tint labelledBy="how-title">
        <SectionHeading id="how-title" title={t.home.howTitle} intro={t.home.howIntro} />
        <ol className="grid gap-6 md:grid-cols-3">
          {t.home.steps.map((step, i) => {
            const Icon = stepIcons[i] ?? ClipboardList
            return (
              <li key={step.title} className="rounded-card border border-line bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint-50 text-mint-700">
                    <Icon aria-hidden size={24} strokeWidth={1.5} />
                  </span>
                  <span dir="ltr" className="text-sm font-semibold text-slate">
                    {i + 1} / 3
                  </span>
                </div>
                <h3 className="mt-4 text-xl">{step.title}</h3>
                <p className="mt-2 text-slate">{step.text}</p>
              </li>
            )
          })}
        </ol>
      </Section>

      {/* Founder story */}
      <Section>
        <FounderStory />
      </Section>

      {/* Featured scholarships */}
      {featuredScholarships.length > 0 && (
        <Section tint labelledBy="featured-scholarships">
          <SectionHeading
            id="featured-scholarships"
            title={t.home.featuredScholarshipsTitle}
            intro={t.home.featuredScholarshipsIntro}
            action={
              <Button to="/scholarships" variant="secondary">
                {t.common.seeAllScholarships}
              </Button>
            }
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredScholarships.map((s) => (
              <ScholarshipCard key={s.slug} scholarship={s} headingLevel={3} />
            ))}
          </div>
        </Section>
      )}

      {/* Featured Rehbars */}
      {featuredRehbars.length > 0 && (
        <Section labelledBy="featured-rehbars">
          <SectionHeading
            id="featured-rehbars"
            title={t.home.featuredRehbarsTitle}
            intro={t.home.featuredRehbarsIntro}
            action={
              <Button to="/rehbars" variant="secondary">
                {t.common.seeAllRehbars}
              </Button>
            }
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredRehbars.map((r) => (
              <RehbarCard key={r.slug} rehbar={r} headingLevel={3} />
            ))}
          </div>
        </Section>
      )}

      {/* Impact numbers: hidden until real numbers are added in src/data/stats.ts */}
      {visibleStats.length > 0 ? (
        <Section tint labelledBy="impact-title">
          <SectionHeading id="impact-title" title={t.home.impactTitle} align="center" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {visibleStats.map((s) => (
              <StatCard key={s.key} value={numberFormat.format(s.value as number) + (s.suffix ?? '')} label={t.stats[s.key]} />
            ))}
          </div>
        </Section>
      ) : (
        import.meta.env.DEV && (
          <div className="container-page py-6">
            <p className="rounded-xl bg-sand p-4 text-sm">
              Developer note (only visible locally): impact numbers are hidden. Add real numbers in src/data/stats.ts.
            </p>
          </div>
        )
      )}

      {/* Final call to action */}
      <section className="bg-mint-900">
        <div className="container-page section text-center">
          <h2 className="mx-auto max-w-2xl text-2xl text-white md:text-3xl">{t.home.finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-mint-200">{t.home.finalText}</p>
          <div className="mt-8">
            <Button to="/rehbars" size="lg" variant="onDark">
              {t.home.finalCta}
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
