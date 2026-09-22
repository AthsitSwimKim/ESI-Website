import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

export interface Crumb {
  label: string
  /** Omit on the current page. */
  to?: string
}

/** Home › Section › Page. Rendered inside PageHero (light tone) — design-spec §3. */
export function Breadcrumb({
  items,
  tone = 'dark',
  className,
}: {
  items: Crumb[]
  tone?: 'dark' | 'light'
  className?: string
}) {
  const { t } = useT()
  const onDark = tone === 'dark'
  return (
    <nav aria-label={t('a11y.breadcrumb')} className={cn('text-[13px]', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.to && !last ? (
                <Link
                  to={item.to}
                  className={cn(
                    'underline-offset-4 transition-colors hover:underline',
                    onDark
                      ? 'text-white/70 hover:text-white'
                      : 'text-esi-muted hover:text-esi-blue',
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={cn('font-medium', onDark ? 'text-white' : 'text-esi-navy')}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <ChevronRight
                  aria-hidden
                  size={14}
                  className={onDark ? 'text-white/50' : 'text-esi-muted/70'}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
