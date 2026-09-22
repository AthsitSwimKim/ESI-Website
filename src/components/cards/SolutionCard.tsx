import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Service } from '@/types'

interface SolutionCardProps {
  service: Service
  /**
   * `compact` = Home mockup card (icon, name, bar). `rich` = Solutions overview card that adds
   * the tagline and a "Learn more" row (design-spec §4.2 / §5).
   */
  variant?: 'compact' | 'rich'
  className?: string
}

export function SolutionCard({ service, variant = 'compact', className }: SolutionCardProps) {
  const { l, t } = useT()
  const rich = variant === 'rich'
  const name = l(service.name)

  return (
    <Link
      to={`/solutions/${service.slug}`}
      aria-label={name}
      className={cn(
        'group flex h-full flex-col items-center rounded-[4px] border border-esi-border bg-white text-center shadow-card transition-[transform,box-shadow,border-color] duration-250 hover:-translate-y-1.5 hover:border-esi-accent hover:shadow-card-hover',
        rich ? 'px-6 py-8' : 'min-h-[200px] px-4 py-7',
        className,
      )}
    >
      <Icon
        name={service.icon}
        size={56}
        strokeWidth={1.25}
        className="text-esi-blue transition-transform duration-250 group-hover:scale-110"
      />
      <h3
        className={cn(
          'mt-4 font-semibold text-esi-navy',
          rich ? 'text-[17px]' : 'text-base leading-snug',
        )}
      >
        {name}
      </h3>
      {rich && <p className="mt-2 text-sm leading-relaxed text-esi-muted">{l(service.tagline)}</p>}
      {/* Bottom bar = the link affordance on the compact card (design-spec §2 element 4) */}
      <div className={cn('flex flex-col items-center', rich ? 'mt-auto pt-5' : 'mt-4')}>
        <span
          aria-hidden
          className="block h-[3px] w-10 bg-esi-blue transition-[width,background-color] duration-250 group-hover:w-16 group-hover:bg-esi-accent"
        />
        {rich && (
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-esi-blue">
            {t('cta.learnMore')}
            <ChevronRight
              aria-hidden
              size={16}
              strokeWidth={2.25}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </span>
        )}
      </div>
    </Link>
  )
}
