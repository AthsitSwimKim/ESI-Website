import { useT } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Lang } from '@/types'

const LANGS: Lang[] = ['th', 'en']

/** Header "TH | EN" toggle (spec §11). Persisted by LangProvider. */
export function LangSwitch({ className, size = 'sm' }: { className?: string; size?: 'sm' | 'md' }) {
  const { lang, setLang, t } = useT()
  return (
    <div
      role="group"
      aria-label={t('a11y.language')}
      className={cn(
        'flex items-center font-semibold',
        size === 'sm' ? 'text-[13px]' : 'text-[15px]',
        className,
      )}
    >
      {LANGS.map((code, i) => (
        <span key={code} className="flex items-center">
          {i > 0 && <span aria-hidden className="mx-2.5 h-3.5 w-px bg-esi-border" />}
          <button
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            lang={code}
            className={cn(
              'rounded-[2px] px-0.5 uppercase transition-colors hover:text-esi-navy',
              lang === code ? 'text-esi-navy' : 'text-esi-muted',
            )}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  )
}
