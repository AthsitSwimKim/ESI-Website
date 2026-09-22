import { SolutionCard } from '@/components/cards/SolutionCard'
import { Container } from '@/components/ui/Container'
import { DiagonalLines } from '@/components/ui/DiagonalLines'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { homeSections } from '@/data/home'
import { services } from '@/data/services'

/** "Our Solutions" (spec §15, design-spec §4.2): six compact cards on the light surface. */
export function SolutionsSection() {
  return (
    <section
      aria-labelledby="solutions-title"
      className="relative isolate overflow-hidden bg-esi-light py-14 md:py-20"
    >
      <DiagonalLines className="absolute bottom-6 -left-4" />
      <DiagonalLines className="absolute -right-4 bottom-6" />
      <Container className="relative">
        <SectionTitle id="solutions-title" title={homeSections.solutions} />
        <Reveal
          as="ul"
          staggerChildren={0.08}
          className="grid grid-cols-1 gap-6 sm:grid-cols-3 xl:grid-cols-6"
        >
          {services.map((s) => (
            <RevealItem key={s.slug} as="li">
              <SolutionCard service={s} />
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  )
}
