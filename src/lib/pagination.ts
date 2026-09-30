/** Longest run of number buttons ever rendered — beyond this the middle collapses to '…'. */
const WINDOW = 5

/**
 * First page, last page, the current page with a neighbour either side, and '…' for the rest.
 * The window widens at the ends so the control keeps a constant width instead of shuffling
 * as you page through: [1 2 3 4 5 … 12] → [1 … 4 5 6 … 12] → [1 … 8 9 10 11 12].
 */
export function pageItems(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= WINDOW + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const start = Math.max(2, Math.min(page - 1, totalPages - WINDOW + 1))
  const end = Math.min(totalPages - 1, Math.max(page + 1, WINDOW))

  const items: (number | 'gap')[] = [1]
  if (start > 2) items.push('gap')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < totalPages - 1) items.push('gap')
  items.push(totalPages)
  return items
}

/** Clamp a `?page=` value that may be missing, non-numeric or out of range. */
export function clampPage(raw: string | null, totalPages: number): number {
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return 1
  return Math.min(n, Math.max(1, totalPages))
}
