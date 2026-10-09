import type { Industry } from '@/types'

/** Keep the creator, source and license linked whenever a licensed industry photo is used. */
export function IndustryPhotoCredit({ industry }: { industry: Industry }) {
  const credit = industry.imageCredit
  return (
    <span className="text-xs leading-relaxed text-esi-muted">
      © {credit.author} /{' '}
      <a
        href={credit.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-esi-blue"
      >
        Wikimedia Commons
      </a>{' '}
      /{' '}
      <a
        href={credit.licenseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-esi-blue"
      >
        {credit.license}
      </a>
    </span>
  )
}
