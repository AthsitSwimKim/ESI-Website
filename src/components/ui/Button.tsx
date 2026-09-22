import { ChevronRight } from 'lucide-react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'outline' | 'outline-light' | 'light' | 'link'
export type ButtonSize = 'md' | 'sm'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Trailing icon. Defaults to the brand chevron; pass `null` to hide it. */
  icon?: ReactNode | null
  className?: string
  children: ReactNode
}

type AsLink = CommonProps & { to: LinkProps['to'] } & Omit<
    LinkProps,
    'to' | 'className' | 'children'
  >
type AsAnchor = CommonProps & { href: string; to?: never } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'className' | 'children'
  >
type AsButton = CommonProps & { to?: never; href?: never } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'children'
  >

export type ButtonProps = AsLink | AsAnchor | AsButton

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-esi-blue text-white hover:bg-esi-secondary',
  outline: 'border-[1.5px] border-esi-blue text-esi-blue hover:bg-esi-blue hover:text-white',
  'outline-light': 'border-[1.5px] border-white text-white hover:bg-white/10',
  light: 'bg-white text-esi-navy hover:bg-esi-light',
  link: 'text-[13px] font-semibold text-esi-blue hover:underline underline-offset-4',
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-12 px-6 text-[15px]',
  sm: 'h-10 px-[18px] text-sm',
}

/**
 * Brand button (design-spec §3): 4px radius, semibold, trailing chevron that slides right on
 * hover — the spec's "arrow movement". Renders a real <Link>, <a> or <button> depending on props.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', icon, className, children, ...rest } = props
  const isLink = variant === 'link'

  const classes = cn(
    'group inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors duration-200',
    !isLink && 'rounded-[4px]',
    !isLink && sizeClasses[size],
    variantClasses[variant],
    className,
  )

  const trailing =
    icon === null ? null : (
      <span
        aria-hidden
        className="inline-flex transition-transform duration-200 group-hover:translate-x-1"
      >
        {icon ?? <ChevronRight size={isLink ? 16 : 18} strokeWidth={2.25} />}
      </span>
    )

  const content = (
    <>
      <span>{children}</span>
      {trailing}
    </>
  )

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest as AsLink
    return (
      <Link to={to} className={classes} {...linkRest}>
        {content}
      </Link>
    )
  }
  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as AsAnchor
    return (
      <a href={href} className={classes} {...anchorRest}>
        {content}
      </a>
    )
  }
  const buttonRest = rest as AsButton
  return (
    <button type="button" className={classes} {...buttonRest}>
      {content}
    </button>
  )
}
