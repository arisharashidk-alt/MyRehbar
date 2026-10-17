import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  /** Light mint background to separate sections */
  tint?: boolean
  className?: string
  id?: string
  labelledBy?: string
}

/** A full-width page section with consistent padding and max width. */
export function Section({ children, tint = false, className = '', id, labelledBy }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`section ${tint ? 'bg-mint-50' : ''} ${className}`}
    >
      <div className="container-page">{children}</div>
    </section>
  )
}
