import { useReducedMotion } from 'motion/react'
import { useMemo } from 'react'

import { cn } from '@/lib/utils'

interface NetworkGraphicProps {
  /** Number of nodes (25–40 reads as a constellation, not a mesh). */
  nodes?: number
  /** Overall opacity; the mockup uses ~.35 on the hero/CTA and ~.12 in the footer. */
  opacity?: number
  /** Different seeds give different constellations for different sections. */
  seed?: number
  /** Slow opacity pulse on the nodes (disabled automatically under reduced motion). */
  animated?: boolean
  className?: string
}

const VIEW_W = 800
const VIEW_H = 500

/** Deterministic PRNG so the graphic is identical on every render (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildGraph(count: number, seed: number) {
  const next = rng(seed)
  const pts = Array.from({ length: count }, () => ({
    x: 20 + next() * (VIEW_W - 40),
    y: 20 + next() * (VIEW_H - 40),
    r: 1.6 + next() * 1.6,
    delay: next() * 5,
  }))
  const edges = new Set<string>()
  pts.forEach((p, i) => {
    const nearest = pts
      .map((q, j) => ({ j, d: (q.x - p.x) ** 2 + (q.y - p.y) ** 2 }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
    nearest.forEach(({ j }) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`))
  })
  return {
    pts,
    edges: [...edges].map((k) => k.split('-').map(Number) as [number, number]),
  }
}

/**
 * "Connectivity" constellation used behind the hero, CTA band, dark sections and footer
 * (design-spec §2 element 6). Purely decorative: aria-hidden, never carries information.
 */
export function NetworkGraphic({
  nodes = 32,
  opacity = 0.35,
  seed = 7,
  animated = true,
  className,
}: NetworkGraphicProps) {
  const reduceMotion = useReducedMotion()
  const { pts, edges } = useMemo(() => buildGraph(nodes, seed), [nodes, seed])
  const pulse = animated && !reduceMotion

  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn('pointer-events-none text-esi-accent', className)}
      style={{ opacity }}
    >
      <g stroke="currentColor" strokeWidth={1} strokeOpacity={0.7}>
        {edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={pts[a]!.x} y1={pts[a]!.y} x2={pts[b]!.x} y2={pts[b]!.y} />
        ))}
      </g>
      <g fill="currentColor">
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            className={pulse ? 'esi-node-pulse' : undefined}
            style={pulse ? { animationDelay: `${p.delay}s` } : undefined}
          />
        ))}
      </g>
    </svg>
  )
}
