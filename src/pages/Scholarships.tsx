import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'
import { AskCta } from '../components/AskCta'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { ScholarshipCard } from '../components/ScholarshipCard'
import { FilterBar, FilterSelect, FilterToggle } from '../components/FilterBar'
import { SearchInput } from '../components/SearchInput'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { daysUntil, scholarships } from '../data'
import { matchesQuery, uniqueSorted } from '../lib/text'
import { useFilterParams } from '../hooks/useFilterParams'
import { usePageMeta } from '../hooks/usePageMeta'
import { fmt, useI18n } from '../i18n'
import type { LevelId, Scholarship } from '../types'
import { CITIES, PROVINCES, provinceFor } from '../config/places'

const LEVELS: LevelId[] = ['school', 'undergraduate', 'masters', 'phd', 'exchange']
const inPakistan = (s: Scholarship) => s.country === 'Pakistan'

/** Open deadlines first (soonest first), then unknown deadlines, then closed ones. */
function byDeadline(a: Scholarship, b: Scholarship) {
  const rank = (s: Scholarship) => {
    const d = daysUntil(s.deadline)
    if (d === null) return [1, 0]
    return d >= 0 ? [0, d] : [2, -d]
  }
  const [ga, va] = rank(a)
  const [gb, vb] = rank(b)
  return ga - gb || va - vb || a.name.localeCompare(b.name)
}

