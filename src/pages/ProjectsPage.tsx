import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ProjectCard } from '@/components/cards/ProjectCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterTabs, type FilterOption } from '@/components/ui/FilterTabs'
import { Icon } from '@/components/ui/Icon'
import { PageHero } from '@/components/ui/PageHero'
import { Seo } from '@/components/ui/Seo'
import { getIndustry, industries } from '@/data/industries'
import { pageHeroes } from '@/data/pages'
import { projectFilters, projects } from '@/data/projects'
import { pageTitle } from '@/data/seo'
import { useT } from '@/i18n'
import { EASE_ESI } from '@/lib/motion'
import { INDUSTRY_SLUGS, type IndustrySlug, type ProjectCategory } from '@/types'

type CategoryValue = ProjectCategory | 'all'

const CATEGORY_VALUES = projectFilters.map((f) => f.value)
const isCategory = (v: string | null): v is CategoryValue =>
  !!v && (CATEGORY_VALUES as string[]).includes(v)
const isIndustry = (v: string | null): v is IndustrySlug =>
  !!v && (INDUSTRY_SLUGS as readonly string[]).includes(v)

/**
 * /projects (spec §27, design-spec §5): filter tabs + grid of vertical project cards.
 * Both filters live in the URL so a filtered view can be linked or bookmarked:
 * `?category=cctv` from the tabs, `?industry=oil-gas` from the Industries page.
 */
export function ProjectsPage() {
  const { t, l } = useT()
  const [params, setParams] = useSearchParams()
  const hero = pageHeroes.projects

  const category: CategoryValue = isCategory(params.get('category'))
    ? (params.get('category') as CategoryValue)
    : 'all'
  const industry = isIndustry(params.get('industry'))
    ? (params.get('industry') as IndustrySlug)
    : null

  const byIndustry = useMemo(
    () => (industry ? projects.filter((p) => p.industry === industry) : projects),
    [industry],
  )
  const results = useMemo(
    () =>
      category === 'all' ? byIndustry : byIndustry.filter((p) => p.categories.includes(category)),
    [byIndustry, category],
  )

  /** Counts reflect the industry filter so a tab never promises results it cannot show. */
  const options: FilterOption<CategoryValue>[] = projectFilters.map((f) => ({
    value: f.value,
    label: t(f.labelKey as never),
    count:
      f.value === 'all'
        ? byIndustry.length
        : byIndustry.filter((p) => p.categories.includes(f.value as ProjectCategory)).length,
  }))

  const update = (next: { category?: CategoryValue; industry?: IndustrySlug | null }) => {
    const search = new URLSearchParams(params)
    const nextCategory = next.category ?? category
    const nextIndustry = next.industry === undefined ? industry : next.industry
    // Keep the URL clean: only non-default values appear.
    if (nextCategory === 'all') search.delete('category')
    else search.set('category', nextCategory)
    if (!nextIndustry) search.delete('industry')
    else search.set('industry', nextIndustry)
    setParams(search, { replace: true, preventScrollReset: true })
  }

  return (
    <>
      <Seo title={pageTitle('Projects')} description={l(hero.lead!)} path="/projects" />
      <PageHero
        title={l(hero.title)}
        lead={l(hero.lead!)}
        image={hero.image}
        breadcrumb={[{ label: t('nav.home'), to: '/' }, { label: t('nav.projects') }]}
      />

      <section aria-labelledby="projects-results-title" className="py-10 md:py-14">
        <Container>
          {/* The page hero already shows "Projects" visually; this heading keeps the document
              outline h1 → h2 → h3 (card titles) instead of jumping a level. */}
          <h2 id="projects-results-title" className="sr-only">
            {t('nav.projects')}
          </h2>
          <FilterTabs
            options={options}
            value={category}
            onChange={(value) => update({ category: value })}
            label={t('projects.filterLabel')}
          />

          {industry && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-esi-muted">
              <span>{t('projects.industry')}:</span>
              <button
                type="button"
                onClick={() => update({ industry: null })}
                className="group inline-flex items-center gap-2 rounded-[4px] border border-esi-blue bg-esi-light px-3 py-1.5 text-[13px] font-semibold text-esi-blue transition-colors hover:border-esi-accent"
              >
                <Icon name={getIndustry(industry).icon} size={16} strokeWidth={1.75} />
                {l(getIndustry(industry).name)}
                <X aria-hidden size={14} strokeWidth={2.5} />
                <span className="sr-only">{t('projects.clearIndustry')}</span>
              </button>
            </div>
          )}

          <p aria-live="polite" className="mt-6 text-sm text-esi-muted">
            {results.length} / {projects.length} {t('projects.shown')}
          </p>

          <div className="mt-4">
            {results.length > 0 ? (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.map((project) => (
                    <motion.li
                      key={project.slug}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: EASE_ESI }}
                    >
                      <ProjectCard project={project} variant="vertical" />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <EmptyState
                message={t('projects.empty')}
                action={
                  <Button
                    variant="outline"
                    onClick={() => update({ category: 'all', industry: null })}
                  >
                    {t('projects.showAll')}
                  </Button>
                }
              />
            )}
          </div>

          {/* Quick jump to the other industries — keeps deep-linked views navigable */}
          {industry && (
            <nav aria-label={t('nav.industries')} className="mt-12 border-t border-esi-border pt-6">
              <p className="text-[13px] font-semibold tracking-[.08em] text-esi-muted uppercase">
                {t('nav.industries')}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {industries
                  .filter((i) => i.slug !== industry)
                  .map((i) => (
                    <li key={i.slug}>
                      <button
                        type="button"
                        onClick={() => update({ industry: i.slug })}
                        className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-esi-border bg-white px-3 text-[13px] font-semibold text-esi-navy transition-colors hover:border-esi-accent hover:text-esi-blue"
                      >
                        <Icon
                          name={i.icon}
                          size={16}
                          strokeWidth={1.75}
                          className="text-esi-blue"
                        />
                        {l(i.name)}
                      </button>
                    </li>
                  ))}
              </ul>
            </nav>
          )}
        </Container>
      </section>
    </>
  )
}
