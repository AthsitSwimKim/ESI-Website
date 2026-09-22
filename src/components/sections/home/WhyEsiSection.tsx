import { FeatureItem } from '@/components/cards/FeatureItem'
import { Container } from '@/components/ui/Container'
import { NetworkGraphic } from '@/components/ui/NetworkGraphic'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { whyEsi } from '@/data/about'
import { homeSections } from '@/data/home'

/**
 * "Why Partner With ESI" (spec §31, design-spec §4.6). Not in the mockup — rendered as a dark
 * navy section so it sits between the light Featured Projects and the white Process (D4).
 * Reused on the About page.
 */
export function WhyEsiSection({ id = 'why-esi' }: { id?: string }) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="relative isolate overflow-hidden bg-gradient-dark py-14 text-white md:py-20"
    >
      <NetworkGraphic
        seed={29}
        nodes={34}
        opacity={0.18}
        className="absolute inset-y-0 right-0 -z-10 w-[60%]"
      />
      <Container className="relative">
        <SectionTitle id={`${id}-title`} title={homeSections.whyEsi} tone="dark" />
        <Reveal as="ul" staggerChildren={0.08} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {whyEsi.map((f) => (
            <RevealItem key={f.title.en} as="li">
              <FeatureItem feature={f} variant="tile" />
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  )
}
