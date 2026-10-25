import { useId } from 'react'
import { Info, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/Button'
import { LIMITS, TEST_STATUSES, newId, type Semester, type TestKind, type TestPlan, type TrackerData } from '../model'
import { completeTestSteps } from '../actions'
import { useTrackerText } from '../text'
import { iconButtonClass, inputClass, labelClass } from './ui'

type Update = (fn: (d: TrackerData) => TrackerData) => void

const ENGLISH = ['IELTS Academic', 'TOEFL iBT', 'PTE Academic', 'Duolingo English Test', 'Cambridge C1 Advanced']
const GRE = ['GRE General', 'GMAT']
const thisYear = new Date().getFullYear()

export function TestsView({ data, update }: { data: TrackerData; update: Update }) {
  const tt = useTrackerText()
  const x = tt.tests
  const formId = useId()
  const id = (n: string) => `${formId}-${n}`

  function setTarget(value: string) {
    if (!value) return update((d) => ({ ...d, target: null }))
    const [season, year] = value.split('-')
    update((d) => ({ ...d, target: { season: season as Semester['season'], year: Number(year) } }))
  }

  function patch(test: TestPlan, change: Partial<TestPlan>) {
    update((d) => {
      const next = { ...d, tests: d.tests.map((t) => (t.id === test.id ? { ...t, ...change } : t)) }
      // Marking a test done (or not needed) ticks the "score ready" steps that depend on it.
      const finished = change.status === 'done' || change.status === 'not-needed'
      return finished ? completeTestSteps(test.kind)(next) : next
    })
  }

  function add(kind: TestKind) {
    update((d) =>
      d.tests.length >= 20 ? d : { ...d, tests: [...d.tests, { id: newId(), kind, name: kind === 'english' ? ENGLISH[0] : GRE[0], status: 'not-started', score: '' }] },
    )
  }

  const targetValue = data.target ? `${data.target.season}-${data.target.year}` : ''
  const targets = Array.from({ length: 5 }, (_, i) => thisYear + i).flatMap((y) => [`spring-${y}`, `fall-${y}`])

  return (
    <div className="space-y-8">
      <section className="rounded-card border border-line bg-white p-5">
        <label htmlFor={id('target')} className={labelClass}>
          {x.target}
        </label>
        <select id={id('target')} value={targetValue} onChange={(e) => setTarget(e.target.value)} className={`${inputClass} max-w-xs`}>
          <option value="">{x.noTarget}</option>
          {(targetValue && !targets.includes(targetValue) ? [targetValue, ...targets] : targets).map((v) => {
            const [season, year] = v.split('-')
            return (
              <option key={v} value={v}>
                {tt.seasons[season as Semester['season']]} {year}
              </option>
            )
          })}
        </select>
        <p className="mt-1 text-sm text-slate">{x.targetHint}</p>
      </section>

      <section aria-labelledby={id('tests')}>
        <h2 id={id('tests')} className="text-xl">
          {x.title}
        </h2>
        <p className="mt-1 max-w-2xl text-slate">{x.intro}</p>
        <p className="mt-3 flex max-w-2xl gap-2 rounded-xl bg-sand p-3 text-sm">
          <Info aria-hidden size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          {x.prepTip}
        </p>

        {data.tests.length === 0 && <p className="mt-4 text-slate">{x.none}</p>}
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {data.tests.map((test) => {
            const names = test.kind === 'english' ? ENGLISH : GRE
            return (
              <li key={test.id} className="rounded-card border border-line bg-white p-5">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <label htmlFor={id(`n-${test.id}`)} className={labelClass}>
                      {x.name}
                    </label>
                    <input
                      id={id(`n-${test.id}`)}
                      list={id(`l-${test.kind}`)}
                      value={test.name}
                      maxLength={LIMITS.text}
                      onChange={(e) => patch(test, { name: e.target.value })}
                      className={inputClass}
                    />
                    <datalist id={id(`l-${test.kind}`)}>
                      {names.map((n) => (
                        <option key={n} value={n} />
                      ))}
                    </datalist>
                  </div>
                  <button type="button" className={`${iconButtonClass} mt-6 hover:text-danger`} onClick={() => update((d) => ({ ...d, tests: d.tests.filter((t) => t.id !== test.id) }))}>
                    <Trash2 aria-hidden size={18} strokeWidth={1.5} />
                    <span className="sr-only">
                      {x.remove}: {test.name}
                    </span>
                  </button>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={id(`s-${test.id}`)} className={labelClass}>
                      {x.status}
                    </label>
                    <select id={id(`s-${test.id}`)} value={test.status} onChange={(e) => patch(test, { status: e.target.value as TestPlan['status'] })} className={inputClass}>
                      {TEST_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {x.statuses[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={id(`sc-${test.id}`)} className={labelClass}>
                      {x.score}
                    </label>
                    <input id={id(`sc-${test.id}`)} value={test.score} maxLength={40} onChange={(e) => patch(test, { score: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor={id(`p-${test.id}`)} className={labelClass}>
                      {x.prepStart}
                    </label>
                    <input id={id(`p-${test.id}`)} type="date" value={test.prepStart ?? ''} onChange={(e) => patch(test, { prepStart: e.target.value || undefined })} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor={id(`d-${test.id}`)} className={labelClass}>
                      {x.testDate}
                    </label>
                    <input id={id(`d-${test.id}`)} type="date" value={test.testDate ?? ''} onChange={(e) => patch(test, { testDate: e.target.value || undefined })} className={inputClass} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" icon={<Plus aria-hidden size={16} strokeWidth={1.5} />} onClick={() => add('english')}>
            {x.addEnglish}
          </Button>
          <Button variant="secondary" size="sm" icon={<Plus aria-hidden size={16} strokeWidth={1.5} />} onClick={() => add('gre')}>
            {x.addGre}
          </Button>
        </div>
      </section>
    </div>
  )
}
