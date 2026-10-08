import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { enter } from '@/lib/motion'

import { Breadcrumb, type Crumb } from './Breadcrumb'
import { Container } from './Container'
import { DiagonalLines } from './DiagonalLines'
import { NetworkGraphic } from './NetworkGraphic'

interface PageHeroProps {
  title: ReactNode
  lead?: ReactNode
  /** Industrial photo; the navy gradient overlay keeps text ≥ 4.5:1. */
  image: string
  imageAlt?: string
  breadcrumb: Crumb[]
  /** Project pages use a full-colour split image so the work itself stays visible. */
  imageMode?: 'background' | 'split'
  /** Extra content below the lead (chips, meta). */
  children?: ReactNode
}

/**
 * Inner-page hero (design-spec §3): photo + dark gradient + network graphic, bottom-aligned copy.
 * It animates on mount exactly like the Home hero — slow background zoom plus a staggered
 * fade-up of breadcrumb → title → lead — so every route change feels the same.
 */
export function PageHero({
  title,
  lead,
  image,
  imageAlt = '',
  breadcrumb,
  imageMode = 'background',
  children,
}: PageHeroProps) {
  const content = (
    <>
      <motion.div {...enter(0.05)}>
        <Breadcrumb items={breadcrumb} />
      </motion.div>
      <motion.h1
        className="mt-3 max-w-[22ch] display-title text-[clamp(2rem,3.2vw,2.75rem)] leading-tight"
        {...enter(0.12)}
      >
        {title}
      </motion.h1>
      {lead && (
        <motion.p className="mt-4 max-w-[60ch] text-base text-white/85 md:text-lg" {...enter(0.22)}>
          {lead}
        </motion.p>
      )}
      {children && <motion.div {...enter(0.3)}>{children}</motion.div>}
    </>
  )

  if (imageMode === 'split') {
    return (
      <section className="relative isolate overflow-hidden bg-esi-navy text-white">
        <div className="grid md:min-h-[420px] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative order-2 flex items-end overflow-hidden md:order-1">
            <NetworkGraphic
              seed={11}
              nodes={24}
              opacity={0.18}
              className="absolute inset-0 w-full"
            />
            <motion.div
              aria-hidden
              className="absolute top-6 right-6 hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              <DiagonalLines tone="light" />
            </motion.div>
            <div className="relative z-10 w-full px-5 py-10 md:py-12 md:pr-10 lg:px-8 lg:py-14 lg:pr-14 xl:pl-[calc((100vw-1280px)/2+2rem)]">
              {content}
            </div>
          </div>

          <div className="relative order-1 min-h-[260px] overflow-hidden md:order-2 md:min-h-[420px]">
            <motion.img
              src={image}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              width={1600}
              height={1067}
              initial={{ scale: 1 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: 18, ease: 'easeOut' }}
            />
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 hidden w-28 bg-gradient-to-r from-esi-navy/70 to-transparent md:block"
            />
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-esi-accent" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate flex min-h-[220px] items-end overflow-hidden bg-esi-navy text-white md:min-h-[300px]">
      {/* Slow one-off zoom, same gesture as the Home hero (MotionConfig drops it under reduced motion) */}
      <motion.img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        loading="eager"
        fetchPriority="high"
        width={1920}
        height={640}
        initial={{ scale: 1 }}
        animate={{ scale: 1.06 }}
        transition={{ duration: 18, ease: 'easeOut' }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-dark opacity-85" />
      <NetworkGraphic
        seed={11}
        nodes={28}
        opacity={0.25}
        className="absolute inset-y-0 right-0 -z-10 w-[60%]"
      />
      <motion.div
        aria-hidden
        className="absolute top-6 right-6 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.35 }}
      >
        <DiagonalLines tone="light" />
      </motion.div>

      <Container className="relative pt-24 pb-10 md:pt-28 md:pb-12">{content}</Container>
    </section>
  )
}
