import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Chip } from '@/components/ui/Chip'
import { getIndustry } from '@/data/industries'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'
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
  const { t, l } = useT()
  const horizontal = variant === 'horizontal'
  const industry = getIndustry(project.industry)

  return (
    <article
      className={cn(
        'group relative flex h-full overflow-hidden rounded-[4px] border border-esi-border bg-white shadow-card transition-[transform,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-card-hover',
        horizontal ? 'flex-col sm:grid sm:grid-cols-[45%_1fr]' : 'flex-col',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          horizontal ? 'aspect-[16/10] sm:aspect-auto sm:min-h-[220px]' : 'aspect-[16/10]',
        )}
      >
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          width={1200}
          height={800}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>

      <div className={cn('flex flex-1 flex-col', horizontal ? 'p-5' : 'p-6')}>
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
            horizontal ? 'line-clamp-4 text-[15px]' : 'line-clamp-3 text-[17px]',
          )}
        >
          {/* Stretched link: the whole card is clickable, the title is the accessible link */}
          <Link
            to={`/projects/${project.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {project.title}
          </Link>
        </h3>
        {!horizontal && (
          <p className="mt-1 text-[13px] text-esi-muted">
            {project.client} · {project.location}
          </p>
        )}
        <p
          className={cn(
            'mt-2 line-clamp-3 leading-relaxed text-esi-muted',
            horizontal ? 'text-[13px]' : 'text-sm',
          )}
        >
          {project.description}
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
