import { createContext } from 'react'

import type { Lang, Localized } from '@/types'

import type { Dictionary } from './en'

/* Typed dotted keys of the dictionary, e.g. 'nav.home' | 'cta.contact' */
type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never
type Paths<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : Join<K, Paths<T[K]>> }[keyof T & string]
export type TKey = Paths<Dictionary>

export interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** UI string by typed key; Thai falls back to English when a key is not translated. */
  t: (key: TKey) => string
  /** Localised content field from data files. */
  l: (value: Localized | string) => string
}

export const LangContext = createContext<LangContextValue | null>(null)
