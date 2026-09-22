import { ProjectCard } from '@/components/cards/ProjectCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { homeSections } from '@/data/home'
import { getFeaturedProjects } from '@/data/projects'
import { useT } from '@/i18n'

/** "Featured Projects" (spec §26, design-spec §4.5): 3–6 horizontal cards on the light surface. */
export function FeaturedProjectsSection() {
  const { t } = useT()
  const featured = getFeaturedProjects(6)
  if (featured.length === 0) return null

  return (
    <section aria-labelledby="featured-title" className="bg-esi-light py-14 md:py-20">
      <Container>
        <SectionTitle
          id="featured-title"
          title={homeSections.projects}
          action={
            <Button variant="link" to="/projects">
              {t('cta.viewAllProjects')}
            </Button>
          }
        />
        <Reveal as="ul" staggerChildren={0.1} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <RevealItem key={p.slug} as="li">
              <ProjectCard project={p} />
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  )
}
