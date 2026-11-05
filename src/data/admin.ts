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

/** Explicitly fictional example for reviewing the editor; never added to public site data. */
export function createExampleProject(existing: Project[]): Project {
  const draft = createProjectDraft(existing)
  return {
    ...draft,
    slug: `sample-factory-cctv-network-${draft.id}`,
    title: '[Sample] Factory CCTV & Network',
    titleTh: '[ตัวอย่าง] ระบบกล้องวงจรปิดและเครือข่ายโรงงาน',
    client: 'Example Factory (sample data)',
    location: 'Rayong, Thailand (sample)',
    locationTh: 'จ.ระยอง ประเทศไทย (ข้อมูลตัวอย่าง)',
    categories: ['cctv', 'network'],
    industry: 'manufacturing',
    year: 2026,
    image: '/images/projects/map-ta-phut-tank-terminal-cctv.webp',
    imageKind: 'illustration',
    description:
      'Sample project for reviewing the page layout only. This is not an ESI project reference. The images illustrate CCTV and network systems.',
    descriptionTh:
      'ผลงานตัวอย่างสำหรับทดลองกรอกข้อมูลและดูรูปแบบหน้าเว็บเท่านั้น ไม่ใช่ผลงานอ้างอิงจริงของ ESI รูปภาพใช้ประกอบตัวอย่างระบบกล้องวงจรปิดและเครือข่าย',
    scope: [
      'Install CCTV cameras and a video recorder (sample)',
      'Install a network cabinet and test connectivity (sample)',
    ],
    scopeTh: [
      'ติดตั้งกล้องวงจรปิดและเครื่องบันทึกภาพ (ตัวอย่าง)',
      'ติดตั้งตู้เครือข่ายและทดสอบการเชื่อมต่อ (ตัวอย่าง)',
    ],
    gallery: [
      '/images/projects/map-ta-phut-tank-terminal-cctv.webp',
      '/images/projects/long-son-petrochemical-network.webp',
    ],
  }
}
