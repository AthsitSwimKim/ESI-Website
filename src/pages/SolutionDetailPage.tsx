import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { RelatedProjects } from '@/components/sections/shared/RelatedProjects'
import { SolutionFeatures } from '@/components/sections/shared/SolutionFeatures'
import { Container } from '@/components/ui/Container'
import { DiagonalLines } from '@/components/ui/DiagonalLines'
import { Icon } from '@/components/ui/Icon'
import { PageHero } from '@/components/ui/PageHero'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Seo } from '@/components/ui/Seo'
import { getIndustry } from '@/data/industries'
import { getProjectsByCategory } from '@/data/projects'
import { pageTitle } from '@/data/seo'
import { getAdjacentServices, getServiceBySlug } from '@/data/services'
import { useT } from '@/i18n'
import { scaleIn } from '@/lib/motion'

/**
 * /solutions/:slug — one template for all six solutions (spec §16–21, design-spec §5):
 * hero → overview → what we deliver → industries served → related projects → prev/next → CTA.
 * The route loader already 404s unknown slugs, so `service` is always defined here.
 */
export function SolutionDetailPage() {
  const { slug } = useParams()
  const { t, l } = useT()
  const service = getServiceBySlug(slug)
  if (!service) return null

  const { prev, next } = getAdjacentServices(service.slug)
  const related = getProjectsByCategory(service.category).slice(0, 3)
  const name = l(service.name)

  return (
    <>
      <Seo
        title={pageTitle(name)}
        description={l(service.description).slice(0, 160)}
        path={`/solutions/${service.slug}`}
      />
      <PageHero
        title={name}
        lead={l(service.tagline)}
        image={service.image}
        breadcrumb={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.solutions'), to: '/solutions' },
          { label: name },
        ]}
      />

      {/* Overview */}
      <section aria-labelledby="solution-overview-title" className="py-14 md:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal immediate>
            <div className="flex size-14 items-center justify-center rounded-[4px] bg-esi-light text-esi-blue">
              <Icon name={service.icon} size={32} strokeWidth={1.25} />
            </div>
            {/* The page hero already carries the solution name, so this section is just "Overview" */}
            <SectionTitle
              id="solution-overview-title"
              title={t('solutions.overview')}
              className="mt-5 mb-0"
              as="h2"
            />
            <p className="mt-6 max-w-[60ch] text-base leading-[1.7] text-esi-text md:text-lg">
              {l(service.description)}
            </p>
          </Reveal>
          <Reveal variants={scaleIn} immediate>
            <img
              src={service.image}
              alt=""
              loading="lazy"
              width={1200}
              height={800}
              className="aspect-[3/2] w-full object-cover lg:clip-slant-img-left"
            />
          </Reveal>
        </Container>
      </section>

      {/* What we deliver */}
      <section
        aria-labelledby="solution-features-title"
        className="relative isolate overflow-hidden bg-white py-14 md:py-20"
      >
        <DiagonalLines className="absolute -right-4 bottom-6" />
        <Container className="relative">
          <SectionTitle id="solution-features-title" title={t('solutions.whatWeDeliver')} />
          <SolutionFeatures features={service.features} />
        </Container>
      </section>

      {/* Industries served */}
      <section aria-labelledby="solution-industries-title" className="bg-esi-light py-14 md:py-20">
        <Container>
          <SectionTitle id="solution-industries-title" title={t('solutions.industriesServed')} />
          <Reveal as="ul" staggerChildren={0.06} className="flex flex-wrap gap-3">
            {service.industries.map((slug) => {
              const industry = getIndustry(slug)
              return (
                <li key={slug}>
                  <Link
                    to={`/industries#${slug}`}
                    className="group inline-flex items-center gap-2 rounded-[4px] border border-esi-border bg-white px-4 py-2.5 transition-colors hover:border-esi-accent"
                  >
                    <Icon
                      name={industry.icon}
                      size={20}
                      strokeWidth={1.75}
                      className="text-esi-blue"
                    />
                    <span className="text-sm font-semibold text-esi-navy group-hover:text-esi-blue">
                      {l(industry.name)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </Reveal>
        </Container>
      </section>

      <RelatedProjects
        projects={related}
        title={t('solutions.relatedProjects')}
        id="solution-related"
      />

      {/* Previous / next solution */}
      <nav aria-label={t('nav.solutions')} className="border-t border-esi-border bg-white py-8">
        <Container>
          <Reveal as="ul" staggerChildren={0.08} className="grid gap-4 sm:grid-cols-2">
            <RevealItem as="li">
              <Link
                to={`/solutions/${prev.slug}`}
                className="group flex items-center gap-3 rounded-[4px] border border-esi-border p-4 transition-colors hover:border-esi-accent"
              >
                <ChevronLeft
                  aria-hidden
                  size={20}
                  strokeWidth={2}
                  className="shrink-0 text-esi-blue transition-transform duration-200 group-hover:-translate-x-1"
                />
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold tracking-[.08em] text-esi-muted uppercase">
                    {t('solutions.previous')}
                  </span>
                  <span className="block truncate text-[15px] font-semibold text-esi-navy group-hover:text-esi-blue">
                    {l(prev.name)}
                  </span>
                </span>
              </Link>
            </RevealItem>
            <RevealItem as="li">
              <Link
                to={`/solutions/${next.slug}`}
                className="group flex h-full items-center justify-end gap-3 rounded-[4px] border border-esi-border p-4 text-right transition-colors hover:border-esi-accent"
              >
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold tracking-[.08em] text-esi-muted uppercase">
                    {t('solutions.next')}
                  </span>
                  <span className="block truncate text-[15px] font-semibold text-esi-navy group-hover:text-esi-blue">
                    {l(next.name)}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden
                  size={20}
                  strokeWidth={2}
                  className="shrink-0 text-esi-blue transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </RevealItem>
          </Reveal>
        </Container>
      </nav>
    </>
  )
}
