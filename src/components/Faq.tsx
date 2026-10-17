import { ChevronDown } from 'lucide-react'

/** Accordion built on native <details>, so it works with keyboard and screen readers for free. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-card border border-line bg-white">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-lg font-semibold text-mint-900 [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown
              aria-hidden
              size={20}
              strokeWidth={1.5}
              className="shrink-0 text-mint-700 transition duration-200 group-open:rotate-180"
            />
          </summary>
          <p className="px-6 pb-5 text-slate">{item.a}</p>
        </details>
      ))}
    </div>
  )
}
