import { useId, useMemo, useState, type FormEvent } from 'react'
import { Check, Search, Star } from 'lucide-react'
import { Button } from '../../components/Button'
import { scholarships } from '../../data'
import { universities } from '../../data/universities'
import { useI18n } from '../../i18n'
import { APP_COLORS, LIMITS, newId, safeUrl, type AppColor, type Application, type Requirements, type Semester, type TrackerData } from '../model'
import { APP_COLOR_CLASSES, buildMilestones, defaultRequirements, defaultSemester, estimateDeadline, nextColor } from '../plan'
import { useTrackerText } from '../text'
import { Dialog, inputClass, labelClass } from './ui'

export interface Preset {
  type: 'university' | 'scholarship'
  slug: string
}

interface Choice {
  type: 'university' | 'scholarship'
  slug: string
  name: string
  sub: string
  country: string
  url: string
  deadline?: string
  levels?: string[]
}

function choices(): Choice[] {
  return [
    ...scholarships.map((s) => ({
      type: 'scholarship' as const,
      slug: s.slug,
      name: s.name,
      sub: `${s.provider} · ${s.country}`,
      country: s.country === 'Multiple countries' ? '' : s.country,
      url: s.officialUrl,
      deadline: s.deadline ?? undefined,
      levels: s.levels,
    })),
    ...universities.map((u) => ({
      type: 'university' as const,
      slug: u.slug,
      name: u.shortName && u.shortName !== u.name ? `${u.shortName} · ${u.name}` : u.name,
      sub: `${u.city}, Pakistan`,
      country: 'Pakistan',
      url: u.admissionsUrl ?? u.website,
    })),
  ]
}

const thisYear = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => thisYear + i)

