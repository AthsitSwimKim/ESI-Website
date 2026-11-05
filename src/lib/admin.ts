import { INDUSTRY_SLUGS, PROJECT_CATEGORIES, type Project } from '@/types'
import { isInlineDraftImage } from '@/lib/adminImages'

const stringFields = ['slug', 'title', 'client', 'location', 'image', 'description'] as const
const optionalStrings = ['titleTh', 'locationTh', 'descriptionTh', 'source'] as const
const listFields = ['scope', 'scopeTh', 'partners', 'partnersTh', 'gallery'] as const
const imagePath = /^\/images\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpe?g|svg|avif)$/

function isDraftImage(value: string): boolean {
  return (imagePath.test(value) && !value.includes('..')) || isInlineDraftImage(value)
}

export function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    Number.isSafeInteger(item.id) &&
    Number(item.id) > 0 &&
    stringFields.every((key) => typeof item[key] === 'string' && item[key].trim().length > 0) &&
    optionalStrings.every((key) => item[key] === undefined || typeof item[key] === 'string') &&
    listFields.every(
      (key) =>
        item[key] === undefined ||
        (Array.isArray(item[key]) &&
          item[key].every((entry: unknown) => typeof entry === 'string')),
    ) &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(item.slug)) &&
    isDraftImage(String(item.image)) &&
    (item.gallery === undefined || (item.gallery as string[]).every(isDraftImage)) &&
    INDUSTRY_SLUGS.includes(item.industry as Project['industry']) &&
    Array.isArray(item.categories) &&
    item.categories.length > 0 &&
    item.categories.every((category: unknown) =>
      PROJECT_CATEGORIES.includes(category as Project['categories'][number]),
    ) &&
    new Set(item.categories).size === item.categories.length &&
    (item.year === undefined ||
      (Number.isInteger(item.year) && Number(item.year) >= 1900 && Number(item.year) <= 2100)) &&
    (item.featured === undefined || typeof item.featured === 'boolean') &&
    (item.imageKind === undefined ||
      item.imageKind === 'photo' ||
      item.imageKind === 'illustration')
  )
}

/** Browser storage is untrusted; malformed drafts never reach the editor. */
export function parseProjectDrafts(raw: string): Project[] {
  const data: unknown = JSON.parse(raw)
  if (
    !Array.isArray(data) ||
    !data.every(isProject) ||
    new Set(data.map((project) => project.id)).size !== data.length ||
    new Set(data.map((project) => project.slug)).size !== data.length
  ) {
    throw new Error('Invalid project drafts')
  }
  return data
}

export function hasDuplicateSlug(project: Project, projects: Project[]): boolean {
  return projects.some((item) => item.id !== project.id && item.slug === project.slug)
}

export function downloadProjectDrafts(projects: Project[]): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'esi-projects.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
