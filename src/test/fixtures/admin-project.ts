import type { Project } from '@/types'
import { createProjectDraft } from '@/data/admin'

/** Test-only fixture for isolated repository and browser checks. */
export function createTestProject(existing: Project[]): Project {
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
