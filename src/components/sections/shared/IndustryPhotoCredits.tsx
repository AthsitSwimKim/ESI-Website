import { IndustryPhotoCredit } from '@/components/ui/IndustryPhotoCredit'
import { industries } from '@/data/industries'
import { useT } from '@/i18n'

/** Native disclosure preserves the card layout and provides accessible, complete attribution. */
export function IndustryPhotoCredits() {
  const { t, l } = useT()
  return (
    <details className="mt-5 border-t border-esi-border pt-4 text-xs text-esi-muted">
      <summary className="w-fit cursor-pointer font-semibold hover:text-esi-blue">
        {t('images.photoCredits')}
      </summary>
      <p className="mt-3 max-w-[80ch] leading-relaxed">{t('images.industryPhotoNote')}</p>
      <ul className="mt-3 space-y-2">
        {industries.map((industry) => (
          <li key={industry.slug}>
            <span className="font-semibold text-esi-navy">{l(industry.name)}</span>
            {' — '}
            {industry.imageCredit.title}. <IndustryPhotoCredit industry={industry} />
          </li>
        ))}
      </ul>
      <p className="mt-3 leading-relaxed">{t('images.photoChanges')}</p>
    </details>
  )
}
