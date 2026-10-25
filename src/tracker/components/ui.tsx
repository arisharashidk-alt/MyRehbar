import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Shared input styles for the tracker. Same look as the site's forms. */
export const inputClass =
  'w-full rounded-xl border border-line bg-white px-3 text-base text-ink placeholder:text-slate transition duration-150 focus:border-mint-700 min-h-tap'
export const smallInputClass =
  'w-full rounded-lg border border-line bg-white px-2 py-1 text-sm text-ink placeholder:text-slate focus:border-mint-700 min-h-[36px]'
export const labelClass = 'mb-1 block text-sm font-semibold text-mint-900'
export const iconButtonClass =
  'inline-flex min-h-tap min-w-tap items-center justify-center rounded-xl text-slate transition duration-150 hover:bg-mint-50 hover:text-mint-900'
export const chipButtonClass =
  'inline-flex min-h-tap items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-mint-900 transition duration-150 hover:border-mint-700'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  closeLabel: string
  children: ReactNode
  /** "side" slides in from the end edge, for long panels */
  variant?: 'center' | 'side'
  wide?: boolean
}

/**
 * An accessible modal built on the native <dialog>: it traps focus, closes on Escape,
 * and returns focus to whatever opened it.
 */
export function Dialog({ open, onClose, title, closeLabel, children, variant = 'center', wide = false }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  const position =
    variant === 'side'
      ? 'm-0 ms-auto h-full max-h-full w-full max-w-2xl rounded-none sm:rounded-s-card'
      : `my-auto mx-auto w-[calc(100%-2rem)] ${wide ? 'max-w-3xl' : 'max-w-xl'} max-h-[calc(100%-2rem)] rounded-card`

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`${position} border border-line bg-white p-0 text-ink shadow-[0_20px_60px_rgba(15,61,46,0.25)] backdrop:bg-mint-900/40`}
    >
      {open && (
        <div className="flex max-h-full flex-col">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-white px-5 py-3">
            <h2 className="text-xl">{title}</h2>
            <button type="button" className={iconButtonClass} onClick={onClose}>
              <X aria-hidden size={22} strokeWidth={1.5} />
              <span className="sr-only">{closeLabel}</span>
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-5">{children}</div>
        </div>
      )}
    </dialog>
  )
}

/** A small coloured square with the first letters of a name: the application's "thumbnail". */
export function Monogram({ name, className = '' }: { name: string; className?: string }) {
  const letters =
    name
      .split(/[\s·,-]+/)
      .filter((w) => /^[\p{L}\p{N}]/u.test(w))
      .slice(0, 2)
      .map((w) => [...w][0])
      .join('')
      .toUpperCase() || '?'
  return (
    <span aria-hidden className={`inline-flex shrink-0 items-center justify-center rounded-lg font-bold text-white ${className}`}>
      {letters}
    </span>
  )
}
