import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useI18n } from '../i18n'

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark'
type Size = 'md' | 'lg' | 'sm'

interface BaseProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  /** Optional icon shown before the text */
  icon?: ReactNode
}

/** Internal page link, e.g. to="/rehbars" */
interface LinkProps extends BaseProps {
  to: string
  href?: never
}
/** External link (opens in a new tab), e.g. a Google Form */
interface AnchorProps extends BaseProps {
  href: string
  to?: never
}
/** Plain <button> */
interface PlainButtonProps extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {
  to?: never
  href?: never
}

export type ButtonProps = LinkProps | AnchorProps | PlainButtonProps

const variants: Record<Variant, string> = {
  // White on mint-700 passes WCAG AA.
  primary: 'bg-mint-700 text-white hover:bg-mint-900',
  secondary: 'border border-mint-700 bg-white text-mint-700 hover:bg-mint-50',
  ghost: 'text-mint-700 hover:bg-mint-50',
  onDark: 'bg-white text-mint-900 hover:bg-mint-200',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-tap px-4 text-sm',
  md: 'min-h-tap px-5 text-base',
  lg: 'min-h-[52px] px-6 text-lg',
}

export function Button(props: ButtonProps) {
  const { t } = useI18n()
  const { variant = 'primary', size = 'md', className = '', children, icon } = props
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold no-underline',
    'transition duration-150 ease-out hover:-translate-y-px motion-reduce:hover:translate-y-0',
    variants[variant],
    sizes[size],
    className,
  ].join(' ')

  if (props.to !== undefined) {
    return (
      <Link to={props.to} className={classes}>
        {icon}
        {children}
      </Link>
    )
  }

  if (props.href !== undefined) {
    return (
      <a href={props.href} target="_blank" rel="noopener noreferrer" className={classes}>
        {icon}
        {children}
        <ExternalLink aria-hidden size={16} strokeWidth={1.5} />
        <span className="sr-only">{t.common.opensNewTab}</span>
      </a>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, className: _c, children: _ch, icon: _i, ...rest } = props
  return (
    <button type="button" className={classes} {...rest}>
      {icon}
      {children}
    </button>
  )
}
