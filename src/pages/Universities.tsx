import { useMemo } from 'react'
import { Bus, ExternalLink, Home } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { UniversityCard } from '../components/UniversityCard'
import { FilterBar, FilterSelect, FilterToggle } from '../components/FilterBar'
import { SearchInput } from '../components/SearchInput'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { AskCta } from '../components/AskCta'
import { Card } from '../components/Card'
import { CheckList } from '../components/CheckList'
import { medicalProcess, universities } from '../data/universities'
import { officialLists } from '../config/officialLists'
import { matchesQuery, uniqueSorted } from '../lib/text'
import { useFilterParams } from '../hooks/useFilterParams'
import { usePageMeta } from '../hooks/usePageMeta'
import { fmt, useI18n } from '../i18n'
import type { AidType, UniCategory } from '../types'

const TABS: ('all' | UniCategory)[] = ['all', 'engineering', 'medical', 'business', 'general']
const AID_ORDER: AidType[] = ['need-based', 'merit', 'loan', 'outreach', 'external']
const pmdcListUrl = medicalProcess?.officialListUrl

export default function Universities() {
  const { t } = useI18n()
  const u = t.universities
  usePageMeta(u.title, u.intro)
  const f = useFilterParams()

  const tab = (TABS.includes(f.get('type') as UniCategory) ? f.get('type') : 'all') as 'all' | UniCategory
  const q = f.get('q')
  const city = f.get('city')
  const sector = f.get('sector')
  const hostelAid = f.getBool('hostel')
  const tabLabel = { all: u.tabAll, engineering: u.tabEngineering, medical: u.tabMedical, business: u.tabBusiness, general: u.tabGeneral }

  const cities = uniqueSorted(universities.map((x) => x.city))
  const results = useMemo(
    () =>
      universities.filter((x) => {
        if (tab !== 'all' && !x.categories.includes(tab)) return false
        if (city && x.city !== city) return false
        if (sector && x.sector !== sector) return false
        if (hostelAid && !x.aid.some((a) => a.coversHostel)) return false
        return matchesQuery(q, [x.name, x.shortName, x.city, x.province])
      }),
    [tab, q, city, sector, hostelAid],
  )

  return (
    <>
      <PageHeader title={u.title} intro={u.intro} />

      {/* How costs work: home vs hostel */}
      <Section labelledBy="cost-title" className="!pb-0">
        <SectionHeading id="cost-title" title={u.costTitle} intro={u.costIntro} />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <Bus aria-hidden size={28} strokeWidth={1.5} className="text-mint-700" />
            <h3 className="mt-3 text-xl">{u.costHomeTitle}</h3>
            <p className="mt-2 text-slate">{u.costHomeText}</p>
          </Card>
          <Card>
            <Home aria-hidden size={28} strokeWidth={1.5} className="text-mint-700" />
            <h3 className="mt-3 text-xl">{u.costHostelTitle}</h3>
            <p className="mt-2 text-slate">{u.costHostelText}</p>
          </Card>
        </div>
        <Card className="mt-6">
          <h3 className="text-xl">{u.aidTypesTitle}</h3>
          <CheckList className="mt-4" items={AID_ORDER.map((k) => u.aidTypes[k])} />
        </Card>
      </Section>

      <Section>
        {/* Category tabs */}
        <div role="tablist" aria-label={u.title} className="mb-6 flex flex-wrap gap-2">
          {TABS.map((key) => {
            const active = tab === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => f.set('type', key === 'all' ? '' : key)}
                className={`min-h-tap rounded-full border px-5 font-semibold transition duration-150 ${
                  active ? 'border-mint-700 bg-mint-700 text-white' : 'border-line bg-white text-ink hover:bg-mint-50'
                }`}
              >
                {tabLabel[key]}
              </button>
            )
          })}
        </div>

        <FilterBar label={t.filters.filters}>
          <SearchInput value={q} onChange={(v) => f.set('q', v)} label={t.filters.search} placeholder={u.search} clearLabel={t.filters.clear} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FilterSelect
              label={u.city}
              value={city}
              onChange={(v) => f.set('city', v)}
              options={[{ value: '', label: u.allCities }, ...cities.map((c) => ({ value: c, label: c }))]}
            />
            <FilterSelect
              label={u.sector}
              value={sector}
              onChange={(v) => f.set('sector', v)}
              options={[
                { value: '', label: u.allSectors },
                { value: 'public', label: u.public },
                { value: 'private', label: u.private },
              ]}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FilterToggle label={u.hostelAidOnly} checked={hostelAid} onChange={(v) => f.set('hostel', v)} />
            {f.hasAny && (
              <Button variant="ghost" size="sm" onClick={f.clear}>
                {t.filters.clear}
              </Button>
            )}
          </div>
        </FilterBar>

        <p className="mt-6 text-slate" role="status" aria-live="polite">
          {results.length === 1 ? t.filters.oneResult : fmt(t.filters.results, { count: results.length })}
        </p>

        {results.length > 0 ? (
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((x) => (
              <UniversityCard key={x.slug} uni={x} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title={t.empty.universitiesTitle} action={<Button onClick={f.clear}>{t.filters.clear}</Button>} />
          </div>
        )}
      </Section>

      {/* Medical admission process (shown on the Medical and All tabs) */}
      {medicalProcess && (tab === 'all' || tab === 'medical') && (
        <Section tint labelledBy="medical-title">
          <SectionHeading id="medical-title" title={u.medicalTitle} intro={medicalProcess.mdcat} />
          <div className="grid gap-6 md:grid-cols-2">
            {medicalProcess.provinces.map((p) => (
              <Card key={p.province}>
                <h3 className="text-lg">{p.province}</h3>
                <p className="mt-2 text-slate">{p.explanation}</p>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-tap items-center gap-1 font-semibold">
                    {u.detail.admissions}
                    <ExternalLink aria-hidden size={14} strokeWidth={1.5} />
                    <span className="sr-only">{t.common.opensNewTab}</span>
                  </a>
                )}
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Section labelledBy="lists-title">
        <SectionHeading id="lists-title" title={u.fullListsTitle} intro={u.fullListsText} />
        <ul className="space-y-3">
          {[
            ...officialLists,
            ...(pmdcListUrl && !officialLists.some((l) => l.url === pmdcListUrl)
              ? [{ label: 'PMDC: official list of recognized colleges', url: pmdcListUrl }]
              : []),
          ].map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-tap items-center gap-2 font-semibold">
                {l.label}
                <ExternalLink aria-hidden size={16} strokeWidth={1.5} />
                <span className="sr-only">{t.common.opensNewTab}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <AskCta />
        </div>
      </Section>
    </>
  )
}
