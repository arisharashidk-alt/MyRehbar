import { useId, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Columns3, Plus, Search, Star, Trash2 } from 'lucide-react'
import { Button } from '../../components/Button'
import { formatDate } from '../../data'
import { useI18n } from '../../i18n'
import { COLUMN_TYPES, LIMITS, STATUSES, newId, type Application, type Column, type TrackerData } from '../model'
import { APP_COLOR_CLASSES, URGENCY_CLASSES, estimateDeadline, nextMilestone, urgency } from '../plan'
import { patchApp, withDeadline } from '../actions'
import { useTrackerText } from '../text'
import { ColumnInput } from './ApplicationPanel'
import { Dialog, chipButtonClass, iconButtonClass, inputClass, labelClass, smallInputClass, Monogram } from './ui'

type Update = (fn: (d: TrackerData) => TrackerData) => void
type Sort = 'deadline' | 'name' | 'status' | 'starred'

export function ApplicationsView({ data, update, onOpen, onAdd }: { data: TrackerData; update: Update; onOpen: (id: string) => void; onAdd: () => void }) {
  const tt = useTrackerText()
  const { lang } = useI18n()
  const x = tt.table
  const searchId = useId()
  const [query, setQuery] = useState('')
  const [starredOnly, setStarredOnly] = useState(false)
  const [sort, setSort] = useState<Sort>('deadline')
  const [editColumns, setEditColumns] = useState(false)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = data.applications.filter(
      (a) => (!starredOnly || a.starred) && (!q || `${a.name} ${a.program} ${a.country} ${a.notes}`.toLowerCase().includes(q)),
    )
    const deadline = (a: Application) => a.deadline ?? estimateDeadline(a.semester)
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'status') return STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || deadline(a).localeCompare(deadline(b))
      if (sort === 'starred') return Number(b.starred) - Number(a.starred) || deadline(a).localeCompare(deadline(b))
      return deadline(a).localeCompare(deadline(b))
    })
  }, [data.applications, query, starredOnly, sort])

  const set = (id: string, fn: (a: Application) => Application) => update(patchApp(id, fn))

  if (data.applications.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-8 text-center md:p-12">
        <h2 className="text-xl">{x.empty}</h2>
        <p className="mx-auto mt-2 max-w-md text-slate">{x.emptyText}</p>
        <Button className="mt-6" onClick={onAdd} icon={<Plus aria-hidden size={18} strokeWidth={1.5} />}>
          {x.add}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Button onClick={onAdd} icon={<Plus aria-hidden size={18} strokeWidth={1.5} />}>
          {x.add}
        </Button>
        <button type="button" className={chipButtonClass} onClick={() => setEditColumns(true)}>
          <Columns3 aria-hidden size={18} strokeWidth={1.5} />
          {x.columns}
        </button>
        <div className="relative min-w-[200px] flex-1">
          <label htmlFor={searchId} className="sr-only">
            {x.search}
          </label>
          <Search aria-hidden size={18} strokeWidth={1.5} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate" />
          <input id={searchId} type="search" placeholder={x.search} value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} ps-10`} />
        </div>
        <label className="flex min-h-tap items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={starredOnly} onChange={(e) => setStarredOnly(e.target.checked)} className="h-5 w-5 accent-mint-700" />
          {x.starredOnly}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          {x.sort}
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`${inputClass} w-auto`}>
            {(Object.keys(x.sorts) as Sort[]).map((k) => (
              <option key={k} value={k}>
                {x.sorts[k]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-card border border-line bg-white p-6 text-slate">{x.noMatch}</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead className="bg-paper text-start text-slate">
              <tr>
                <th scope="col" className="w-12 px-2 py-3">
                  <span className="sr-only">{x.star}</span>
                </th>
                <th scope="col" className="px-3 py-3 text-start font-semibold">
                  {x.name}
                </th>
                <th scope="col" className="px-3 py-3 text-start font-semibold">
                  {x.status}
                </th>
                <th scope="col" className="px-3 py-3 text-start font-semibold">
                  {x.deadline}
                </th>
                <th scope="col" className="px-3 py-3 text-start font-semibold">
                  {x.next}
                </th>
                <th scope="col" className="px-3 py-3 text-start font-semibold">
                  {x.progress}
                </th>
                <th scope="col" className="px-3 py-3 text-start font-semibold">
                  {x.semester}
                </th>
                {data.columns.map((c) => (
                  <th key={c.id} scope="col" className="min-w-[160px] px-3 py-3 text-start font-semibold">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const deadline = a.deadline ?? estimateDeadline(a.semester)
                const submitted = ['submitted', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn'].includes(a.status)
                const u = urgency(deadline, submitted)
                const next = nextMilestone(a)
                const done = a.milestones.filter((m) => m.done).length
                const total = a.milestones.length
                return (
                  <tr key={a.id} className="border-t border-line align-top">
                    <td className="px-2 py-2">
                      <button type="button" className={iconButtonClass} aria-pressed={a.starred} onClick={() => set(a.id, (v) => ({ ...v, starred: !v.starred }))}>
                        <Star aria-hidden size={20} strokeWidth={1.5} className={a.starred ? 'fill-amber-200 text-amber-700' : ''} />
                        <span className="sr-only">
                          {a.starred ? x.unstar : x.star}: {a.name}
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => onOpen(a.id)} className="group flex min-h-tap items-start gap-3 text-start">
                        <Monogram name={a.name} className={`h-9 w-9 text-xs ${APP_COLOR_CLASSES[a.color].solid}`} />
                        <span className="min-w-0">
                          <span className="block font-semibold text-mint-900 group-hover:underline">{a.name}</span>
                          <span className="block text-slate">
                            {[a.program, a.country, tt.kinds[a.kind]].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        aria-label={`${x.status}: ${a.name}`}
                        value={a.status}
                        onChange={(e) => set(a.id, (v) => ({ ...v, status: e.target.value as Application['status'] }))}
                        className={`${smallInputClass} w-36`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {tt.status[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        aria-label={`${x.deadline}: ${a.name}`}
                        value={deadline}
                        onChange={(e) => set(a.id, (v) => withDeadline(v, e.target.value || undefined))}
                        className={`${smallInputClass} w-40 border ${URGENCY_CLASSES[u].chip.replace('line-through', '')}`}
                      />
                      {a.deadlineEstimated && <span className="mt-1 block text-xs font-semibold text-amber-700">{x.estimated}</span>}
                    </td>
                    <td className="max-w-[220px] px-3 py-2">
                      {next ? (
                        <>
                          <span className="block">{next.title}</span>
                          {next.due && (
                            <span className={`mt-1 inline-block rounded-full border px-2 text-xs font-semibold ${URGENCY_CLASSES[urgency(next.due, false)].chip}`}>
                              {formatDate(next.due, lang)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-mint-700">{x.nothingNext}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="block font-semibold" dir="ltr">
                        {done}/{total}
                      </span>
                      <span className="mt-1 block h-1.5 w-20 overflow-hidden rounded-full bg-line" aria-hidden>
                        <span className="block h-full bg-mint-500" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {tt.seasons[a.semester.season]} {a.semester.year}
                    </td>
                    {data.columns.map((c) => (
                      <td key={c.id} className="px-3 py-2">
                        <ColumnInput
                          compact
                          column={c}
                          label={`${c.name}: ${a.name}`}
                          value={a.values[c.id]}
                          onChange={(v) => set(a.id, (app) => ({ ...app, values: { ...app.values, [c.id]: v } }))}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editColumns && <ColumnsDialog data={data} update={update} onClose={() => setEditColumns(false)} />}
    </div>
  )
}

function ColumnsDialog({ data, update, onClose }: { data: TrackerData; update: Update; onClose: () => void }) {
  const tt = useTrackerText()
  const c = tt.columns
  const formId = useId()
  const setColumns = (fn: (cols: Column[]) => Column[]) => update((d) => ({ ...d, columns: fn(d.columns) }))
  const patch = (id: string, change: Partial<Column>) => setColumns((cols) => cols.map((col) => (col.id === id ? { ...col, ...change } : col)))

  function move(index: number, by: number) {
    setColumns((cols) => {
      const next = [...cols]
      const [item] = next.splice(index, 1)
      next.splice(index + by, 0, item)
      return next
    })
  }

  function remove(col: Column) {
    if (!window.confirm(c.confirmRemove.replace('{name}', col.name))) return
    update((d) => ({
      ...d,
      columns: d.columns.filter((x) => x.id !== col.id),
      applications: d.applications.map((a) => {
        if (!(col.id in a.values)) return a
        const values = { ...a.values }
        delete values[col.id]
        return { ...a, values }
      }),
    }))
  }

  return (
    <Dialog open onClose={onClose} title={c.title} closeLabel={tt.panel.close} wide>
      <p className="text-slate">{c.intro}</p>
      {data.columns.length === 0 && <p className="mt-4 rounded-xl bg-paper p-4 text-sm text-slate">{c.none}</p>}
      <ul className="mt-4 space-y-3">
        {data.columns.map((col, i) => (
          <li key={col.id} className="rounded-xl border border-line p-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[160px] flex-1">
                <label htmlFor={`${formId}-n-${col.id}`} className={labelClass}>
                  {c.name}
                </label>
                <input id={`${formId}-n-${col.id}`} value={col.name} maxLength={LIMITS.text} onChange={(e) => patch(col.id, { name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label htmlFor={`${formId}-t-${col.id}`} className={labelClass}>
                  {c.type}
                </label>
                <select id={`${formId}-t-${col.id}`} value={col.type} onChange={(e) => patch(col.id, { type: e.target.value as Column['type'] })} className={inputClass}>
                  {COLUMN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {c.types[type]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex">
                <button type="button" className={iconButtonClass} disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp aria-hidden size={18} strokeWidth={1.5} />
                  <span className="sr-only">
                    {c.moveUp}: {col.name}
                  </span>
                </button>
                <button type="button" className={iconButtonClass} disabled={i === data.columns.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown aria-hidden size={18} strokeWidth={1.5} />
                  <span className="sr-only">
                    {c.moveDown}: {col.name}
                  </span>
                </button>
                <button type="button" className={`${iconButtonClass} hover:text-danger`} onClick={() => remove(col)}>
                  <Trash2 aria-hidden size={18} strokeWidth={1.5} />
                  <span className="sr-only">
                    {c.remove}: {col.name}
                  </span>
                </button>
              </div>
            </div>
            {col.type === 'select' && (
              <div className="mt-3">
                <label htmlFor={`${formId}-o-${col.id}`} className={labelClass}>
                  {c.options}
                </label>
                <input
                  id={`${formId}-o-${col.id}`}
                  defaultValue={col.options.join(', ')}
                  maxLength={2000}
                  onBlur={(e) =>
                    patch(col.id, {
                      options: Array.from(new Set(e.target.value.split(',').map((s) => s.trim().slice(0, LIMITS.text)).filter(Boolean))).slice(0, 30),
                    })
                  }
                  className={inputClass}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap justify-between gap-3">
        <Button
          variant="secondary"
          icon={<Plus aria-hidden size={18} strokeWidth={1.5} />}
          disabled={data.columns.length >= LIMITS.columns}
          onClick={() => setColumns((cols) => [...cols, { id: newId(), name: c.newColumn, type: 'text', options: [] }])}
        >
          {c.add}
        </Button>
        <Button onClick={onClose}>{c.done}</Button>
      </div>
    </Dialog>
  )
}
