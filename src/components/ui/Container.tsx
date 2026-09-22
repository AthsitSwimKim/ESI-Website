import type { ComponentPropsWithoutRef, ElementType } from 'react'

import { cn } from '@/lib/utils'

type ContainerProps<T extends ElementType = 'div'> = {
  as?: T
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>

/** Page-width wrapper: 1280px max, 20px gutters on mobile → 32px from lg (design-spec §1). */
export function Container<T extends ElementType = 'div'>({
  as,
  className,
  ...props
}: ContainerProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return <Tag className={cn('mx-auto w-full max-w-[1280px] px-5 lg:px-8', className)} {...props} />
}
