import { industries } from '@/data/industries'
import { processSteps } from '@/data/process'
import { projects } from '@/data/projects'
import { services } from '@/data/services'
import type { Localized } from '@/types'

const years = projects.flatMap((project) => (project.year ? [project.year] : []))

export const trustEvidence: { value: string; label: Localized }[] = [
  {
    value: String(projects.length),
    label: { en: 'published project references', th: 'ผลงานอ้างอิงที่เผยแพร่' },
  },
  {
    value: String(services.length),
    label: { en: 'integrated solution areas', th: 'กลุ่มโซลูชันที่บูรณาการร่วมกัน' },
  },
  {
    value: String(industries.length),
    label: { en: 'industry groups served', th: 'กลุ่มอุตสาหกรรมที่ให้บริการ' },
  },
  {
    value: `${Math.min(...years)}–${Math.max(...years)}`,
    label: { en: 'documented reference period', th: 'ช่วงปีของผลงานที่มีข้อมูลอ้างอิง' },
  },
]

export const trustNote: Localized = {
  en: `Figures are derived from ESI's ${projects.length} published references, ${services.length} solution areas, ${industries.length} industry groups and ${processSteps.length}-stage delivery process.`,
  th: `ตัวเลขอ้างอิงจากผลงานที่ ESI เผยแพร่ ${projects.length} รายการ กลุ่มโซลูชัน ${services.length} ด้าน กลุ่มอุตสาหกรรม ${industries.length} กลุ่ม และกระบวนการส่งมอบ ${processSteps.length} ขั้นตอน`,
}
