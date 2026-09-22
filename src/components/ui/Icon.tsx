import type { LucideProps } from 'lucide-react'

import { iconMap, type IconName } from '@/data/icons'

/** Render a Lucide icon by registry name so data files can stay serialisable. */
export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Cmp = iconMap[name]
  return <Cmp aria-hidden focusable="false" {...props} />
}
