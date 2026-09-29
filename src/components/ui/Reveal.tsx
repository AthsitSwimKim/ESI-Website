import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

import { EASE_ESI, fadeIn, fadeUp, stagger, viewportOnce } from '@/lib/motion'

type Tag = 'div' | 'section' | 'article' | 'ul' | 'ol' | 'li' | 'span'

const tags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  span: motion.span,
} as const

interface RevealProps {
  children: ReactNode
  as?: Tag
  className?: string
  variants?: Variants
  /** Stagger direct <RevealItem> children by this many seconds (e.g. 0.08). */
  staggerChildren?: number
  delay?: number
  id?: string
  'aria-labelledby'?: string
}

/**
 * Viewport-once reveal (design-spec §6). Wraps a block so it fades/slides in the first time
 * 25% of it scrolls into view. Under reduced motion only opacity animates.
 */
export function Reveal({
  children,
  as = 'div',
  className,
  variants,
  staggerChildren,
  delay = 0,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion()
  const MotionTag = tags[as]
  const base = variants ?? (reduce ? fadeIn : fadeUp)
  // `delay` works with or without stagger: offset this block's own reveal.
  const delayed: Variants = {
    ...base,
    show: {
      ...(base.show as Record<string, unknown>),
      transition: { duration: 0.6, ease: EASE_ESI, delay },
    },
  }
  const resolved: Variants = staggerChildren
    ? stagger(staggerChildren, delay)
    : delay
      ? delayed
      : base

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={resolved}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Child of a staggered <Reveal>: inherits the parent's hidden/show timing. */
export function RevealItem({
  children,
  as = 'div',
  className,
  variants,
}: {
  children: ReactNode
  as?: Tag
  className?: string
  variants?: Variants
}) {
  const reduce = useReducedMotion()
  const MotionTag = tags[as]
  return (
    <MotionTag className={className} variants={variants ?? (reduce ? fadeIn : fadeUp)}>
      {children}
    </MotionTag>
  )
}
