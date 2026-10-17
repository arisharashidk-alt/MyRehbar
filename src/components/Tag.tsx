import type { ReactNode } from 'react'

type Tone = 'mint' | 'sand' | 'outline'

const tones: Record<Tone, string> = {
  mint: 'bg-mint-200 text-mint-900',
  sand: 'bg-sand text-ink',
  outline: 'border border-line bg-white text-slate',
}

/** Small label, e.g. a field of study, "Woman Rehbar" or "Sample". */
export function Tag({ children, tone = 'mint', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
