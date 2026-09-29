import { CircleCheck } from 'lucide-react'

import { Reveal, RevealItem } from '@/components/ui/Reveal'

/**
 * "What we deliver" checklist (design-spec §5): the service's feature list as light tiles with
 * a blue check, three columns on desktop. The list comes straight from spec §16–21.
 */
export function SolutionFeatures({ features }: { features: string[] }) {
  return (
    <Reveal as="ul" staggerChildren={0.05} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <RevealItem key={feature} as="li">
          <div className="flex h-full items-start gap-3 rounded-[4px] bg-esi-light px-4 py-3.5">
            <CircleCheck
              aria-hidden
              size={20}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0 text-esi-blue"
            />
            <span className="text-base leading-snug text-esi-text">{feature}</span>
          </div>
        </RevealItem>
      ))}
    </Reveal>
  )
}
