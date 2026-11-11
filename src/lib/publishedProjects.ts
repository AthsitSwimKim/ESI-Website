import { projects } from '@/data/projects'
import { isProject } from '@/lib/admin'

/** Load Hosting publications before React Router resolves a project detail route. */
export async function refreshPublishedProjects(): Promise<void> {
  if (import.meta.env.MODE !== 'chaiyo') return
  const response = await fetch('/api/projects', {
    cache: 'no-store',
    credentials: 'omit',
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json'))
    throw new Error('Published projects unavailable')
  const data: unknown = await response.json()
  const list = (data as { projects?: unknown })?.projects
  if (
    !Array.isArray(list) ||
    !list.every(isProject) ||
    new Set(list.map((project) => project.id)).size !== list.length ||
    new Set(list.map((project) => project.slug)).size !== list.length
  )
    throw new Error('Invalid published projects')
  projects.splice(0, projects.length, ...list)
}
