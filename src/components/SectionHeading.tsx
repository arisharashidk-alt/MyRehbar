import type { ReactNode } from 'react'

interface SectionHeadingProps {
  /** Used for aria-labelledby on the section */
  id?: string
  eyebrow?: string
  title: string
  intro?: ReactNode
  /** Heading level. Pages use one h1, sections use h2. */
  level?: 2 | 3
  align?: 'start' | 'center'
  /** Optional action shown on the end side, e.g. a "See all" link */
  action?: ReactNode
}

export function SectionHeading({ id, eyebrow, title, intro, level = 2, align = 'start', action }: SectionHeadingProps) {
  const Heading = level === 2 ? 'h2' : 'h3'
  const centered = align === 'center'
  return (
    <div className={`mb-8 flex flex-col gap-4 md:mb-12 ${action ? 'md:flex-row md:items-end md:justify-between' : ''}`}>
      <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-mint-700">{eyebrow}</p>}
        <Heading id={id} className={level === 2 ? 'text-2xl md:text-[40px] md:leading-[48px]' : 'text-xl'}>
          {title}
        </Heading>
        {intro && <p className="mt-3 text-lg text-slate">{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
