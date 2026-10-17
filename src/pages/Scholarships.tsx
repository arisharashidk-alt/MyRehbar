import { useMemo } from 'react'
import { Info } from 'lucide-react'
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

const LEVELS: LevelId[] = ['undergraduate', 'masters', 'phd', 'exchange']

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

  const q = f.get('q')
  const level = f.get('level')
  const country = f.get('country')
  const sort = f.get('sort') || 'deadline'
  const fullOnly = f.getBool('full')
  const pakistaniOnly = f.getBool('pk')
  const upcomingOnly = f.getBool('upcoming')

  const countries = uniqueSorted(scholarships.map((s) => s.country))

  const results = useMemo(() => {
    const list = scholarships.filter((s) => {
      if (level && !s.levels.includes(level as LevelId)) return false
      if (country && s.country !== country) return false
      if (fullOnly && s.fundingType !== 'full') return false
      if (pakistaniOnly && !s.openToPakistani) return false
      if (upcomingOnly) {
        const d = daysUntil(s.deadline)
        if (d === null || d < 0) return false
      }
      return matchesQuery(q, [s.name, s.provider, s.country, s.eligibility])
    })
    return list.sort(sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : byDeadline)
  }, [q, level, country, sort, fullOnly, pakistaniOnly, upcomingOnly])

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
              options={[{ value: '', label: t.filters.allLevels }, ...LEVELS.map((l) => ({ value: l, label: t.levels[l] }))]}
            />
            <FilterSelect
              label={t.common.country}
              value={country}
              onChange={(v) => f.set('country', v)}
              options={[{ value: '', label: t.filters.allCountries }, ...countries.map((c) => ({ value: c, label: c }))]}
            />
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
            <FilterToggle label={t.filters.openForPakistani} checked={pakistaniOnly} onChange={(v) => f.set('pk', v)} />
            <FilterToggle label={t.filters.deadlineUpcoming} checked={upcomingOnly} onChange={(v) => f.set('upcoming', v)} />
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
            {results.map((s) => (
              <ScholarshipCard key={s.slug} scholarship={s} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title={t.empty.scholarshipsTitle}
              text={t.empty.scholarshipsText}
              action={<Button onClick={f.clear}>{t.filters.clear}</Button>}
            />
          </div>
        )}
      </Section>
    </>
  )
}
