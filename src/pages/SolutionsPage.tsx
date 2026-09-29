import { SolutionCard } from '@/components/cards/SolutionCard'
import { ProcessSection } from '@/components/sections/home/ProcessSection'
import { Container } from '@/components/ui/Container'
import { DiagonalLines } from '@/components/ui/DiagonalLines'
import { PageHero } from '@/components/ui/PageHero'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { Seo } from '@/components/ui/Seo'
import { pageHeroes } from '@/data/pages'
import { pageTitle } from '@/data/seo'
import { services, solutionsIntro } from '@/data/services'
import { useT } from '@/i18n'

/** /solutions (spec §15, design-spec §5): hero, intro, 3×2 rich cards, Process (reused), CTA. */
export function SolutionsPage() {
  const { t, l } = useT()
  const hero = pageHeroes.solutions

  return (
    <>
      <Seo title={pageTitle('Solutions')} description={l(hero.lead!)} path="/solutions" />
      <PageHero
        title={l(hero.title)}
        lead={l(hero.lead!)}
        image={hero.image}
        breadcrumb={[{ label: t('nav.home'), to: '/' }, { label: t('nav.solutions') }]}
      />

      <section
        aria-label={t('nav.solutions')}
        className="relative isolate overflow-hidden py-14 md:py-20"
      >
        <DiagonalLines className="absolute bottom-6 -left-4" />
        <Container className="relative">
          <Reveal className="mb-10 max-w-[70ch] text-base leading-[1.7] text-esi-text md:text-lg">
            {l(solutionsIntro)}
          </Reveal>
          <Reveal
            as="ul"
            staggerChildren={0.08}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service) => (
              <RevealItem key={service.slug} as="li">
                <SolutionCard service={service} variant="rich" />
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      <ProcessSection />
    </>
  )
}
