import { cn } from '@/lib/utils'

/** 3px bar at the header's bottom edge; grows from the left on hover, stays on the active page. */
export function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute bottom-0 left-0 h-[3px] w-full origin-left bg-esi-blue transition-transform duration-[250ms]',
        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
      )}
    />
  )
}