export function AddApplication({
  data,
  preset,
  onClose,
  onAdd,
}: {
  data: TrackerData
  preset?: Preset
  onClose: () => void
  onAdd: (app: Application) => void
}) {
  const tt = useTrackerText()
  const { t } = useI18n()
  const x = tt.add
  const formId = useId()
  const all = useMemo(choices, [])
  const presetChoice = preset ? all.find((c) => c.type === preset.type && c.slug === preset.slug) : undefined

  const [tab, setTab] = useState<'directory' | 'manual'>(presetChoice || !preset ? 'directory' : 'manual')
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Choice | undefined>(presetChoice)
  const [name, setName] = useState('')
  const [program, setProgram] = useState('')
  const [country, setCountry] = useState('')
  const [kind, setKind] = useState<Application['kind']>(presetChoice?.type === 'scholarship' ? 'scholarship' : 'program')
  const [url, setUrl] = useState('')
  const [semester, setSemester] = useState<Semester>(data.target ?? defaultSemester())
  const today = new Date().toISOString().slice(0, 10)
  const [deadline, setDeadline] = useState(presetChoice?.deadline && presetChoice.deadline >= today ? presetChoice.deadline : '')
  const [req, setReq] = useState<Requirements>(() => defaultRequirements(presetChoice?.country ?? '', presetChoice?.type === 'scholarship' ? 'scholarship' : 'program'))
  const [color, setColor] = useState<AppColor>(() => nextColor(data.applications))
  const [starred, setStarred] = useState(false)
  const [error, setError] = useState('')

  const existing = new Set(data.applications.filter((a) => a.source).map((a) => `${a.source!.type}:${a.source!.slug}`))
  const q = query.trim().toLowerCase()
  const results = all.filter((c) => !q || `${c.name} ${c.sub}`.toLowerCase().includes(q)).slice(0, 40)
  const id = (n: string) => `${formId}-${n}`

  function pick(c: Choice) {
    setPicked(c)
    setKind(c.type === 'scholarship' ? 'scholarship' : 'program')
    setReq(defaultRequirements(c.country, c.type === 'scholarship' ? 'scholarship' : 'program'))
    if (c.deadline && c.deadline >= today) setDeadline(c.deadline)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (data.applications.length >= LIMITS.applications) return setError(x.full.replace('{count}', String(LIMITS.applications)))
    const fromDirectory = tab === 'directory' && picked
    const finalName = fromDirectory ? picked.name : name.trim()
    if (!finalName) return setError(x.missingName)
    const base = {
      kind: fromDirectory ? (picked.type === 'scholarship' ? 'scholarship' : 'program') : kind,
      requirements: req,
      deadline: deadline || undefined,
      semester,
    } as const
    onAdd({
      id: newId(),
      source: fromDirectory ? { type: picked.type, slug: picked.slug } : undefined,
      name: finalName.slice(0, LIMITS.text),
      program: program.trim().slice(0, LIMITS.text),
      country: (fromDirectory ? picked.country : country.trim()).slice(0, LIMITS.text),
      ...base,
      deadlineEstimated: !deadline,
      status: 'researching',
      starred,
      color,
      url: fromDirectory ? safeUrl(picked.url) : safeUrl(url),
      notes: '',
      milestones: buildMilestones(base, tt, data.tests),
      values: {},
      extra: [],
      createdAt: new Date().toISOString(),
    })
  }

  const tabClass = (active: boolean) =>
    `min-h-tap flex-1 rounded-lg px-3 text-sm font-semibold transition ${active ? 'bg-white text-mint-900 shadow-sm' : 'text-slate hover:text-mint-900'}`

  return (
    <Dialog open onClose={onClose} title={x.title} closeLabel={tt.panel.close} wide>
      <form noValidate onSubmit={onSubmit} className="space-y-6">
        <div role="tablist" className="flex gap-1 rounded-xl bg-mint-50 p-1">
          <button type="button" role="tab" aria-selected={tab === 'directory'} className={tabClass(tab === 'directory')} onClick={() => setTab('directory')}>
            {x.fromDirectory}
          </button>
          <button type="button" role="tab" aria-selected={tab === 'manual'} className={tabClass(tab === 'manual')} onClick={() => setTab('manual')}>
            {x.manual}
          </button>
        </div>

        {tab === 'directory' ? (
          <div>
            <label htmlFor={id('q')} className={labelClass}>
              {x.searchDirectory}
            </label>
            <div className="relative">
              <Search aria-hidden size={18} strokeWidth={1.5} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate" />
              <input id={id('q')} type="search" value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} ps-10`} />
            </div>
            <ul className="mt-3 max-h-64 divide-y divide-line overflow-y-auto rounded-xl border border-line">
              {results.length === 0 && <li className="p-4 text-sm text-slate">{x.noResults}</li>}
              {results.map((c) => {
                const key = `${c.type}:${c.slug}`
                const isPicked = picked?.type === c.type && picked.slug === c.slug
                const added = existing.has(key)
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => pick(c)}
                      aria-pressed={isPicked}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-start transition ${isPicked ? 'bg-mint-50' : 'hover:bg-paper'}`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-mint-900">{c.name}</span>
                        <span className="block text-sm text-slate">
                          {c.type === 'scholarship' ? x.scholarships : x.universities} · {c.sub}
                          {c.levels?.length ? ` · ${c.levels.map((l) => t.levels[l as keyof typeof t.levels] ?? l).join(', ')}` : ''}
                        </span>
                        {added && <span className="block text-sm font-semibold text-orange-700">{x.alreadyAdded}</span>}
                      </span>
                      {isPicked && <Check aria-hidden size={20} strokeWidth={2} className="shrink-0 text-mint-700" />}
                      <span className="sr-only">{isPicked ? x.picked : x.pick}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4">
              <label htmlFor={id('program2')} className={labelClass}>
                {x.program}
              </label>
              <input id={id('program2')} value={program} maxLength={LIMITS.text} onChange={(e) => setProgram(e.target.value)} placeholder={x.programPlaceholder} className={inputClass} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={id('name')} className={labelClass}>
                {x.name}
              </label>
              <input id={id('name')} value={name} maxLength={LIMITS.text} onChange={(e) => setName(e.target.value)} placeholder={x.namePlaceholder} className={inputClass} />
            </div>
            <div>
              <label htmlFor={id('program')} className={labelClass}>
                {x.program}
              </label>
              <input id={id('program')} value={program} maxLength={LIMITS.text} onChange={(e) => setProgram(e.target.value)} placeholder={x.programPlaceholder} className={inputClass} />
            </div>
            <div>
              <label htmlFor={id('country')} className={labelClass}>
                {x.country}
              </label>
              <input
                id={id('country')}
                value={country}
                maxLength={LIMITS.text}
                onChange={(e) => setCountry(e.target.value)}
                onBlur={() => setReq(defaultRequirements(country, kind))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={id('kind')} className={labelClass}>
                {x.kind}
              </label>
              <select id={id('kind')} value={kind} onChange={(e) => setKind(e.target.value as Application['kind'])} className={inputClass}>
                <option value="program">{tt.kinds.program}</option>
                <option value="scholarship">{tt.kinds.scholarship}</option>
              </select>
            </div>
            <div>
              <label htmlFor={id('url')} className={labelClass}>
                {x.url}
              </label>
              <input id={id('url')} type="url" dir="ltr" value={url} maxLength={2000} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className={inputClass} />
            </div>
          </div>
        )}

        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className={`${labelClass} sm:col-span-3`}>{x.semester}</legend>
          <div>
            <label htmlFor={id('season')} className="mb-1 block text-sm text-slate">
              {x.season}
            </label>
            <select id={id('season')} value={semester.season} onChange={(e) => setSemester({ ...semester, season: e.target.value as Semester['season'] })} className={inputClass}>
              <option value="fall">{tt.seasonHints.fall}</option>
              <option value="spring">{tt.seasonHints.spring}</option>
            </select>
          </div>
          <div>
            <label htmlFor={id('year')} className="mb-1 block text-sm text-slate">
              {x.year}
            </label>
            <select id={id('year')} value={semester.year} onChange={(e) => setSemester({ ...semester, year: Number(e.target.value) })} className={inputClass}>
              {(YEARS.includes(semester.year) ? YEARS : [semester.year, ...YEARS]).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={id('deadline')} className="mb-1 block text-sm text-slate">
              {x.deadline}
            </label>
            <input id={id('deadline')} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
          </div>
          <p className="text-sm text-slate sm:col-span-3">
            {x.deadlineHint} {!deadline && <strong className="text-mint-900">({estimateDeadline(semester)})</strong>}
          </p>
        </fieldset>

        <fieldset>
          <legend className={labelClass}>{x.requirements}</legend>
          <p className="mb-3 text-sm text-slate">{x.requirementsHint}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ['englishTest', x.englishTest],
                ['gre', x.gre],
                ['attestation', x.attestation],
                ['vpd', x.vpd],
                ['interview', x.interview],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex min-h-tap items-center gap-3 text-sm">
                <input type="checkbox" checked={req[key]} onChange={(e) => setReq({ ...req, [key]: e.target.checked })} className="h-5 w-5 shrink-0 accent-mint-700" />
                {label}
              </label>
            ))}
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={id('essay')} className="mb-1 block text-sm text-slate">
                {x.essay}
              </label>
              <select id={id('essay')} value={req.essay} onChange={(e) => setReq({ ...req, essay: e.target.value as Requirements['essay'] })} className={inputClass}>
                {(['sop', 'motivation', 'none'] as const).map((k) => (
                  <option key={k} value={k}>
                    {x.essays[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={id('lors')} className="mb-1 block text-sm text-slate">
                {x.lors}
              </label>
              <select id={id('lors')} value={req.lors} onChange={(e) => setReq({ ...req, lors: Number(e.target.value) })} className={inputClass}>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <fieldset>
            <legend className={labelClass}>{x.color}</legend>
            <div className="flex flex-wrap gap-2">
              {APP_COLORS.map((c) => (
                <label key={c} className="relative inline-flex min-h-tap min-w-tap cursor-pointer items-center justify-center">
                  <input type="radio" name={id('color')} value={c} checked={color === c} onChange={() => setColor(c)} className="peer sr-only" />
                  <span className={`h-7 w-7 rounded-full ${APP_COLOR_CLASSES[c].solid} ring-offset-2 peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-mint-700`} />
                  <span className="sr-only">{tt.colors[c]}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex min-h-tap items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={starred} onChange={(e) => setStarred(e.target.checked)} className="peer sr-only" />
            <Star aria-hidden size={22} strokeWidth={1.5} className={`${starred ? 'fill-amber-200 text-amber-700' : 'text-slate'} peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-mint-700`} />
            {x.star}
          </label>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-danger-50 p-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <Button variant="ghost" onClick={onClose}>
            {tt.panel.close}
          </Button>
          <Button type="submit" disabled={tab === 'directory' && !picked}>
            {x.submit}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
