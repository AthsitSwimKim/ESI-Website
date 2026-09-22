import { IndustryCard } from '@/components/cards/IndustryCard'
import { Container } from '@/components/ui/Container'
import { DiagonalLines } from '@/components/ui/DiagonalLines'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { homeSections } from '@/data/home'
import { industries } from '@/data/industries'

/**
 * "Industries We Serve" (spec §24, design-spec §4.4): five image cards in a row; on phones the
 * row becomes a horizontal snap-scroll strip (spec allows "1 per row or horizontal scroll").
 */
export function IndustriesSection({
  title = homeSections.industries,
  id = 'industries',
}: {
  title?: string
  id?: string
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="relative isolate overflow-hidden bg-white py-14 md:py-20"
    >
      <DiagonalLines className="absolute bottom-6 -left-4" />
      <Container className="relative">
        <SectionTitle id={`${id}-title`} title={title} />
      </Container>
      <Reveal
        as="ul"
        staggerChildren={0.08}
        className="mx-auto scrollbar-none flex max-w-[1280px] snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-5 lg:grid-cols-5 lg:px-8"
      >
        {industries.map((i) => (
          <RevealItem key={i.slug} as="li" className="w-[78vw] shrink-0 snap-start sm:w-auto">
            <IndustryCard industry={i} />
          </RevealItem>
        ))}
      </Reveal>
    </section>
  )
}
