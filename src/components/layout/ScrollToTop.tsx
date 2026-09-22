import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll management on navigation:
 * - new page without a hash → jump to the top;
 * - new page with a hash (e.g. Home industry card → /industries#oil-gas) → jump straight to the
 *   anchor (instant — nobody wants to watch a 2000px smooth scroll on arrival);
 * - hash change on the same page (jump links) → smooth scroll, matching `html { scroll-behavior }`.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const prevPath = useRef(pathname)

  useEffect(() => {
    const samePage = prevPath.current === pathname
    prevPath.current = pathname

    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ block: 'start', behavior: samePage ? 'smooth' : 'instant' })
        return
      }
    }
    if (!samePage) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
