import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

/** Centred "nothing here" block with a way back — used by the project filter (design-spec §5). */
export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="rounded-[4px] border border-dashed border-esi-border bg-esi-light/60 px-6 py-16 text-center">
      <SearchX aria-hidden size={40} strokeWidth={1.25} className="mx-auto text-esi-muted" />
      <p className="mt-4 text-base text-esi-muted">{message}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}
