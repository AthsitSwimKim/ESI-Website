import { ProjectCard } from '@/components/cards/ProjectCard'
import { Container } from '@/components/ui/Container'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

interface RelatedProjectsProps {
  projects: Project[]
  title: string
  id?: string
  /** Optional right-aligned link on the title row (e.g. "View all projects"). */
  action?: React.ReactNode
  /** Reduced section spacing for solution detail pages. */
  compact?: boolean
}

/**
 * Shared "Related Projects" block used by solution and project detail pages. Renders nothing
 * when the list is empty, so a solution without references simply omits the section.
 */
export function RelatedProjects({
  projects,
  title,
  id = 'related-projects',
  action,
  compact = false,
}: RelatedProjectsProps) {
  if (projects.length === 0) return null

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn('bg-esi-light', compact ? 'py-6 md:py-8' : 'py-14 md:py-20')}
    >
      <Container>
        <SectionTitle
          id={`${id}-title`}
          title={title}
          action={action}
          spacing={compact ? 'compact' : 'default'}
        />
        <Reveal as="ul" staggerChildren={0.1} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <RevealItem key={project.slug} as="li">
              <ProjectCard project={project} />
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  )
}
