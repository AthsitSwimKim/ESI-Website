import { ZoomIn } from 'lucide-react'

import { Container } from '@/components/ui/Container'
import { ImageViewer } from '@/components/ui/ImageViewer'
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
    <section aria-labelledby="solution-gallery-title" className="bg-white py-6 md:py-8">
      <Container>
        <SectionTitle
          id="solution-gallery-title"
          title={t('solutions.gallery')}
          subtitle={t('solutions.galleryNote')}
          spacing="compact"
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Reveal as="li" key={image.src}>
              <ImageViewer
                src={image.src}
                caption={l(image.caption)}
                width={image.width}
                height={image.height}
                className="group block h-full w-full overflow-hidden rounded-[4px] border border-esi-border bg-white transition-colors hover:border-esi-accent"
                label={`${l(image.caption)} — ${t('solutions.viewImage')}`}
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
                  <ZoomIn aria-hidden size={18} className="mt-0.5 shrink-0 text-esi-blue" />
                </div>
              </ImageViewer>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
