import type { ReactNode } from 'react'
import { ArchDecor } from './Decor'

interface PageHeaderProps {
  title: string
  intro?: ReactNode
  children?: ReactNode
}

/** The top block of an inner page: one h1, a short intro, optional extra content. */
export function PageHeader({ title, intro, children }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-mint-50">
      <ArchDecor className="pointer-events-none absolute -bottom-10 end-0 hidden w-72 md:block" />
      <div className="container-page relative py-12 md:py-20">
        <h1 className="max-w-3xl text-2xl md:text-3xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-slate">{intro}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  )
}
