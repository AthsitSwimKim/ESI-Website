import { useContext } from 'react'

import { getServiceBySlug } from '@/data/services'
import type { NavItem } from '@/types'

import { LangContext, type LangContextValue, type TKey } from './context'

/** Access the active language, `t()` for UI strings and `l()` for localised data fields. */
export function useT(): LangContextValue & { label: (key: NavItem['labelKey']) => string } {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useT must be used inside <LangProvider>')

  /**
   * Resolve a navigation label. Plain keys go through the dictionary; `service:<slug>` keys
   * (generated in navigation.ts from services.ts) resolve to the localised service name.
   */
  const label = (key: string): string => {
    if (key.startsWith('service:')) {
      const service = getServiceBySlug(key.slice('service:'.length))
      return service ? ctx.l(service.name) : key
    }
    return ctx.t(key as TKey)
  }

  return { ...ctx, label }
}
