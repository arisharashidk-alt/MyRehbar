import { CheckCircle2 } from 'lucide-react'

/** Bullet list with check icons. */
export function CheckList({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <CheckCircle2 aria-hidden size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-mint-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Numbered steps, e.g. "How to apply". */
export function StepList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <li key={item} className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-mint-700 text-sm font-bold text-mint-700">
            {i + 1}
          </span>
          <span className="pt-1">{item}</span>
        </li>
      ))}
    </ol>
  )
}
