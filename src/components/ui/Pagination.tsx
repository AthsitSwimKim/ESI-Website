import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useT } from '@/i18n'
import { pageItems } from '@/lib/pagination'
import { cn } from '@/lib/utils'

interface PaginationProps {
  /** 1-based current page. */
  page: number
  totalPages: number
  onChange: (page: number) => void
}

/** Round 40px control — filter-pill height and colours, but circular (design-spec §5, D26). */
const cell =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40'
const idle = 'border-esi-border bg-white text-esi-navy hover:border-esi-accent hover:text-esi-blue'
const current = 'border-esi-blue bg-esi-blue text-white'

/**
 * Page switcher for the Projects grid. Renders nothing for a single page, so a category filter
 * that returns one screenful simply has no control under it.
 */
function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const { t } = useT()
  if (totalPages <= 1) return null

  return (
    <nav aria-label={t('pagination.label')} className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label={t('pagination.previous')}
        className={cn(cell, idle)}
      >
        <ChevronLeft aria-hidden size={18} strokeWidth={2.25} />
      </button>

      {pageItems(page, totalPages).map((item, i) =>
        item === 'gap' ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="flex h-10 w-6 items-center justify-center font-semibold text-esi-muted"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-label={`${t('pagination.goTo')} ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={cn(cell, item === page ? current : idle)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label={t('pagination.next')}
        className={cn(cell, idle)}
      >
        <ChevronRight aria-hidden size={18} strokeWidth={2.25} />
      </button>
    </nav>
  )
}

export function ProjectPagination({
  page,
  total,
  perPage,
  onChange,
}: Omit<PaginationProps, 'totalPages'> & { total: number; perPage: number }) {
  const { t } = useT()
  if (total === 0) return null

  const totalPages = Math.ceil(total / perPage)
  const first = (page - 1) * perPage + 1
  const range = totalPages > 1 ? `${first}–${Math.min(page * perPage, total)}` : String(total)

  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-esi-border pt-6">
      <p aria-live="polite" className="text-sm text-esi-muted">
        {t('projects.showing')} <span className="font-semibold text-esi-navy">{range}</span>{' '}
        {totalPages > 1 && (
          <>
            {t('projects.rangeOf')}{' '}
            <span className="font-semibold text-esi-navy">{total}</span>{' '}
          </>
        )}
        {t('projects.items')}
      </p>
      <Pagination page={page} totalPages={totalPages} onChange={onChange} />
    </div>
  )
}
