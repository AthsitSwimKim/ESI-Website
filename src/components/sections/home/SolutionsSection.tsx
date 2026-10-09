import { SolutionCard } from '@/components/cards/SolutionCard'
import { Container } from '@/components/ui/Container'
import { DiagonalLines } from '@/components/ui/DiagonalLines'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { homeSections } from '@/data/home'
import { services } from '@/data/services'

/** Seven solutions from the supplied Company Profile, with balanced 4 + 3 rows on desktop. */
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
        <Reveal as="ul" staggerChildren={0.08} className="flex flex-wrap justify-center gap-6">
          {services.map((s) => (
            <RevealItem
              key={s.slug}
              as="li"
              className="w-full sm:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]"
            >
              <SolutionCard service={s} />
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  )
}
