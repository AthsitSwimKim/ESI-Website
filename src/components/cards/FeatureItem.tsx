import { Icon } from '@/components/ui/Icon'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Feature } from '@/types'

interface FeatureItemProps {
  feature: Feature
  /**
   * `inline` = About 2×2 grid (icon left, text right, on light).
   * `tile`   = Why-ESI card on the dark section (icon tile, bordered box). Design-spec §4.3 / §4.6.
   */
  variant?: 'inline' | 'tile'
  className?: string
}

export function FeatureItem({ feature, variant = 'inline', className }: FeatureItemProps) {
  const { l } = useT()

  if (variant === 'tile') {
    return (
      <div
        className={cn(
          'h-full rounded-[4px] border border-white/10 bg-white/5 p-6 transition-[transform,border-color] duration-250 hover:-translate-y-1 hover:border-esi-accent/60',
          className,
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-[4px] bg-white/10 text-esi-accent">
          <Icon name={feature.icon} size={26} strokeWidth={1.5} />
        </div>
        <h3 className="mt-4 text-[17px] font-semibold text-white">{l(feature.title)}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{l(feature.description)}</p>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-4', className)}>
      <Icon
        name={feature.icon}
        size={40}
        strokeWidth={1.5}
        className="mt-0.5 shrink-0 text-esi-blue"
      />
      <div>
        <h3 className="text-base font-semibold text-esi-blue">{l(feature.title)}</h3>
        <p className="mt-1 text-sm leading-relaxed text-esi-muted">{l(feature.description)}</p>
      </div>
    </div>
  )
}
