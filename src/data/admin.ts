import type { Project } from '@/types'

export const adminStorageKey = 'esi-admin-projects-v1'
export const adminPreviewKey = 'esi-admin-preview-enabled'

export const adminImageLimits = {
  fileBytes: 10 * 1024 * 1024,
  maxSide: 1600,
  encodedBytes: 600 * 1024,
  galleryCount: 10,
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const

export const adminTextFields = [
  { key: 'title', label: 'titleField', required: true },
  { key: 'titleTh', label: 'titleTh' },
  { key: 'client', label: 'client', required: true },
  { key: 'slug', label: 'slug', required: true },
  { key: 'location', label: 'location', required: true },
  { key: 'locationTh', label: 'locationTh' },
] as const

export const adminLongFields = [
  { key: 'description', label: 'description', required: true },
  { key: 'descriptionTh', label: 'descriptionTh' },
] as const

export const adminListFields = [
  { key: 'scope', label: 'scope' },
  { key: 'scopeTh', label: 'scopeTh' },
] as const

export function createProjectDraft(existing: Project[]): Project {
  return {
    id: Math.max(0, ...existing.map((project) => project.id)) + 1,
    slug: '',
    title: '',
    client: '',
    categories: [],
    industry: 'industrial-infrastructure',
    location: '',
    image: '',
    description: '',
    imageKind: 'photo',
  }
}
