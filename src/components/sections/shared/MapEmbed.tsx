import { ExternalLink } from 'lucide-react'

import { company } from '@/data/company'
import { useT } from '@/i18n'

/**
 * Google Maps embed (spec §36): a plain iframe built from the office coordinates — no API key,
 * no backend. Lazy-loaded so it never blocks the first paint.
 */
export function MapEmbed() {
  const { t } = useT()

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-[4px] border border-esi-border bg-esi-light md:min-h-[420px]">
        <iframe
          src={company.map.embedUrl}
          title={t('contact.mapTitle')}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <a
        href={company.map.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-3 inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-esi-blue underline-offset-4 hover:underline"
      >
        {t('contact.openInMaps')}
        <ExternalLink aria-hidden size={14} strokeWidth={2.25} />
      </a>
    </div>
  )
}
