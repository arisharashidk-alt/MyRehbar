/**
 * "The Lift" logo: two nested upward chevrons.
 * The larger lower chevron is the Rehbar; the smaller upper one is the student being lifted.
 */
interface LogoProps {
  /** Width and height in pixels */
  size?: number
  /** light: for light backgrounds. dark: for mint-900 backgrounds. */
  variant?: 'light' | 'dark'
  className?: string
  /** Pass a label if the logo is shown on its own (not next to the word "MyRehbar") */
  title?: string
}

export function Logo({ size = 40, variant = 'light', className, title }: LogoProps) {
  const big = variant === 'dark' ? '#FFFFFF' : '#1F7A5C'
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={16}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path d="M18 100 L60 58 L102 100" stroke={big} />
      <path d="M36 48 L60 24 L84 48" stroke="#3EB489" />
    </svg>
  )
}

/** Logo icon + "MyRehbar" wordmark. */
export function Wordmark({
  variant = 'light',
  size = 32,
  className = '',
}: {
  variant?: 'light' | 'dark'
  size?: number
  className?: string
}) {
  const my = variant === 'dark' ? 'text-white' : 'text-mint-900'
  const rehbar = variant === 'dark' ? 'text-mint-200' : 'text-mint-700'
  return (
    // dir="ltr" keeps the logo the same way round in Urdu mode.
    <span dir="ltr" className={`inline-flex items-center gap-2 ${className}`}>
      <Logo size={size} variant={variant} />
      <span className="text-xl font-bold tracking-heading" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <span className={my}>My</span>
        <span className={rehbar}>Rehbar</span>
      </span>
    </span>
  )
}
