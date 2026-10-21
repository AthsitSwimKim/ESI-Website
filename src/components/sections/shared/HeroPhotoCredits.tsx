import { Container } from '@/components/ui/Container'
import { IndustryPhotoCredit } from '@/components/ui/IndustryPhotoCredit'
import { useT } from '@/i18n'
import type { PageHeroContent } from '@/types'

/** Keep contextual hero-photo attribution available without captions over the hero copy. */
export function HeroPhotoCredits({ credit }: { credit: PageHeroContent['imageCredit'] }) {
  const { t } = useT()
  if (!credit) return null

  return (
    <section aria-label={t('images.photoCredits')} className="bg-white py-6">
      <Container>
        <details className="border-t border-esi-border pt-4 text-xs text-esi-muted">
          <summary className="w-fit cursor-pointer font-semibold hover:text-esi-blue">
            {t('images.photoCredits')}
          </summary>
          <p className="mt-3 leading-relaxed">
            {credit.title}. <IndustryPhotoCredit industry={{ imageCredit: credit }} />
          </p>
          <p className="mt-3 max-w-[80ch] leading-relaxed">{t('images.industryPhotoNote')}</p>
          <p className="mt-3 leading-relaxed">{t('images.photoChanges')}</p>
        </details>
      </Container>
    </section>
  )
}
