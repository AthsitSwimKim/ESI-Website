import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: ReactNode
  /** Small uppercase label above the title (accent colour). */
  eyebrow?: ReactNode
  /** One-line description under the bar (muted). */
  subtitle?: ReactNode
  align?: 'left' | 'center'
  /** `dark` for navy sections: white title, accent bar. */
  tone?: 'light' | 'dark'
  /** Right-aligned slot on the title row, e.g. a "View all projects" link (desktop only). */
  action?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  className?: string
}

/**
 * Section heading in the brand display style — Kanit bold italic uppercase with the 40×3 bar
 * (design-spec §3). Left-aligned by default: the mockup never centres a title.
 */
export function SectionTitle({
  title,
  eyebrow,
  subtitle,
  align = 'left',
  tone = 'light',
  action,
  as: Tag = 'h2',
  id,
  className,
}: SectionTitleProps) {
  const dark = tone === 'dark'
  const center = align === 'center'
  return (
    <div
      className={cn(
        'mb-10',
        action && 'md:flex md:items-end md:justify-between md:gap-8',
        center && 'text-center',
        className,
      )}
    >
      <div>
        {eyebrow && (
          <p className="mb-2 text-[13px] font-semibold tracking-[.1em] text-esi-accent uppercase">
            {eyebrow}
          </p>
        )}
        <Tag
          id={id}
          className={cn(
            'display-title text-[clamp(1.375rem,2vw,1.75rem)] leading-tight',
            dark ? 'text-white' : 'text-esi-blue',
          )}
        >
          {title}
        </Tag>
        <span
          aria-hidden
          className={cn(
            'mt-2.5 block h-[3px] w-10',
            dark ? 'bg-esi-accent' : 'bg-esi-blue',
            center && 'mx-auto',
          )}
        />
        {subtitle && (
          <p
            className={cn(
              'mt-4 max-w-[60ch] text-base',
              dark ? 'text-white/75' : 'text-esi-muted',
              center && 'mx-auto',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="mt-4 shrink-0 md:mt-0 md:pb-1">{action}</div>}
    </div>
  )
}
