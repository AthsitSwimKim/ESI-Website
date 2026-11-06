import { useEffect, useState } from 'react'

import { useT } from '@/i18n'

export function FooterVisitorCount() {
  const { t, lang } = useT()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (import.meta.env.MODE !== 'chaiyo') return

    const controller = new AbortController()
    void fetch(`${import.meta.env.BASE_URL}visitor-count.php`, {
      method: 'POST',
      headers: { 'X-ESI-Visitor': '1' },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return

        const data: { count?: unknown } | null = await response.json()
        if (typeof data?.count === 'number' && Number.isSafeInteger(data.count) && data.count >= 0) {
          setCount(data.count)
        }
      })
      .catch(() => {})

    return () => controller.abort()
  }, [])

  const maxDisplayedCount = 999_999
  const digits = String(Math.min(count, maxDisplayedCount)).padStart(6, '0')
  const locale = lang === 'th' ? 'th-TH' : 'en-GB'
  const countLabel = new Intl.NumberFormat(locale).format(count)

  return (
    <p className="mt-10 text-sm text-white/75">
      {t('footer.visitorCount')} <span className="sr-only">{countLabel}</span>
      <span aria-hidden className="mt-2 flex items-center gap-1.5" title={countLabel}>
        {Array.from(digits, (digit, index) => (
          <span
            key={index}
            className="inline-grid h-9 w-7 place-items-center rounded-[3px] border border-white/20 bg-white/8 text-lg font-semibold text-white tabular-nums"
          >
            {digit}
          </span>
        ))}
        {count > maxDisplayedCount && <span className="text-lg text-white">+</span>}
      </span>
    </p>
  )
}
