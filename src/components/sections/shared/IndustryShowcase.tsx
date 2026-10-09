import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { IndustryPhotoCredit } from '@/components/ui/IndustryPhotoCredit'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { getProjectsByIndustry } from '@/data/projects'
import { useT } from '@/i18n'
import { scaleIn } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { Industry } from '@/types'

interface IndustryShowcaseProps {
  industry: Industry
  /** Alternate the photo side down the page (design-spec §5 Industries). */
  reverse?: boolean
  /** First block on the page — show it straight away instead of fading in. */
  immediate?: boolean
}

/**
 * One industry block on /industries: photo with a slanted edge facing the copy, the name in
 * display type, description, "Typical scope" chips (spec §25) and a link to its projects.
 * `id` = industry slug so Home cards can deep-link (`/industries#oil-gas`).
 */
export function IndustryShowcase({
  industry,
  reverse = false,
  immediate = false,
}: IndustryShowcaseProps) {
  const { t, l } = useT()
  const related = getProjectsByIndustry(industry.slug)

  return (
    <article
      id={industry.slug}
      aria-labelledby={`industry-${industry.slug}`}
      className="grid scroll-mt-24 items-center gap-8 lg:grid-cols-2 lg:gap-16"
    >
      <Reveal
        variants={scaleIn}
        immediate={immediate}
        className={cn('relative', reverse && 'lg:order-2')}
      >
        <figure>
          <img
            src={industry.image}
            alt=""
            loading="lazy"
            width={industry.imageWidth}
            height={industry.imageHeight}
            className={cn(
              'aspect-[4/3] w-full object-cover',
              reverse ? 'lg:clip-slant-img-left' : 'lg:clip-slant-img',
            )}
          />
          <figcaption className="mt-3 space-y-1">
            <p>
              <IndustryPhotoCredit industry={industry} />
            </p>
            <p className="text-xs leading-relaxed text-esi-muted">{t('images.photoChanges')}</p>
          </figcaption>
        </figure>
      </Reveal>

      <Reveal staggerChildren={0.08} immediate={immediate} className={cn(reverse && 'lg:order-1')}>
        <RevealItem className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[4px] bg-esi-light text-esi-blue">
            <Icon name={industry.icon} size={26} strokeWidth={1.5} />
          </span>
          <h2
            id={`industry-${industry.slug}`}
            className="display-title text-[clamp(1.375rem,2vw,1.75rem)] leading-tight text-esi-blue"
          >
            {l(industry.name)}
          </h2>
        </RevealItem>
        <RevealItem>
          <span aria-hidden className="mt-3 block h-[3px] w-10 bg-esi-blue" />
          <p className="mt-5 max-w-[60ch] text-base leading-[1.7] text-esi-text">
            {l(industry.description)}
          </p>
        </RevealItem>
        <RevealItem className="mt-6">
          <p className="text-[13px] font-semibold tracking-[.08em] text-esi-muted uppercase">
            {t('solutions.typicalScope')}
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {industry.scope.map((item) => (
              <li key={item.en}>
                <Chip>{l(item)}</Chip>
              </li>
            ))}
          </ul>
        </RevealItem>
        {related.length > 0 && (
          <RevealItem className="mt-7">
            <Link
              to={`/projects?industry=${industry.slug}`}
              className="group inline-flex items-center gap-1 text-[13px] font-semibold text-esi-blue underline-offset-4 hover:underline"
            >
              {t('cta.seeRelatedProjects')} ({related.length})
              <ChevronRight
                aria-hidden
                size={16}
                strokeWidth={2.25}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </RevealItem>
        )}
      </Reveal>
    </article>
  )
}
