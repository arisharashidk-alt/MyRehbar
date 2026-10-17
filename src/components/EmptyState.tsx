import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'

export function EmptyState({
  title,
  text,
  action,
  icon,
}: {
  title: string
  text?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="rounded-card border border-dashed border-line bg-white px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint-50 text-mint-700">
        {icon ?? <SearchX aria-hidden size={28} strokeWidth={1.5} />}
      </div>
      <h2 className="text-xl">{title}</h2>
      {text && <p className="mx-auto mt-2 max-w-md text-slate">{text}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}
