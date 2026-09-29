import type { Variants } from 'motion/react'

/**
 * Shared motion variants (design-spec.md §6). Only transform + opacity are animated so the
 * layout never shifts; sections use <Reveal> rather than hand-rolling these.
 */
export const EASE_ESI = [0.22, 1, 0.36, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_ESI } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE_ESI } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_ESI } },
}

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

/**
 * Entrance animation for content that should animate as soon as the page mounts (heroes), as
 * opposed to <Reveal>, which waits for the element to scroll into view.
 * Spread onto a motion element: `<motion.h1 {...enter(0.12)}>`.
 */
export const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE_ESI },
})

/** Reveal once, when a quarter of the element is in view. */
export const viewportOnce = { once: true, amount: 0.25, margin: '-80px' } as const
