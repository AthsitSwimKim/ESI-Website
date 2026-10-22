import { Link } from 'react-router-dom'

import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { brandPartners } from '@/data/profileAssets'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

/** Logos supplied in the Company Profile. No dealer/certification status is implied. */
export function BrandPartners({
  ids,
  id = 'brand-partners',
  overviewLink = false,
  compact = false,
}: {
  ids?: string[]
  id?: string
  overviewLink?: boolean
  /** Reduced section spacing for solution detail pages. */
  compact?: boolean
}) {
  const { t } = useT()
  const brands = ids
    ? ids.flatMap((key) => brandPartners.filter((brand) => brand.id === key))
    : brandPartners
  if (!brands.length) return null

  return (
    <section
      aria-labelledby={`${id}-title`}
      id={id}
      className={cn('bg-white', compact ? 'pt-10 pb-6 md:pt-12 md:pb-8' : 'py-14 md:py-20')}
    >
      <Container>
        <SectionTitle
          id={`${id}-title`}
          title={t('solutions.brandPartners')}
          subtitle={t('solutions.brandPartnersNote')}
          spacing={compact ? 'compact' : 'default'}
          action={
            overviewLink ? (
              <Link
                to="/solutions#brand-partners"
                className="text-sm font-semibold text-esi-blue hover:underline"
              >
                {t('solutions.viewAllBrands')}
              </Link>
            ) : undefined
          }
        />
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-8 sm:gap-x-12 sm:gap-y-10">
          {brands.map((brand) => (
            <Reveal
              as="li"
              key={brand.id}
              className="flex h-20 w-[calc((100%-2rem)/2)] items-center justify-center sm:w-[calc((100%-6rem)/3)] lg:w-[calc((100%-15rem)/6)]"
            >
              <img
                src={brand.image}
                alt={brand.name}
                width={brand.width}
                height={brand.height}
                loading="lazy"
                className="max-h-16 max-w-full object-contain"
              />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
