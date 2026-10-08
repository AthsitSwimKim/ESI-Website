import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Chip } from '@/components/ui/Chip'
import { getIndustry } from '@/data/industries'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'
import { projectText } from '@/lib/projectText'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  /**
   * `horizontal` = Home mockup card (image left 45%, text right; stacks below 640px).
   * `vertical` = Projects grid card (image on top). Design-spec §4.5 / §5.
   */
  variant?: 'horizontal' | 'vertical'
  className?: string
}

export function ProjectCard({ project, variant = 'horizontal', className }: ProjectCardProps) {
  const { t, l, lang } = useT()
  const horizontal = variant === 'horizontal'
  const industry = getIndustry(project.industry)
  const copy = projectText(project, lang)

  return (
    <article
      className={cn(
        'group relative flex h-full overflow-hidden rounded-[4px] border border-esi-border bg-white shadow-card transition-[translate,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-card-hover',
        horizontal ? 'grid grid-cols-[38%_1fr] sm:grid-cols-[45%_1fr]' : 'flex-col',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          horizontal ? 'min-h-[190px] sm:min-h-[220px]' : 'aspect-[16/10]',
        )}
      >
        <img
          src={project.image}
          alt={copy.title}
          loading="lazy"
          width={1200}
          height={800}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        {project.imageKind === 'illustration' && (
          <span className="absolute bottom-2 left-2 rounded-[3px] bg-esi-navy/85 px-2 py-1 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
            {t('projects.illustrativeImage')}
          </span>
        )}
        {/* Same hover language as the industry cards: a blue wash and an arrow sliding in */}
        <div
          aria-hidden
          className="absolute inset-0 bg-esi-blue/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="absolute top-3 right-3 flex size-9 translate-y-1 items-center justify-center rounded-full bg-white/95 text-esi-blue opacity-0 shadow-card transition-[translate,opacity] duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ArrowUpRight size={18} strokeWidth={2.25} />
        </span>
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col', horizontal ? 'p-4 sm:p-5' : 'p-6')}>
        {/* The mockup's home card has no chips — they only help scanning in the filterable grid */}
        {!horizontal && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            <Chip>{l(industry.name)}</Chip>
            {project.categories.map((c) => (
              <Chip key={c}>{t(`categories.${c}`)}</Chip>
            ))}
          </div>
        )}
        <h3
          className={cn(
            'leading-snug font-bold text-esi-blue',
            horizontal
              ? 'line-clamp-3 text-[14px] sm:line-clamp-4 sm:text-[15px]'
              : 'line-clamp-3 text-[17px]',
          )}
        >
          {/* Stretched link: the whole card is clickable, the title is the accessible link */}
          <Link
            to={`/projects/${project.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {copy.title}
          </Link>
        </h3>
        {!horizontal && (
          <p className="mt-1 line-clamp-2 text-[13px] text-esi-muted">
            {project.client} · {copy.location}
          </p>
        )}
        <p
          className={cn(
            'mt-2 line-clamp-3 leading-relaxed text-esi-muted',
            horizontal ? 'text-[13px]' : 'text-sm',
          )}
        >
          {copy.description}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold text-esi-blue">
          {t('cta.viewProject')}
          <ChevronRight
            aria-hidden
            size={16}
            strokeWidth={2.25}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </div>
    </article>
  )
}
