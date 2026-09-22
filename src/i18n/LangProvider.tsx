import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { getPath, localize, storage } from '@/lib/utils'
import type { Lang } from '@/types'

import { LangContext, type LangContextValue } from './context'
import { en } from './en'
import { th } from './th'

const STORAGE_KEY = 'esi-lang'
const dictionaries: Record<Lang, unknown> = { en, th }

function readInitialLang(): Lang {
  const stored = storage.get(STORAGE_KEY)
  return stored === 'th' || stored === 'en' ? stored : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    storage.set(STORAGE_KEY, lang)
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => getPath(dictionaries[lang], key) ?? getPath(en, key) ?? key,
      l: (v) => localize(v, lang),
    }),
    [lang, setLang],
  )

  return <LangContext value={value}>{children}</LangContext>
}
