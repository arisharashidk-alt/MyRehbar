import { Search, X } from 'lucide-react'
import { useId } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder?: string
  clearLabel?: string
}

export function SearchInput({ value, onChange, label, placeholder, clearLabel = 'Clear' }: SearchInputProps) {
  const id = useId()
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden
        size={20}
        strokeWidth={1.5}
        className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="min-h-[48px] w-full rounded-xl border border-line bg-white pe-11 ps-10 text-base text-ink placeholder:text-slate focus:border-mint-700"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute end-1 top-1/2 inline-flex min-h-tap min-w-tap -translate-y-1/2 items-center justify-center rounded-lg text-slate hover:text-ink"
        >
          <X aria-hidden size={18} strokeWidth={1.5} />
          <span className="sr-only">{clearLabel}</span>
        </button>
      )}
    </div>
  )
}
