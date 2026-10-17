import { Check } from 'lucide-react'
import { useId, type ReactNode } from 'react'

/** Wrapper for search + filters. Sits in a white card above results. */
export function FilterBar({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="search" aria-label={label} className="rounded-card border border-line bg-white p-4 md:p-6">
      {children}
    </div>
  )
}

export interface Option {
  value: string
  label: string
}

/** A labelled native <select>. Native selects are fast and work well on cheap phones. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-slate">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-tap w-full rounded-xl border border-line bg-white px-3 text-base text-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/** On/off filter shown as a pill. Uses a real checkbox for accessibility. */
export function FilterToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={`inline-flex min-h-tap cursor-pointer select-none items-center gap-2 rounded-full border px-4 text-sm font-semibold transition duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mint-700 ${
        checked ? 'border-mint-700 bg-mint-200 text-mint-900' : 'border-line bg-white text-ink hover:bg-mint-50'
      }`}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {checked && <Check aria-hidden size={16} strokeWidth={2} />}
      {label}
    </label>
  )
}