export default function Scholarships() {
  const { t } = useI18n()
  usePageMeta(t.scholarships.title, t.scholarships.intro)
  const f = useFilterParams()
  const clearFilters = () => {
    const abroad = f.get('where') === 'abroad'
    f.clear()
    if (abroad) f.set('where', 'abroad')
  }

  // Two lists: studying in Pakistan (default) or abroad.
  const where = f.get('where') === 'abroad' ? 'abroad' : 'pakistan'
  const inTab = scholarships.filter((s) => (where === 'abroad' ? !inPakistan(s) : inPakistan(s)))
  const q = f.get('q')
  const level = f.get('level')
  const country = f.get('country')
  const live = f.get('live') // a city, or "other:<province>"
  const liveProvince = live ? provinceFor(live) : null
  const sort = f.get('sort') || 'deadline'
  const fullOnly = f.getBool('full')
  const upcomingOnly = f.getBool('upcoming')

  const countries = uniqueSorted(inTab.map((s) => s.country))
  const levelsInTab = LEVELS.filter((l) => inTab.some((s) => s.levels.includes(l)))

  const results = useMemo(() => {
    const list = inTab.filter((s) => {
      if (level && !s.levels.includes(level as LevelId)) return false
      if (where === 'abroad' && country && s.country !== country) return false
      // Province-only scholarships show only if you live in that province.
      if (where === 'pakistan' && liveProvince && s.regions?.length && !s.regions.includes(liveProvince)) return false
      if (fullOnly && s.fundingType !== 'full') return false
      if (upcomingOnly) {
        const d = daysUntil(s.deadline)
        if (d === null || d < 0) return false
      }
      return matchesQuery(q, [s.name, s.provider, s.country, s.eligibility])
    })
    return list.sort(sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : byDeadline)
  }, [inTab, where, q, level, country, liveProvince, sort, fullOnly, upcomingOnly])

  return (
    <>
      <PageHeader title={t.scholarships.title} intro={t.scholarships.intro}>
        <div className="flex max-w-2xl gap-3 rounded-xl bg-sand p-4 text-ink">
          <Info aria-hidden size={20} strokeWidth={1.5} className="mt-1 shrink-0 text-mint-900" />
          <p>
            <strong>{t.scholarships.disclaimerTitle}: </strong>
            {t.scholarships.disclaimer}
          </p>
        </div>
      </PageHeader>

      <Section className="!pt-8 md:!pt-12">
        <div role="tablist" aria-label={t.scholarships.tabsLabel} className="mb-2 grid grid-cols-2 gap-2 sm:inline-grid sm:w-auto">
          {(['pakistan', 'abroad'] as const).map((key) => {
            const active = where === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                // Switching tabs clears filters, since countries and levels differ between the two lists.
                onClick={() => {
                  f.clear()
                  if (key === 'abroad') f.set('where', 'abroad')
                }}
                className={`min-h-[52px] rounded-xl border px-6 text-lg font-semibold transition duration-150 ${
                  active ? 'border-mint-700 bg-mint-700 text-white' : 'border-line bg-white text-ink hover:bg-mint-50'
                }`}
              >
                {key === 'pakistan' ? t.scholarships.tabPakistan : t.scholarships.tabAbroad}
              </button>
            )
          })}
        </div>
        <p className="mb-6 max-w-2xl text-slate">
          {where === 'pakistan' ? t.scholarships.introPakistan : t.scholarships.introAbroad}
          {where === 'pakistan' && (
            <>
              {' '}
              {t.scholarships.universityAidNote}{' '}
              <Link to="/universities" className="font-semibold">
                {t.scholarships.universityAidLink} →
              </Link>
            </>
          )}
        </p>
        {where === 'pakistan' && <p className="mb-4 max-w-2xl text-sm text-slate">{t.scholarships.whereLiveNote}</p>}
        <FilterBar label={t.filters.filters}>
          <SearchInput
            value={q}
            onChange={(v) => f.set('q', v)}
            label={t.filters.search}
            placeholder={t.filters.searchScholarships}
            clearLabel={t.filters.clear}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <FilterSelect
              label={t.common.level}
              value={level}
              onChange={(v) => f.set('level', v)}
              options={[{ value: '', label: t.filters.allLevels }, ...levelsInTab.map((l) => ({ value: l, label: t.levels[l] }))]}
            />
            {where === 'pakistan' ? (
              <div className="flex flex-col gap-1">
                <label htmlFor="where-live" className="text-sm font-semibold text-slate">
                  {t.filters.whereLive}
                </label>
                <select
                  id="where-live"
                  value={live}
                  onChange={(e) => f.set('live', e.target.value)}
                  className="min-h-tap w-full rounded-xl border border-line bg-white px-3 text-base text-ink"
                >
                  <option value="">{t.filters.anywherePk}</option>
                  {PROVINCES.map((p) => (
                    <optgroup key={p} label={p}>
                      {CITIES[p].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      {CITIES[p].length > 1 && <option value={`other:${p}`}>{fmt(t.filters.otherCityIn, { province: p })}</option>}
                    </optgroup>
                  ))}
                </select>
              </div>
            ) : (
              <FilterSelect
                label={t.filters.studyIn}
                value={country}
                onChange={(v) => f.set('country', v)}
                options={[{ value: '', label: t.filters.allCountries }, ...countries.map((c) => ({ value: c, label: c }))]}
              />
            )}
            <FilterSelect
              label={t.filters.sortBy}
              value={sort}
              onChange={(v) => f.set('sort', v === 'deadline' ? '' : v)}
              options={[
                { value: 'deadline', label: t.filters.sortDeadline },
                { value: 'name', label: t.filters.sortName },
              ]}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FilterToggle label={t.filters.fullyFundedOnly} checked={fullOnly} onChange={(v) => f.set('full', v)} />
            <FilterToggle label={t.filters.deadlineUpcoming} checked={upcomingOnly} onChange={(v) => f.set('upcoming', v)} />
            {(q || level || country || live || f.get('sort') || fullOnly || upcomingOnly) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
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
            {results.map((s) => (
              <ScholarshipCard key={s.slug} scholarship={s} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title={t.empty.scholarshipsTitle}
              text={t.empty.scholarshipsText}
              action={<Button onClick={clearFilters}>{t.filters.clear}</Button>}
            />
          </div>
        )}
        <div className="mt-12">
          <AskCta />
        </div>
      </Section>
    </>
  )
}
