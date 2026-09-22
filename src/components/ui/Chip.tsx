import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Small uppercase label for categories / industries (design-spec §5). */
export function Chip({
  children,
  tone = 'light',
  className,
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[4px] px-2.5 py-1 text-[12px] font-semibold tracking-[.06em] uppercase',
        tone === 'dark' ? 'bg-white/10 text-white' : 'bg-esi-light text-esi-blue',
        className,
      )}
    >
      {children}
    </span>
  )
}
