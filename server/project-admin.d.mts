import type { Plugin } from 'vite'
export class ProjectStoreError extends Error {
  code: string
  status: number
  constructor(code: string, status?: number)
}
export interface ProjectRecord {
  id: number
  slug: string
  image: string
  gallery?: string[]
  featured?: boolean
  [key: string]: unknown
}
export interface RepositorySnapshot<T> {
  revision: number
  nextId: number
  projects: T[]
  draftIds: number[]
  publishedIds: number[]
}
export function createProjectRepository<T extends { id: number; slug: string }>(options: {
  root: string
  references: T[]
  validateProject: (value: unknown) => boolean
}): {
  get(): Promise<RepositorySnapshot<T>>
  save(
    project: T,
    revision: number,
    publish?: boolean,
    isNew?: boolean,
  ): Promise<RepositorySnapshot<T> & { project: T }>
  remove(id: number, revision: number, unpublish?: boolean): Promise<RepositorySnapshot<T>>
  migrate(projects: T[], revision: number): Promise<RepositorySnapshot<T>>
}
export function projectAdminPlugin(): Plugin
