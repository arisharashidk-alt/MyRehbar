/**
 * Simple geometric decoration (circles, arches, chevrons) echoing the logo.
 * Purely visual: hidden from screen readers.
 */
export function ArchDecor({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 200" className={className} aria-hidden focusable="false" fill="none">
      <path d="M40 200 V120 a100 100 0 0 1 200 0 V200" stroke="#CDEFE0" strokeWidth="28" />
      <circle cx="140" cy="118" r="26" fill="#3EB489" opacity="0.25" />
      <path d="M116 112 L140 88 L164 112" stroke="#3EB489" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Larger composition for the home hero. */
export function HeroDecor({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden focusable="false" fill="none">
      <circle cx="200" cy="200" r="190" fill="#EEF8F3" />
      <path d="M90 360 V230 a110 110 0 0 1 220 0 V360" stroke="#CDEFE0" strokeWidth="36" />
      <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="22">
        <path d="M118 270 L200 188 L282 270" stroke="#1F7A5C" />
        <path d="M152 168 L200 120 L248 168" stroke="#3EB489" />
      </g>
      <circle cx="320" cy="96" r="18" fill="#F6E7C8" />
      <circle cx="78" cy="132" r="10" fill="#3EB489" opacity="0.5" />
    </svg>
  )
}
