import { Link } from 'react-router-dom'

import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { brandPartners } from '@/data/profileAssets'
import { useT } from '@/i18n'

/** Logos supplied in the Company Profile. No dealer/certification status is implied. */
export function BrandPartners({
  ids,
  id = 'brand-partners',
  overviewLink = false,
}: {
  ids?: string[]
  id?: string
  overviewLink?: boolean
}) {
  const { t } = useT()
  const brands = ids
    ? ids.flatMap((key) => brandPartners.filter((brand) => brand.id === key))
    : brandPartners
  if (!brands.length) return null

  return (
    <section aria-labelledby={`${id}-title`} id={id} className="bg-esi-light py-14 md:py-20">
      <Container>
        <SectionTitle
          id={`${id}-title`}
          title={t('solutions.brandPartners')}
          subtitle={t('solutions.brandPartnersNote')}
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
        <ul className="flex flex-wrap justify-center overflow-hidden rounded-[4px] border border-esi-border bg-white">
          {brands.map((brand) => (
            <Reveal
              as="li"
              key={brand.id}
              className="flex w-1/2 flex-col items-center justify-center gap-4 border-r border-b border-esi-border bg-white px-5 py-6 sm:w-1/3 lg:w-1/6"
            >
              <div className="flex h-16 w-full items-center justify-center">
                <img
                  src={brand.image}
                  alt=""
                  width={brand.width}
                  height={brand.height}
                  loading="lazy"
                  className="max-h-16 max-w-full object-contain"
                />
              </div>
              <span className="text-center text-xs leading-relaxed font-medium text-esi-muted">
                {brand.name}
              </span>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
