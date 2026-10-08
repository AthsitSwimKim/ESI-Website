import { BadgeCheck, CircleCheck, Info } from 'lucide-react'
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
import { projectText } from '@/lib/projectText'

/**
 * /projects/:slug (spec §30, design-spec §5): hero → meta strip → overview → scope →
 * solutions used → gallery → related projects → CTA. The route loader 404s unknown slugs.
 */
export function ProjectDetailPage() {
  const { slug } = useParams()
  const { t, l, lang } = useT()
  const project = getProjectBySlug(slug)
  if (!project) return null

  const industry = getIndustry(project.industry)
  const services = project.categories.map(getServiceByCategory).filter((s) => s !== undefined)
  const related = getRelatedProjects(project, 3)
  const copy = projectText(project, lang)

  const meta = [
    { key: 'client', label: t('projects.client'), value: project.client },
    { key: 'industry', label: t('projects.industry'), value: l(industry.name) },
    { key: 'location', label: t('projects.location'), value: copy.location },
    {
      key: 'services',
      label: t('projects.services'),
      value: project.categories.map((c) => t(`categories.${c}`)).join(' · '),
    },
    ...(project.year
      ? [{ key: 'year', label: t('projects.year'), value: String(project.year) }]
      : []),
  ]

  return (
    <>
      <Seo
        title={pageTitle(copy.title)}
        description={copy.description.slice(0, 160)}
        path={`/projects/${project.slug}`}
        image={project.image}
        type="article"
      />
      <PageHero
        title={copy.title}
        image={project.image}
        imageAlt={copy.title}
        imageMode="split"
        breadcrumb={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.projects'), to: '/projects' },
          { label: copy.title },
        ]}
      >
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-white/25 bg-esi-navy/45 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm">
            <BadgeCheck aria-hidden size={16} />
            {t('projects.referenceRecord')}
          </span>
          {project.imageKind === 'illustration' && (
            <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-white/25 bg-esi-navy/45 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm">
              <Info aria-hidden size={16} />
              {t('projects.illustrativeImage')}
            </span>
          )}
        </div>
      </PageHero>

      {/* Meta strip */}
      <section aria-label={t('projects.overview')} className="bg-esi-light">
        <Container>
          {/* <div> wrappers are valid inside <dl>, so each dt/dd pair can animate on its own */}
          <Reveal
            as="dl"
            immediate
            staggerChildren={0.06}
            delay={0.3}
            className="grid gap-x-8 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-5"
          >
            {meta.map((item) => (
              <RevealItem key={item.key}>
                <dt className="text-[13px] font-semibold tracking-[.08em] text-esi-muted uppercase">
                  {item.label}
                </dt>
                <dd className="mt-1.5 text-base font-semibold text-esi-navy">{item.value}</dd>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      {project.imageKind === 'illustration' && (
        <aside
          className="border-b border-esi-border bg-white"
          aria-label={t('projects.illustrativeImage')}
        >
          <Container className="flex items-start gap-3 py-4 text-sm text-esi-muted">
            <Info aria-hidden size={18} className="mt-0.5 shrink-0 text-esi-blue" />
            <p>{t('projects.illustrativeNote')}</p>
          </Container>
        </aside>
      )}

      {/* Overview + scope */}
      <section
        aria-labelledby="project-overview-title"
        className="relative isolate overflow-hidden py-14 md:py-20"
      >
        <DiagonalLines className="absolute -right-4 bottom-6" />
        <Container className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Reveal immediate>
            <SectionTitle id="project-overview-title" title={t('projects.overview')} />
            <p className="max-w-[60ch] text-base leading-[1.7] text-esi-text md:text-lg">
              {copy.description}
            </p>
            {copy.partners && copy.partners.length > 0 && (
              <div className="mt-7 border-l-2 border-esi-accent pl-4">
                <p className="text-[12px] font-semibold tracking-[.08em] text-esi-muted uppercase">
                  {t('projects.partners')}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-esi-text">
                  {copy.partners.map((partner) => (
                    <li key={partner}>{partner}</li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>

          {copy.scope && copy.scope.length > 0 && (
            <Reveal staggerChildren={0.06}>
              <RevealItem>
                <h2
                  id="project-scope-title"
                  className="display-title text-[clamp(1.125rem,1.6vw,1.375rem)] text-esi-blue"
                >
                  {t('projects.scope')}
                </h2>
                <span aria-hidden className="mt-2.5 mb-6 block h-[3px] w-10 bg-esi-blue" />
              </RevealItem>
              <ul
                id="project-scope-list"
                aria-labelledby="project-scope-title"
                className="space-y-3"
              >
                {copy.scope.map((item, index) => (
                  // Keep the key independent of translated copy. Otherwise a language switch
                  // remounts the item after the viewport-once parent has already animated.
                  <RevealItem key={`${project.slug}-scope-${index}`} as="li">
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
                    alt={`${copy.title} — ${i + 1}`}
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
