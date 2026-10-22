import { CircleCheck } from 'lucide-react'

import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Service } from '@/types'

/**
 * "What we deliver" checklist (design-spec §5): the service's feature list as light tiles with
 * a blue check. Services can opt into content-sized tiles instead of equal grid columns.
 */
export function SolutionFeatures({
  features,
  layout = 'grid',
}: {
  features: Service['features']
  layout?: Service['featureLayout']
}) {
  const { l } = useT()
  return (
    <Reveal
      as="ul"
      staggerChildren={0.05}
      className={cn(
        'gap-3',
        layout === 'flow' ? 'flex flex-wrap items-start' : 'grid sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {features.map((feature) => (
        <RevealItem
          key={feature.en}
          as="li"
          className={layout === 'flow' ? 'max-w-full' : undefined}
        >
          <div className="flex h-full items-start gap-3 rounded-[4px] bg-esi-light px-4 py-3.5">
            <CircleCheck
              aria-hidden
              size={20}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0 text-esi-blue"
            />
            <span
              className={cn(
                'text-base leading-snug text-esi-text',
                layout === 'flow' && 'lg:whitespace-nowrap',
              )}
            >
              {l(feature)}
            </span>
          </div>
        </RevealItem>
      ))}
    </Reveal>
  )
}
