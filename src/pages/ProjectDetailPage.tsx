import { CircleCheck } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { SolutionCard } from '@/components/cards/SolutionCard'
import { RelatedProjects } from '@/components/sections/shared/RelatedProjects'
import { Container } from '@/components/ui/Container'
import { DiagonalLines } from '@/components/ui/DiagonalLines'
import { PageHero } from '@/components/ui/PageHero'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Seo } from '@/components/ui/Seo'
import { getIndustry } from '@/data/industries'
import { getProjectBySlug, getRelatedProjects } from '@/data/projects'
import { pageTitle } from '@/data/seo'
import { getServiceByCategory } from '@/data/services'
import { useT } from '@/i18n'

/**
 * /projects/:slug (spec §30, design-spec §5): hero → meta strip → overview → scope →
 * solutions used → gallery → related projects → CTA. The route loader 404s unknown slugs.
 */
export function ProjectDetailPage() {
  const { slug } = useParams()
  const { t, l } = useT()
  const project = getProjectBySlug(slug)
  if (!project) return null

  const industry = getIndustry(project.industry)
  const services = project.categories.map(getServiceByCategory).filter((s) => s !== undefined)
  const related = getRelatedProjects(project, 3)

  const meta = [
    { label: t('projects.client'), value: project.client },
    { label: t('projects.industry'), value: l(industry.name) },
    { label: t('projects.location'), value: project.location },
    {
      label: t('projects.services'),
      value: project.categories.map((c) => t(`categories.${c}`)).join(' · '),
    },
  ]

  return (
    <>
      <Seo
        title={pageTitle(project.title)}
        description={project.description.slice(0, 160)}
        path={`/projects/${project.slug}`}
        image={project.image}
        type="article"
      />
      <PageHero
        title={project.title}
        image={project.image}
        breadcrumb={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.projects'), to: '/projects' },
          { label: project.title },
        ]}
      />

      {/* Meta strip */}
      <section aria-label={t('projects.overview')} className="bg-esi-light">
        <Container>
          <dl className="grid gap-x-8 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="text-[13px] font-semibold tracking-[.08em] text-esi-muted uppercase">
                  {item.label}
                </dt>
                <dd className="mt-1.5 text-base font-semibold text-esi-navy">{item.value}</dd>
              </div>
            ))}
            {project.year && (
              <div>
                <dt className="text-[13px] font-semibold tracking-[.08em] text-esi-muted uppercase">
                  {t('projects.year')}
                </dt>
                <dd className="mt-1.5 text-base font-semibold text-esi-navy">{project.year}</dd>
              </div>
            )}
          </dl>
        </Container>
      </section>

      {/* Overview + scope */}
      <section
        aria-labelledby="project-overview-title"
        className="relative isolate overflow-hidden py-14 md:py-20"
      >
        <DiagonalLines className="absolute -right-4 bottom-6" />
        <Container className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Reveal>
            <SectionTitle id="project-overview-title" title={t('projects.overview')} />
            <p className="max-w-[60ch] text-base leading-[1.7] text-esi-text md:text-lg">
              {project.description}
            </p>
            {project.partners && project.partners.length > 0 && (
              <ul className="mt-6 space-y-1 text-sm text-esi-muted">
                {project.partners.map((partner) => (
                  <li key={partner}>{partner}</li>
                ))}
              </ul>
            )}
          </Reveal>

          {project.scope && project.scope.length > 0 && (
            <Reveal staggerChildren={0.06}>
              <RevealItem>
                <h2 className="display-title text-[clamp(1.125rem,1.6vw,1.375rem)] text-esi-blue">
                  {t('projects.scope')}
                </h2>
                <span aria-hidden className="mt-2.5 mb-6 block h-[3px] w-10 bg-esi-blue" />
              </RevealItem>
              <ul className="space-y-3">
                {project.scope.map((item) => (
                  <RevealItem key={item} as="li">
                    <div className="flex items-start gap-3 rounded-[4px] bg-esi-light px-4 py-3.5">
                      <CircleCheck
                        aria-hidden
                        size={20}
                        strokeWidth={1.75}
                        className="mt-0.5 shrink-0 text-esi-blue"
                      />
                      <span className="text-base leading-snug text-esi-text">{item}</span>
                    </div>
                  </RevealItem>
                ))}
              </ul>
            </Reveal>
          )}
        </Container>
      </section>

      {/* Solutions used on this project */}
      {services.length > 0 && (
        <section aria-labelledby="project-solution-title" className="bg-white pb-14 md:pb-20">
          <Container>
            <SectionTitle id="project-solution-title" title={t('projects.solution')} />
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
      )}

      {/* Gallery — only when ESI supplies extra photos */}
      {project.gallery && project.gallery.length > 0 && (
        <section aria-labelledby="project-gallery-title" className="bg-esi-light py-14 md:py-20">
          <Container>
            <SectionTitle id="project-gallery-title" title={t('projects.gallery')} />
            <Reveal
              as="ul"
              staggerChildren={0.08}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {project.gallery.map((src, i) => (
                <RevealItem key={src} as="li">
                  <img
                    src={src}
                    alt={`${project.title} — ${i + 1}`}
                    loading="lazy"
                    width={1600}
                    height={1200}
                    className="aspect-[4/3] w-full rounded-[4px] object-cover"
                  />
                </RevealItem>
              ))}
            </Reveal>
          </Container>
        </section>
      )}

      <RelatedProjects projects={related} title={t('projects.related')} id="project-related" />
    </>
  )
}
