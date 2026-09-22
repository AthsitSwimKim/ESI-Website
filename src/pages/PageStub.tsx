import type { ReactNode } from 'react'

import { Container } from '@/components/ui/Container'

/**
 * PHASE 1 ONLY — placeholder page body used until each page is built in Phases 3–7.
 * Delete this file once no page imports it.
 */
export function PageStub({
  title,
  phase,
  children,
}: {
  title: string
  phase: string
  children?: ReactNode
}) {
  return (
    <section className="py-20" aria-labelledby="page-title">
      <Container>
        <p className="text-[13px] font-semibold tracking-[.08em] text-esi-accent uppercase">
          Coming in {phase}
        </p>
        <h1
          id="page-title"
          className="mt-2 display-title text-[clamp(1.375rem,2vw,1.75rem)] text-esi-blue"
        >
          {title}
        </h1>
        <span aria-hidden className="mt-2.5 block h-[3px] w-10 bg-esi-blue" />
        {children && <div className="mt-8 max-w-[60ch] text-esi-text">{children}</div>}
      </Container>
    </section>
  )
}
