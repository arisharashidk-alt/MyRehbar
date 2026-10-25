import { useId } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Pin, Plus, Star, Trash2 } from 'lucide-react'
import { Button } from '../../components/Button'
import { useI18n } from '../../i18n'
import { APP_COLORS, GROUPS, LIMITS, STATUSES, newId, safeUrl, type Application, type Column, type Semester, type TrackerData } from '../model'
import { APP_COLOR_CLASSES, URGENCY_CLASSES, estimateDeadline, missingMilestones, urgency } from '../plan'
import { addNote, patchApp, placeNote, removeApp, withDeadline, withSemester } from '../actions'
import { useTrackerText } from '../text'
import { Dialog, iconButtonClass, inputClass, labelClass, smallInputClass } from './ui'

type Update = (fn: (d: TrackerData) => TrackerData) => void

const thisYear = new Date().getFullYear()

export function ApplicationPanel({ app, data, update, onClose }: { app: Application; data: TrackerData; update: Update; onClose: () => void }) {
  const tt = useTrackerText()
  const { t } = useI18n()
  const p = tt.panel
  const formId = useId()
  const id = (n: string) => `${formId}-${n}`
  const set = (fn: (a: Application) => Application) => update(patchApp(app.id, fn))
  const pinned = data.notes.some((n) => n.appId === app.id)
  const effectiveDeadline = app.deadline ?? estimateDeadline(app.semester)
  const years = Array.from(new Set([app.semester.year, ...Array.from({ length: 6 }, (_, i) => thisYear + i)])).sort()
  const suggestions = missingMilestones(app, tt, data.tests)

  function remove() {
    if (window.confirm(p.confirmRemove.replace('{name}', app.name))) {
      update(removeApp(app.id))
      onClose()
    }
  }

  function pin() {
    update((d) => addNote({ id: newId(), ...placeNote(d.notes), color: 'white', text: '', appId: app.id })(d))
  }

  const groups = GROUPS.map((g) => ({ group: g, items: app.milestones.filter((m) => m.group === g) })).filter((g) => g.items.length > 0)

  return (
    <Dialog open onClose={onClose} title={p.title} closeLabel={p.close} variant="side">
      <div className="space-y-8">
        {/* Top: name, star, colour, links */}
        <div className={`rounded-card border-s-4 ${APP_COLOR_CLASSES[app.color].border} bg-paper p-4`}>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <label htmlFor={id('name')} className="sr-only">
                  {tt.add.name}
                </label>
                <input id={id('name')} value={app.name} maxLength={LIMITS.text} onChange={(e) => set((a) => ({ ...a, name: e.target.value }))} className={`${inputClass} text-lg font-bold text-mint-900`} />
              </div>
              <div>
                <label htmlFor={id('program')} className="sr-only">
                  {tt.add.program}
                </label>
                <input id={id('program')} value={app.program} maxLength={LIMITS.text} placeholder={tt.add.programPlaceholder} onChange={(e) => set((a) => ({ ...a, program: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <button type="button" className={iconButtonClass} aria-pressed={app.starred} onClick={() => set((a) => ({ ...a, starred: !a.starred }))}>
              <Star aria-hidden size={24} strokeWidth={1.5} className={app.starred ? 'fill-amber-200 text-amber-700' : ''} />
              <span className="sr-only">{app.starred ? tt.table.unstar : tt.table.star}</span>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {app.url && (
              <a href={app.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-tap items-center gap-1 font-semibold">
                {p.openLink}
                <ExternalLink aria-hidden size={14} strokeWidth={1.5} />
                <span className="sr-only">{t.common.opensNewTab}</span>
              </a>
            )}
            {app.source && (
              <Link to={`/${app.source.type === 'university' ? 'universities' : 'scholarships'}/${app.source.slug}`} className="inline-flex min-h-tap items-center font-semibold">
                {p.viewOnMyRehbar}
              </Link>
            )}
          </div>
        </div>

        {/* Details */}
        <section aria-labelledby={id('details')}>
          <h3 id={id('details')} className="text-lg">
            {p.details}
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={id('status')} className={labelClass}>
                {tt.table.status}
              </label>
              <select id={id('status')} value={app.status} onChange={(e) => set((a) => ({ ...a, status: e.target.value as Application['status'] }))} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {tt.status[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={id('kind')} className={labelClass}>
                {tt.table.kind}
              </label>
              <select id={id('kind')} value={app.kind} onChange={(e) => set((a) => ({ ...a, kind: e.target.value as Application['kind'] }))} className={inputClass}>
                <option value="program">{tt.kinds.program}</option>
                <option value="scholarship">{tt.kinds.scholarship}</option>
              </select>
            </div>
            <div>
              <label htmlFor={id('country')} className={labelClass}>
                {tt.table.country}
              </label>
              <input id={id('country')} value={app.country} maxLength={LIMITS.text} onChange={(e) => set((a) => ({ ...a, country: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <span className={labelClass}>{tt.table.semester}</span>
              <div className="flex gap-2">
                <label htmlFor={id('season')} className="sr-only">
                  {tt.add.season}
                </label>
                <select id={id('season')} value={app.semester.season} onChange={(e) => set((a) => withSemester(a, { ...a.semester, season: e.target.value as Semester['season'] }))} className={inputClass}>
                  <option value="fall">{tt.seasons.fall}</option>
                  <option value="spring">{tt.seasons.spring}</option>
                </select>
                <label htmlFor={id('year')} className="sr-only">
                  {tt.add.year}
                </label>
                <select id={id('year')} value={app.semester.year} onChange={(e) => set((a) => withSemester(a, { ...a.semester, year: Number(e.target.value) }))} className={inputClass}>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={id('deadline')} className={labelClass}>
                {tt.table.deadline}
              </label>
              <input id={id('deadline')} type="date" value={effectiveDeadline} onChange={(e) => set((a) => withDeadline(a, e.target.value || undefined))} className={`${inputClass} sm:max-w-xs`} />
              {app.deadlineEstimated && (
                <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-sand p-3 text-sm">
                  <span className="flex-1">{p.estimatedNote}</span>
                  <button type="button" className="min-h-tap font-semibold text-mint-900 underline" onClick={() => set((a) => withDeadline(a, effectiveDeadline))}>
                    {p.confirmDate}
                  </button>
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={id('url')} className={labelClass}>
                {tt.add.url}
              </label>
              <input
                id={id('url')}
                type="url"
                dir="ltr"
                defaultValue={app.url}
                maxLength={2000}
                placeholder="https://"
                onBlur={(e) => set((a) => ({ ...a, url: safeUrl(e.target.value) }))}
                className={inputClass}
              />
            </div>
            <fieldset className="sm:col-span-2">
              <legend className={labelClass}>{tt.add.color}</legend>
              <div className="flex flex-wrap gap-1">
                {APP_COLORS.map((c) => (
                  <label key={c} className="relative inline-flex min-h-tap min-w-tap cursor-pointer items-center justify-center">
                    <input type="radio" name={id('color')} checked={app.color === c} onChange={() => set((a) => ({ ...a, color: c }))} className="peer sr-only" />
                    <span className={`h-7 w-7 rounded-full ${APP_COLOR_CLASSES[c].solid} ring-offset-2 peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-mint-700`} />
                    <span className="sr-only">{tt.colors[c]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        {/* Steps */}
        <section aria-labelledby={id('steps')}>
          <h3 id={id('steps')} className="text-lg">
            {p.milestones}
          </h3>
          <p className="mt-1 text-sm text-slate">{p.milestonesHint}</p>
          <div className="mt-4 space-y-5">
            {groups.map(({ group, items }) => (
              <div key={group}>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate">{tt.groups[group]}</h4>
                <ul className="space-y-2">
                  {items.map((m) => {
                    const u = m.due ? urgency(m.due, m.done) : m.done ? 'done' : null
                    return (
                      <li key={m.id} className={`flex flex-wrap items-center gap-2 rounded-xl border p-2 ${u ? URGENCY_CLASSES[u].chip.replace('line-through', '') : 'border-line bg-white'}`}>
                        <label className="inline-flex min-h-tap min-w-tap items-center justify-center">
                          <input
                            type="checkbox"
                            checked={m.done}
                            onChange={(e) => set((a) => ({ ...a, milestones: a.milestones.map((x) => (x.id === m.id ? { ...x, done: e.target.checked } : x)) }))}
                            className="h-5 w-5 accent-mint-700"
                          />
                          <span className="sr-only">
                            {p.stepDone}: {m.title}
                          </span>
                        </label>
                        <label className="min-w-0 flex-1 basis-48">
                          <span className="sr-only">{p.stepTitle}</span>
                          <input
                            value={m.title}
                            maxLength={LIMITS.text}
                            onChange={(e) => set((a) => ({ ...a, milestones: a.milestones.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x)) }))}
                            className={`${smallInputClass} ${m.done ? 'line-through text-slate' : ''}`}
                          />
                        </label>
                        <label className="w-40">
                          <span className="sr-only">{p.stepDate}</span>
                          <input
                            type="date"
                            value={m.due ?? ''}
                            onChange={(e) => set((a) => ({ ...a, milestones: a.milestones.map((x) => (x.id === m.id ? { ...x, due: e.target.value || undefined } : x)) }))}
                            className={smallInputClass}
                          />
                        </label>
                        <button
                          type="button"
                          className={iconButtonClass}
                          onClick={() => set((a) => ({ ...a, milestones: a.milestones.filter((x) => x.id !== m.id) }))}
                        >
                          <Trash2 aria-hidden size={18} strokeWidth={1.5} />
                          <span className="sr-only">
                            {p.removeStep}: {m.title}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus aria-hidden size={16} strokeWidth={1.5} />}
              disabled={app.milestones.length >= LIMITS.milestones}
              onClick={() => set((a) => ({ ...a, milestones: [...a.milestones, { id: newId(), title: p.newMilestone, group: 'application', done: false }] }))}
            >
              {p.addMilestone}
            </Button>
            {suggestions.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => set((a) => ({ ...a, milestones: [...a.milestones, ...suggestions].slice(0, LIMITS.milestones) }))}
              >
                {p.suggest} ({suggestions.length})
              </Button>
            )}
          </div>
        </section>

        {/* The person's own columns */}
        {data.columns.length > 0 && (
          <section aria-labelledby={id('cols')}>
            <h3 id={id('cols')} className="text-lg">
              {p.yourColumns}
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {data.columns.map((c) => (
                <div key={c.id}>
                  <label htmlFor={id(`c-${c.id}`)} className={labelClass}>
                    {c.name}
                  </label>
                  <ColumnInput id={id(`c-${c.id}`)} column={c} value={app.values[c.id]} onChange={(v) => set((a) => ({ ...a, values: { ...a.values, [c.id]: v } }))} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fields for this application only */}
        <section aria-labelledby={id('extra')}>
          <h3 id={id('extra')} className="text-lg">
            {p.extra}
          </h3>
          <p className="mt-1 text-sm text-slate">{p.extraHint}</p>
          <ul className="mt-3 space-y-2">
            {app.extra.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-2">
                <label className="w-40">
                  <span className="sr-only">{p.extraLabel}</span>
                  <input
                    value={f.label}
                    maxLength={LIMITS.text}
                    onChange={(e) => set((a) => ({ ...a, extra: a.extra.map((x) => (x.id === f.id ? { ...x, label: e.target.value } : x)) }))}
                    className={`${smallInputClass} font-semibold`}
                  />
                </label>
                <label className="min-w-0 flex-1 basis-48">
                  <span className="sr-only">{p.extraValue}</span>
                  <input
                    value={f.value}
                    maxLength={LIMITS.longText}
                    onChange={(e) => set((a) => ({ ...a, extra: a.extra.map((x) => (x.id === f.id ? { ...x, value: e.target.value } : x)) }))}
                    className={smallInputClass}
                  />
                </label>
                <button type="button" className={iconButtonClass} onClick={() => set((a) => ({ ...a, extra: a.extra.filter((x) => x.id !== f.id) }))}>
                  <Trash2 aria-hidden size={18} strokeWidth={1.5} />
                  <span className="sr-only">
                    {p.removeExtra}: {f.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3"
            icon={<Plus aria-hidden size={16} strokeWidth={1.5} />}
            disabled={app.extra.length >= LIMITS.extra}
            onClick={() => set((a) => ({ ...a, extra: [...a.extra, { id: newId(), label: p.extraLabel, value: '' }] }))}
          >
            {p.addExtra}
          </Button>
        </section>

        {/* Notes */}
        <section>
          <label htmlFor={id('notes')} className="text-lg font-bold text-mint-900">
            {p.notes}
          </label>
          <textarea
            id={id('notes')}
            rows={5}
            value={app.notes}
            maxLength={LIMITS.longText}
            placeholder={p.notesPlaceholder}
            onChange={(e) => set((a) => ({ ...a, notes: e.target.value }))}
            className={`${inputClass} mt-2 py-2`}
          />
        </section>

        <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-4">
          <Button size="sm" variant="secondary" icon={<Pin aria-hidden size={16} strokeWidth={1.5} />} disabled={pinned} onClick={pin}>
            {pinned ? p.pinned : p.pinToBoard}
          </Button>
          <button type="button" onClick={remove} className="inline-flex min-h-tap items-center gap-2 rounded-xl px-3 text-sm font-semibold text-danger hover:bg-danger-50">
            <Trash2 aria-hidden size={16} strokeWidth={1.5} />
            {p.remove}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

/** The right input for a column type. Used in the panel and in the table. */
export function ColumnInput({
  id,
  column,
  value,
  onChange,
  compact = false,
  label,
}: {
  id?: string
  column: Column
  value: string | boolean | undefined
  onChange: (v: string | boolean) => void
  compact?: boolean
  /** Accessible name when there is no visible label */
  label?: string
}) {
  const tt = useTrackerText()
  const cls = compact ? smallInputClass : inputClass
  const text = typeof value === 'string' ? value : ''
  switch (column.type) {
    case 'checkbox':
      return (
        <label className="inline-flex min-h-tap items-center gap-2 text-sm">
          <input id={id} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-mint-700" />
          <span className={compact ? 'sr-only' : ''}>{label ?? (value === true ? tt.table.yes : tt.table.no)}</span>
        </label>
      )
    case 'select':
      return (
        <select id={id} aria-label={label} value={text} onChange={(e) => onChange(e.target.value)} className={cls}>
          <option value="">—</option>
          {column.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )
    case 'date':
      return <input id={id} aria-label={label} type="date" value={text} onChange={(e) => onChange(e.target.value)} className={cls} />
    case 'number':
      return <input id={id} aria-label={label} type="text" inputMode="decimal" value={text} maxLength={40} onChange={(e) => onChange(e.target.value)} className={cls} />
    case 'link': {
      const href = safeUrl(text)
      return (
        <div className="flex items-center gap-1">
          <input id={id} aria-label={label} type="url" dir="ltr" value={text} maxLength={2000} placeholder="https://" onChange={(e) => onChange(e.target.value)} className={cls} />
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer" className={iconButtonClass}>
              <ExternalLink aria-hidden size={16} strokeWidth={1.5} />
              <span className="sr-only">{tt.panel.openLink}</span>
            </a>
          )}
        </div>
      )
    }
    default:
      return <input id={id} aria-label={label} value={text} maxLength={LIMITS.longText} onChange={(e) => onChange(e.target.value)} className={cls} />
  }
}
