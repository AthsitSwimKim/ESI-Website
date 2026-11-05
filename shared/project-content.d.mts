export interface ProjectContent<T> {
  version: number
  revision: number
  records: T[]
  removedIds: number[]
}
export function applyProjectContent<T extends { id: number }>(
  references: readonly T[],
  content: { records: readonly T[]; removedIds: readonly number[] },
): T[]
