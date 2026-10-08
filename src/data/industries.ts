import type { Industry, IndustrySlug } from '@/types'

/**
 * Industries we serve (spec §24–25). Names and scope are from the spec;
 * descriptions are DRAFT – ESI to approve (content.md §5).
 */
export const industries: Industry[] = [
  {
    slug: 'oil-gas',
    name: { en: 'Oil & Gas', th: 'น้ำมันและก๊าซ' },
    description: {
      en: 'Communication and surveillance systems for terminals, tank farms and processing sites, including explosion-proof equipment for hazardous areas.',
      th: 'ระบบสื่อสารและเฝ้าระวังสำหรับคลังน้ำมัน พื้นที่จัดเก็บ และกระบวนการผลิต รวมถึงอุปกรณ์ชนิดป้องกันการระเบิดสำหรับพื้นที่อันตราย',
    }, // DRAFT – ESI to approve
    scope: [
      { en: 'Network', th: 'ระบบเครือข่าย' },
      { en: 'Communication', th: 'ระบบสื่อสาร' },
      { en: 'Explosion-Proof CCTV', th: 'กล้องวงจรปิดชนิดป้องกันการระเบิด' },
      { en: 'Security', th: 'ระบบรักษาความปลอดภัย' },
      { en: 'Maintenance', th: 'บำรุงรักษา' },
    ],
    icon: 'Droplet',
    image: '/images/industries/oil-gas.webp',
  },
  {
    slug: 'petrochemical',
    name: { en: 'Petrochemical', th: 'ปิโตรเคมี' },
    description: {
      en: 'Plant-wide network, security and communication systems integrated to the demanding standards of petrochemical complexes.',
      th: 'บูรณาการระบบเครือข่าย ความปลอดภัย และการสื่อสารทั่วทั้งโรงงาน ให้สอดคล้องกับข้อกำหนดของอุตสาหกรรมปิโตรเคมี',
    }, // DRAFT – ESI to approve
    scope: [
      { en: 'Industrial Network', th: 'เครือข่ายอุตสาหกรรม' },
      { en: 'CCTV', th: 'กล้องวงจรปิด' },
      { en: 'Access Control', th: 'ควบคุมการเข้าออก' },
      { en: 'Communication', th: 'ระบบสื่อสาร' },
      { en: 'Cybersecurity', th: 'ความปลอดภัยไซเบอร์' },
    ],
    icon: 'Hexagon',
    image: '/images/industries/petrochemical.webp',
  },
  {
    slug: 'power-energy',
    name: { en: 'Power & Energy', th: 'พลังงานและโรงไฟฟ้า' },
    description: {
      en: 'Reliable connectivity and monitoring for power plants and energy infrastructure where downtime is not an option.',
      th: 'ระบบเชื่อมต่อและเฝ้าระวังที่เชื่อถือได้สำหรับโรงไฟฟ้าและโครงสร้างพื้นฐานด้านพลังงาน ซึ่งต้องการความพร้อมใช้งานอย่างต่อเนื่อง',
    }, // DRAFT – ESI to approve
    scope: [
      { en: 'Network', th: 'ระบบเครือข่าย' },
      { en: 'Communication', th: 'ระบบสื่อสาร' },
      { en: 'CCTV', th: 'กล้องวงจรปิด' },
      { en: 'Security', th: 'ระบบรักษาความปลอดภัย' },
      { en: 'Maintenance', th: 'บำรุงรักษา' },
    ],
    icon: 'Zap',
    image: '/images/industries/power-energy.webp',
  },
  {
    slug: 'manufacturing',
    name: { en: 'Manufacturing', th: 'การผลิต' },
    description: {
      en: 'Secure factory networks, access control and surveillance that support safe, efficient production.',
      th: 'ระบบเครือข่ายโรงงาน ระบบควบคุมการเข้าออก และระบบเฝ้าระวังที่ช่วยสนับสนุนการผลิตให้ปลอดภัยและมีประสิทธิภาพ',
    }, // DRAFT – ESI to approve
    scope: [
      { en: 'Network', th: 'ระบบเครือข่าย' },
      { en: 'Access Control', th: 'ควบคุมการเข้าออก' },
      { en: 'CCTV', th: 'กล้องวงจรปิด' },
      { en: 'Cybersecurity', th: 'ความปลอดภัยไซเบอร์' },
    ],
    icon: 'Factory',
    image: '/images/industries/manufacturing.webp',
  },
  {
    slug: 'industrial-infrastructure',
    name: { en: 'Industrial Infrastructure', th: 'โครงสร้างพื้นฐานอุตสาหกรรม' },
    description: {
      en: 'Communication, networking and security systems for ports, utilities, industrial estates and large facilities.',
      th: 'ระบบสื่อสาร เครือข่าย และความปลอดภัยสำหรับท่าเรือ ระบบสาธารณูปโภค นิคมอุตสาหกรรม และอาคารขนาดใหญ่',
    }, // DRAFT – ESI to approve
    scope: [
      { en: 'Communication', th: 'ระบบสื่อสาร' },
      { en: 'Network', th: 'ระบบเครือข่าย' },
      { en: 'Security', th: 'ระบบรักษาความปลอดภัย' },
      { en: 'Monitoring', th: 'ระบบเฝ้าระวัง' },
    ],
    icon: 'Building2',
    image: '/images/industries/industrial-infrastructure.webp',
  },
]

export function getIndustry(slug: IndustrySlug): Industry {
  // Every IndustrySlug has an entry above; the non-null assertion is safe by construction.
  return industries.find((i) => i.slug === slug)!
}
