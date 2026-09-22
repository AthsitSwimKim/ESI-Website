import type { Lang, Localized } from '@/types'

/** Join class names, keeping only non-empty strings (so `cond && 'x'` works for any `cond`). */
export function cn(...classes: unknown[]): string {
  return classes.filter((c): c is string => typeof c === 'string' && c.length > 0).join(' ')
}

/** Resolve a `Localized` field (or plain string) for the active language, falling back to English. */
export function localize(value: Localized | string, lang: Lang): string {
  if (typeof value === 'string') return value
  return (lang === 'th' && value.th) || value.en
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]>
}

/** Read a dotted path ('nav.home') from a nested object; undefined when any segment is missing. */
export function getPath(obj: unknown, path: string): string | undefined {
  let cur: unknown = obj
  for (const key of path.split('.')) {
    if (cur === null || typeof cur !== 'object' || !(key in (cur as object))) return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return typeof cur === 'string' ? cur : undefined
}

/** Guarded localStorage access — private mode / blocked storage must never crash the page. */
export const storage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
}
