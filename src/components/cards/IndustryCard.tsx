import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Industry } from '@/types'

/**
 * Industry image card (design-spec §4.4): photo on top, ESI-blue label bar with a white line
 * icon and the uppercase name. Sharp corners. Hover: image zoom, blue overlay, arrow slides in.
 */
export function IndustryCard({ industry, className }: { industry: Industry; className?: string }) {
  const { l } = useT()
  const name = l(industry.name)

  return (
    <Link
      to={`/industries#${industry.slug}`}
      aria-label={name}
      className={cn('group flex flex-col overflow-hidden bg-esi-blue', className)}
    >
      <div className="relative aspect-[2/1] overflow-hidden">
        <img
          src={industry.image}
          alt=""
          loading="lazy"
          width={industry.imageWidth}
          height={industry.imageHeight}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-esi-blue/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </div>
      <div className="relative flex min-h-[64px] items-center gap-3 px-4 py-2.5 text-white">
        <Icon name={industry.icon} size={28} strokeWidth={1.5} className="shrink-0" />
        <span className="text-[15px] leading-tight font-bold uppercase">{name}</span>
        <ArrowUpRight
          aria-hidden
          size={20}
          strokeWidth={2}
          className="absolute top-3 right-3 translate-x-2 opacity-0 transition-[translate,opacity] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        />
      </div>
    </Link>
  )
}
