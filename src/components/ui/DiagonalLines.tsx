import { cn } from '@/lib/utils'

interface DiagonalLinesProps {
  /** Number of parallel lines (3–4 in the mockup). */
  count?: number
  /** Height of the decoration in px; width is 1.5× the height. */
  size?: number
  tone?: 'blue' | 'light'
  className?: string
}

/**
 * Brand corner decoration: parallel 45° "/" lines echoing the logo's slant (design-spec §2).
 * Position it absolutely at a section corner; it is purely decorative.
 */
export function DiagonalLines({
  count = 4,
  size = 72,
  tone = 'blue',
  className,
}: DiagonalLinesProps) {
  const spacing = 16
  const width = size + spacing * (count - 1)
  return (
    <svg
      aria-hidden
      focusable="false"
      width={width}
      height={size}
      viewBox={`0 0 ${width} ${size}`}
      className={cn(
        'pointer-events-none',
        tone === 'light' ? 'text-white/40' : 'text-esi-blue',
        className,
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <line
          key={i}
          x1={i * spacing}
          y1={size}
          x2={i * spacing + size}
          y2={0}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="square"
        />
      ))}
    </svg>
  )
}
