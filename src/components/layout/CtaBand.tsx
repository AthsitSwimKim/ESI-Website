import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { DiagonalLines } from '@/components/ui/DiagonalLines'
import { NetworkGraphic } from '@/components/ui/NetworkGraphic'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { ctaBand } from '@/data/home'
import { useT } from '@/i18n'

/**
 * Call-to-action band above the footer (spec §33, design-spec §3): navy gradient, faint
 * network graphic, italic display copy and a white "Contact ESI" button.
 */
export function CtaBand() {
  const { t, l } = useT()
  return (
    <section
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden bg-gradient-dark py-10 text-white md:py-12"
    >
      <NetworkGraphic
        seed={5}
        nodes={30}
        opacity={0.35}
        className="absolute inset-y-0 right-[10%] -z-10 w-[55%]"
      />
      <DiagonalLines
        tone="light"
        size={56}
        className="absolute right-6 -bottom-2 hidden md:block"
      />
      <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <Reveal staggerChildren={0.1}>
          <RevealItem>
            <p className="text-sm font-medium tracking-[.04em] text-white/85 uppercase italic md:text-base">
              {l(ctaBand.line1)}
            </p>
            <h2
              id="cta-title"
              className="mt-1 display-title text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight"
            >
              {l(ctaBand.line2)}
            </h2>
          </RevealItem>
        </Reveal>
        <Reveal delay={0.2} className="w-full shrink-0 md:w-auto">
          <Button variant="light" to={ctaBand.button.to} className="w-full md:w-auto">
            {t('cta.contact')}
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}
