import { useMemo } from 'react'
import { Heart } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { RehbarCard } from '../components/RehbarCard'
import { FilterBar, FilterSelect, FilterToggle } from '../components/FilterBar'
import { SearchInput } from '../components/SearchInput'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { rehbars } from '../data'
import { matchesQuery, uniqueSorted } from '../lib/text'
import { useFilterParams } from '../hooks/useFilterParams'
import { usePageMeta } from '../hooks/usePageMeta'
import { fmt, useI18n } from '../i18n'
import type { FieldId } from '../types'

export default function Rehbars() {
  const { t } = useI18n()
  usePageMeta(t.rehbars.title, t.rehbars.intro)
  const f = useFilterParams()

  const q = f.get('q')
  const field = f.get('field')
  const country = f.get('country') // '', 'pakistan', 'abroad', or a country name
  const language = f.get('lang')
  const womenOnly = f.getBool('women')
  const scholarsOnly = f.getBool('scholars')

  // Options come from the data, so new countries or languages appear automatically.
  const fieldIds = uniqueSorted(rehbars.map((r) => r.field)) as FieldId[]
  const abroadCountries = uniqueSorted(rehbars.map((r) => r.country).filter((c) => c !== 'Pakistan'))
  const languages = uniqueSorted(rehbars.flatMap((r) => r.languages))

  const results = useMemo(
    () =>
      rehbars.filter((r) => {
        if (field && r.field !== field) return false
        if (country === 'pakistan' && r.country !== 'Pakistan') return false
        if (country === 'abroad' && r.country === 'Pakistan') return false
        if (country && country !== 'pakistan' && country !== 'abroad' && r.country !== country) return false
        if (language && !r.languages.includes(language)) return false
        if (womenOnly && !r.woman) return false
        if (scholarsOnly && !r.scholarshipRecipient) return false
        return matchesQuery(q, [r.name, r.university, r.country, r.city, r.program, t.fields[r.field], r.story, ...r.tags])
      }),
    [q, field, country, language, womenOnly, scholarsOnly, t],
  )

  return (
    <>
      <PageHeader title={t.rehbars.title} intro={t.rehbars.intro}>
        <p className="flex items-start gap-2 text-mint-900">
          <Heart aria-hidden size={20} strokeWidth={1.5} className="mt-1 shrink-0 text-mint-700" />
          {t.rehbars.womenNote}
        </p>
      </PageHeader>

      <Section className="!pt-8 md:!pt-12">
        <FilterBar label={t.filters.filters}>
          <SearchInput
            value={q}
            onChange={(v) => f.set('q', v)}
            label={t.filters.search}
            placeholder={t.filters.searchRehbars}
            clearLabel={t.filters.clear}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <FilterSelect
              label={t.common.field}
              value={field}
              onChange={(v) => f.set('field', v)}
              options={[{ value: '', label: t.filters.allFields }, ...fieldIds.map((id) => ({ value: id, label: t.fields[id] }))]}
            />
            <FilterSelect
              label={t.common.country}
              value={country}
              onChange={(v) => f.set('country', v)}
              options={[
                { value: '', label: t.filters.allCountries },
                { value: 'pakistan', label: t.filters.pakistan },
                { value: 'abroad', label: t.filters.abroad },
                ...abroadCountries.map((c) => ({ value: c, label: c })),
              ]}
            />
            <FilterSelect
              label={t.common.languages}
              value={language}
              onChange={(v) => f.set('lang', v)}
              options={[{ value: '', label: t.filters.allLanguages }, ...languages.map((l) => ({ value: l, label: l }))]}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FilterToggle label={t.filters.womenOnly} checked={womenOnly} onChange={(v) => f.set('women', v)} />
            <FilterToggle
              label={t.filters.scholarshipRecipients}
              checked={scholarsOnly}
              onChange={(v) => f.set('scholars', v)}
            />
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
            {results.map((r) => (
              <RehbarCard key={r.slug} rehbar={r} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title={t.empty.rehbarsTitle}
              text={t.empty.rehbarsText}
              action={
                <>
                  <Button variant="secondary" onClick={f.clear}>
                    {t.filters.clear}
                  </Button>
                  <Button to="/students">{t.rehbars.notSureCta}</Button>
                </>
              }
            />
          </div>
        )}

        <div className="mt-12 flex flex-col items-start gap-4 rounded-card border border-line bg-mint-50 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl">{t.rehbars.notSure}</h2>
            <p className="mt-1 text-slate">{t.rehbars.notSureText}</p>
          </div>
          <Button to="/students">{t.rehbars.notSureCta}</Button>
        </div>
      </Section>
    </>
  )
}
