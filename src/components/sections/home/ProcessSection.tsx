import { ChevronRight } from 'lucide-react'
import { motion, type Variants } from 'motion/react'

import { Container } from '@/components/ui/Container'
import { DiagonalLines } from '@/components/ui/DiagonalLines'
import { Icon } from '@/components/ui/Icon'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { homeSections } from '@/data/home'
import { processSteps } from '@/data/process'
import { useT } from '@/i18n'
import { EASE_ESI } from '@/lib/motion'

/** The dotted connector draws from left to right before the steps appear. */
const lineDraw: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.9, ease: EASE_ESI } },
}
const chevronFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, delay: 0.5 } },
}

/**
 * "Our Process" (spec §32, design-spec §4.7): six steps on a dotted horizontal timeline with
 * chevrons between them on desktop; a vertical rail below 1024px.
 */
export function ProcessSection() {
  const { l } = useT()
  const n = processSteps.length

  return (
    <section
      aria-labelledby="process-title"
      className="relative isolate overflow-hidden bg-white py-14 md:py-20"
    >
      <DiagonalLines className="absolute -right-4 bottom-6" />
      <Container className="relative">
        <SectionTitle
          id="process-title"
          title={homeSections.process}
          subtitle={l(homeSections.processSubtitle)}
        />

        {/* Desktop: horizontal timeline */}
        <Reveal as="ol" staggerChildren={0.12} className="relative hidden lg:grid lg:grid-cols-6">
          <motion.div
            aria-hidden
            variants={lineDraw}
            className="absolute top-[35px] right-[calc(100%/12)] left-[calc(100%/12)] origin-left border-t-2 border-dotted border-esi-border"
          />
          {processSteps.slice(1).map((s, i) => (
            <motion.span
              key={s.step}
              aria-hidden
              variants={chevronFade}
              className="absolute top-9 -translate-x-1/2 -translate-y-1/2 bg-white px-0.5 text-esi-accent"
              style={{ left: `calc(100% * ${i + 1} / ${n})` }}
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </motion.span>
          ))}
          {processSteps.map((s) => (
            <RevealItem
              key={s.step}
              as="li"
              className="relative flex flex-col items-center px-2 text-center"
            >
              <div className="flex size-[72px] items-center justify-center rounded-full border-2 border-esi-blue bg-white text-esi-blue">
                <Icon name={s.icon} size={30} strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 text-[15px] font-bold tracking-wide text-esi-navy uppercase">
                {s.step}. {l(s.name)}
              </h3>
              <p className="mt-2 max-w-[24ch] text-sm leading-relaxed text-esi-muted">
                {l(s.description)}
              </p>
            </RevealItem>
          ))}
        </Reveal>

        {/* Mobile / tablet: vertical rail */}
        <Reveal as="ol" staggerChildren={0.1} className="relative lg:hidden">
          <div
            aria-hidden
            className="absolute top-7 bottom-7 left-[27px] border-l-2 border-dotted border-esi-border"
          />
          {processSteps.map((s) => (
            <RevealItem key={s.step} as="li" className="relative flex gap-5 pb-8 last:pb-0">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-esi-blue bg-white text-esi-blue">
                <Icon name={s.icon} size={24} strokeWidth={1.5} />
              </div>
              <div className="pt-2.5">
                <h3 className="text-[15px] font-bold tracking-wide text-esi-navy uppercase">
                  {s.step}. {l(s.name)}
                </h3>
                <p className="mt-1.5 max-w-[40ch] text-sm leading-relaxed text-esi-muted">
                  {l(s.description)}
                </p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  )
}
