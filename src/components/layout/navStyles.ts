import { cn } from '@/lib/utils'

/** Shared desktop nav-link classes (design-spec §3 Header). */
export const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative flex h-full items-center text-[15px] font-medium transition-colors duration-200 hover:text-esi-blue',
    isActive ? 'text-esi-blue' : 'text-esi-navy',
  )
