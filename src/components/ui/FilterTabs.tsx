import { cn } from '@/lib/utils'

export interface FilterOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface FilterTabsProps<T extends string> {
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible name for the group, e.g. "Filter projects by category". */
  label: string
  className?: string
}

/**
 * Pill filter row (design-spec §5 Projects): real buttons with `aria-pressed`, horizontally
 * scrollable on phones. The page owns the state so it can mirror it into the URL.
 */
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: FilterTabsProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        '-mx-5 scrollbar-none flex gap-2 overflow-x-auto px-5 lg:-mx-8 lg:px-8',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[4px] border px-4 text-sm font-semibold transition-colors duration-200',
              active
                ? 'border-esi-blue bg-esi-blue text-white'
                : 'border-esi-border bg-white text-esi-navy hover:border-esi-accent hover:text-esi-blue',
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cn('text-[12px]', active ? 'text-white/70' : 'text-esi-muted')}>
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
