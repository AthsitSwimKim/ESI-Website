import { adminStorageKey } from '@/data/admin'
import { parseProjectDrafts } from '@/lib/admin'
import { storage } from '@/lib/utils'
import type { Project } from '@/types'

export interface ProjectWorkspace {
  revision: number
  nextId: number
  projects: Project[]
  draftIds: number[]
  publishedIds: number[]
}

export class ProjectApiError extends Error {
  readonly code: string
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

async function request<T>(path = '', body?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api/admin/projects${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-ESI-Admin': '1' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new ProjectApiError('BACKEND_UNAVAILABLE')
  }
  if (!response.headers.get('content-type')?.includes('application/json'))
    throw new ProjectApiError('BACKEND_UNAVAILABLE')
  const result = await response.json()
  if (!response.ok)
    throw new ProjectApiError(typeof result.error === 'string' ? result.error : 'SAVE_FAILED')
  return result as T
}

export const projectApi = {
  get: () => request<ProjectWorkspace>(),
  async load(): Promise<ProjectWorkspace> {
    const workspace = await request<ProjectWorkspace>()
    const legacy = storage.get(adminStorageKey)
    if (!legacy) return workspace
    let projects: Project[]
    try {
      projects = parseProjectDrafts(legacy)
    } catch {
      return workspace
    }
    try {
      return await request<ProjectWorkspace>('/migrate', { projects, revision: workspace.revision })
    } catch (error) {
      if (error instanceof ProjectApiError && error.code === 'CONFLICT')
        return request<ProjectWorkspace>()
      throw error
    }
  },
  save: (project: Project, revision: number, isNew: boolean, publish = false) =>
    request<ProjectWorkspace & { project: Project }>(publish ? '/publish' : '/save', {
      project,
      revision,
      isNew,
    }),
  remove: (id: number, revision: number, unpublish = false) =>
    request<ProjectWorkspace>(unpublish ? '/unpublish' : '/remove', { id, revision }),
}

export function projectApiMessage(
  error: unknown,
):
  | 'backendUnavailable'
  | 'conflict'
  | 'duplicate'
  | 'invalid'
  | 'featuredLimit'
  | 'imageMissing'
  | 'saveError' {
  if (!(error instanceof ProjectApiError)) return 'saveError'
  if (error.code === 'BACKEND_UNAVAILABLE' || error.code === 'LOCAL_ONLY')
    return 'backendUnavailable'
  if (error.code === 'CONFLICT') return 'conflict'
  if (error.code === 'DUPLICATE_SLUG') return 'duplicate'
  if (error.code === 'INVALID_PROJECT') return 'invalid'
  if (error.code === 'FEATURED_LIMIT') return 'featuredLimit'
  if (error.code === 'INVALID_IMAGE' || error.code === 'IMAGE_NOT_FOUND') return 'imageMissing'
  return 'saveError'
}
