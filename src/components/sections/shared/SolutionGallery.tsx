import { ArrowUpRight } from 'lucide-react'

import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useT } from '@/i18n'
import type { Service } from '@/types'

export function SolutionGallery({ service }: { service: Service }) {
  const { t, l } = useT()
  // The primary picture is already displayed in Overview; show the remaining source images.
  const images = service.gallery.filter((image) => image.src !== service.image)
  if (!images.length) return null
  return (
    <section aria-labelledby="solution-gallery-title" className="bg-white py-14 md:py-20">
      <Container>
        <SectionTitle
          id="solution-gallery-title"
          title={t('solutions.gallery')}
          subtitle={t('solutions.galleryNote')}
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Reveal as="li" key={image.src}>
              <a
                href={image.src}
                target="_blank"
                rel="noreferrer"
                className="group block h-full overflow-hidden rounded-[4px] border border-esi-border bg-white transition-colors hover:border-esi-accent"
                aria-label={`${l(image.caption)} — ${t('solutions.viewImage')}`}
              >
                <img
                  src={image.src}
                  alt=""
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  className="aspect-[4/3] w-full bg-white object-contain p-4"
                />
                <div className="flex items-start justify-between gap-3 border-t border-esi-border px-5 py-4">
                  <span className="text-sm leading-relaxed font-medium text-esi-navy">
                    {l(image.caption)}
                  </span>
                  <ArrowUpRight aria-hidden size={18} className="mt-0.5 shrink-0 text-esi-blue" />
                </div>
              </a>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
