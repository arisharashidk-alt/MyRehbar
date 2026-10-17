import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** Use "article" for self-contained items like a mentor or scholarship */
  as?: 'div' | 'article' | 'section' | 'li'
  /** Soft shadow and lift on hover (for clickable cards) */
  interactive?: boolean
}

/** White surface with a 1px border. No heavy shadows. */
export function Card({ children, className = '', as: Tag = 'div', interactive = false }: CardProps) {
  const hover = interactive
    ? 'transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,61,46,0.07)] motion-reduce:hover:translate-y-0'
    : ''
  return <Tag className={`rounded-card border border-line bg-white p-6 ${hover} ${className}`}>{children}</Tag>
}
