import { motion } from 'motion/react'
import { Fragment } from 'react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { NetworkGraphic } from '@/components/ui/NetworkGraphic'
import { hero } from '@/data/home'
import { useT } from '@/i18n'
import { enter } from '@/lib/motion'

/**
 * Home hero (spec §14, design-spec §4.1): industrial photo with the navy gradient overlay,
 * faint network graphic, three-line display headline, two CTAs. Background zooms slowly once.
 */
export function HeroSection() {
  const { t, l } = useT()
  const lines = hero.headlineLines

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[480px] items-center overflow-hidden bg-esi-navy text-white md:min-h-[clamp(520px,72vh,720px)]"
    >
      {/* Background photo with a slow, one-off zoom (MotionConfig disables it under reduced motion) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-30"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 20, ease: 'easeOut' }}
      >
        <img
          src={hero.image}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-[70%_center]"
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-hero" />
      <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-hero-bottom" />
      <NetworkGraphic
        seed={3}
        nodes={36}
        opacity={0.35}
        className="absolute inset-y-0 right-0 -z-10 w-[55%]"
      />
      {/* Single thin diagonal at the top-left corner (angular cue, design-spec §4.1) */}
      <span
        aria-hidden
        className="absolute top-0 left-[6%] hidden h-24 w-px origin-top rotate-[24deg] bg-white/30 md:block"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-esi-accent/40" />

      <Container className="relative py-20 md:py-24">
        <div className="max-w-[640px]">
          <motion.h1
            id="hero-title"
            className="display-title text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.05]"
            {...enter(0.1)}
          >
            {lines.map((line, i) => (
              <Fragment key={line.en}>
                {l(line)}
                {i < lines.length - 1 && (
                  <>
                    <br className="hidden md:block" />{' '}
                  </>
                )}
              </Fragment>
            ))}
          </motion.h1>
          <motion.p className="mt-5 max-w-[34ch] text-lg text-white/90 md:text-xl" {...enter(0.25)}>
            {l(hero.subline)}
          </motion.p>
          <motion.div className="mt-8 flex flex-col gap-4 sm:flex-row" {...enter(0.4)}>
            <Button to={hero.primaryCta.to} className="w-full sm:w-auto">
              {t('cta.exploreSolutions')}
            </Button>
            <Button variant="outline-light" to={hero.secondaryCta.to} className="w-full sm:w-auto">
              {t('cta.viewProjects')}
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
