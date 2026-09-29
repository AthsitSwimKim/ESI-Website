import { motion } from 'motion/react'
import { Suspense } from 'react'
import {
  isRouteErrorResponse,
  Outlet,
  useLocation,
  useMatches,
  useRouteError,
} from 'react-router-dom'

import { Container } from '@/components/ui/Container'
import { useT } from '@/i18n'
import { NotFoundPage } from '@/pages/NotFoundPage'

import { CtaBand } from './CtaBand'
import { Footer } from './Footer'
import { Header } from './Header'
import { ScrollToTop } from './ScrollToTop'

/** Route `handle` shape — set `hideCta` on routes without the CTA band (Contact). */
export interface RouteHandle {
  hideCta?: boolean
}

export function PageSkeleton() {
  const { t } = useT()
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span className="text-sm text-esi-muted">{t('a11y.loading')}</span>
    </div>
  )
}

/** Rendered inside the layout when a loader throws (404 for unknown slugs / paths). */
function RouteError() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  if (import.meta.env.DEV) console.error(error)
  return (
    <section className="py-24" aria-labelledby="err-title">
      <Container>
        <p className="text-[13px] font-semibold tracking-[.1em] text-esi-accent uppercase">Error</p>
        <h1
          id="err-title"
          className="mt-2 display-title text-[clamp(1.375rem,2vw,1.75rem)] text-esi-blue"
        >
          Something went wrong.
        </h1>
        <span aria-hidden className="mt-2.5 block h-[3px] w-10 bg-esi-blue" />
        <p className="mt-6 max-w-[60ch] text-esi-muted">
          Please reload the page or return to the home page.
        </p>
      </Container>
    </section>
  )
}

/**
 * Global layout (spec §10): Header → Main → Call To Action → Footer.
 * `errorBoundary` renders the route error (404 etc.) in place of the outlet, without the CTA.
 */
export function RootLayout({ errorBoundary = false }: { errorBoundary?: boolean }) {
  const matches = useMatches()
  const { pathname } = useLocation()
  const { t } = useT()
  const hideCta =
    errorBoundary || matches.some((m) => (m.handle as RouteHandle | undefined)?.hideCta)

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-[4px] bg-esi-blue px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('a11y.skipToContent')}
      </a>
      <ScrollToTop />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {errorBoundary ? (
          <RouteError />
        ) : (
          <Suspense fallback={<PageSkeleton />}>
            {/* Short fade on every route change so navigation feels the same everywhere.
                Keyed by pathname; no exit animation, so the new page is never held back. */}
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </Suspense>
        )}
      </main>
      {!hideCta && <CtaBand />}
      <Footer />
    </>
  )
}
