import type { Service } from '@/types'

/**
 * Solutions / services (spec §15–21). Names, slugs and feature lists are from the spec.
 * Taglines, descriptions and industry links are DRAFT – ESI to approve (content.md §4).
 */
export const services: Service[] = [
  {
    slug: 'industrial-network',
    name: { en: 'Industrial Network', th: 'ระบบเครือข่ายอุตสาหกรรม' },
    tagline: {
      en: 'Resilient plant-wide connectivity, engineered for uptime.',
      th: 'โครงข่ายที่มั่นคงสำหรับการเชื่อมต่อทั่วทั้งโรงงาน',
    },
    description: {
      en: 'We design and deliver industrial network infrastructure — from fibre backbones and industrial Ethernet to redundant switching and monitoring — so control, safety and business systems stay connected across the whole site.',
      th: 'เราออกแบบและติดตั้งโครงสร้างพื้นฐานเครือข่ายอุตสาหกรรม ตั้งแต่โครงข่ายใยแก้วนำแสง Industrial Ethernet ระบบสวิตช์สำรอง ไปจนถึงการตรวจสอบเครือข่าย เพื่อให้ระบบควบคุม ความปลอดภัย และระบบธุรกิจเชื่อมต่อกันได้ทั่วทั้งพื้นที่',
    },
    icon: 'Network',
    features: [
      { en: 'Network Infrastructure', th: 'โครงสร้างพื้นฐานเครือข่าย' },
      { en: 'Industrial Ethernet', th: 'Industrial Ethernet' },
      { en: 'Fiber Optic Network', th: 'เครือข่ายใยแก้วนำแสง' },
      { en: 'LAN / WAN', th: 'ระบบ LAN / WAN' },
      { en: 'Network Switching', th: 'ระบบสวิตช์เครือข่าย' },
      { en: 'Network Redundancy', th: 'ระบบเครือข่ายสำรอง' },
      { en: 'Industrial Communication', th: 'การสื่อสารภาคอุตสาหกรรม' },
      { en: 'Network Monitoring', th: 'การตรวจสอบเครือข่าย' },
      { en: 'Network Integration', th: 'การบูรณาการเครือข่าย' },
    ],
    image: '/images/projects/long-son-petrochemical-network.webp',
    category: 'network',
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
  {
    slug: 'cctv-security',
    name: { en: 'CCTV & Security', th: 'กล้องวงจรปิดและระบบรักษาความปลอดภัย' },
    tagline: {
      en: 'Surveillance built for hazardous and mission-critical areas.',
      th: 'ระบบเฝ้าระวังสำหรับพื้นที่อันตรายและพื้นที่สำคัญต่อการดำเนินงาน',
    },
    description: {
      en: 'Industrial and IP CCTV systems, including explosion-proof cameras for hazardous areas, integrated with video management and remote monitoring — designed, installed and maintained by our engineers.',
      th: 'ออกแบบ ติดตั้ง และบำรุงรักษาระบบกล้องวงจรปิดอุตสาหกรรมและ IP CCTV รวมถึงกล้องชนิดป้องกันการระเบิดสำหรับพื้นที่อันตราย พร้อมระบบบริหารวิดีโอและการตรวจสอบจากระยะไกล',
    },
    icon: 'Cctv',
    features: [
      { en: 'Industrial CCTV', th: 'กล้องวงจรปิดอุตสาหกรรม' },
      { en: 'IP CCTV', th: 'ระบบ IP CCTV' },
      { en: 'Explosion-Proof CCTV', th: 'กล้องวงจรปิดชนิดป้องกันการระเบิด' },
      { en: 'Hazardous Area CCTV', th: 'กล้องวงจรปิดสำหรับพื้นที่อันตราย' },
      { en: 'Video Management System', th: 'ระบบบริหารจัดการวิดีโอ' },
      { en: 'Remote Monitoring', th: 'การตรวจสอบจากระยะไกล' },
      { en: 'CCTV Installation', th: 'ติดตั้งระบบกล้องวงจรปิด' },
      { en: 'CCTV Maintenance', th: 'บำรุงรักษาระบบกล้องวงจรปิด' },
    ],
    image: '/images/projects/map-ta-phut-tank-terminal-cctv.webp',
    category: 'cctv',
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
  {
    slug: 'access-control',
    name: { en: 'Access Control', th: 'ระบบควบคุมการเข้าออก' },
    tagline: {
      en: 'Secure, auditable access for plants and facilities.',
      th: 'ควบคุมสิทธิ์เข้าออกพื้นที่อย่างปลอดภัยและตรวจสอบย้อนหลังได้',
    },
    description: {
      en: 'Door access, RFID and card systems, biometrics and visitor management — integrated into one platform that fits industrial operations and security policies.',
      th: 'ระบบควบคุมประตู RFID บัตรผ่าน ไบโอเมตริก และการจัดการผู้มาติดต่อ เชื่อมรวมอยู่บนแพลตฟอร์มที่สอดคล้องกับขั้นตอนปฏิบัติงานและนโยบายความปลอดภัยของโรงงาน',
    },
    icon: 'DoorClosed',
    features: [
      { en: 'Door Access Control', th: 'ระบบควบคุมประตู' },
      { en: 'RFID', th: 'ระบบ RFID' },
      { en: 'Card Access', th: 'ระบบบัตรผ่าน' },
      { en: 'Biometric', th: 'ระบบไบโอเมตริก' },
      { en: 'Visitor Access', th: 'ระบบจัดการผู้มาติดต่อ' },
      { en: 'Industrial Access Control', th: 'ระบบควบคุมการเข้าออกสำหรับโรงงาน' },
      { en: 'Access Control Integration', th: 'การบูรณาการระบบควบคุมการเข้าออก' },
    ],
    image: '/images/projects/senior-aerospace-access-control.webp',
    category: 'access-control',
    industries: ['petrochemical', 'manufacturing', 'industrial-infrastructure'],
  },
  {
    slug: 'communication',
    name: { en: 'Communication System', th: 'ระบบสื่อสาร' },
    tagline: {
      en: 'Clear, dependable communication across the site.',
      th: 'การสื่อสารที่ชัดเจนและเชื่อถือได้ทั่วทั้งพื้นที่',
    },
    description: {
      en: 'IP telephony, PABX, industrial telephones, intercom and PA systems — with the infrastructure and integration to keep operations, safety and emergency communication reliable.',
      th: 'ระบบโทรศัพท์ IP, PABX, โทรศัพท์อุตสาหกรรม Intercom และระบบประกาศ พร้อมโครงสร้างพื้นฐานและการเชื่อมต่อที่ช่วยให้การสื่อสารในการปฏิบัติงาน ความปลอดภัย และเหตุฉุกเฉินเป็นไปอย่างต่อเนื่อง',
    },
    icon: 'RadioTower',
    features: [
      { en: 'IP Telephone', th: 'ระบบโทรศัพท์ IP' },
      { en: 'PABX', th: 'ระบบ PABX' },
      { en: 'Industrial Telephone', th: 'โทรศัพท์อุตสาหกรรม' },
      { en: 'Intercom', th: 'ระบบ Intercom' },
      { en: 'Communication Infrastructure', th: 'โครงสร้างพื้นฐานระบบสื่อสาร' },
      { en: 'PA System', th: 'ระบบประกาศเสียง' },
      { en: 'Communication Integration', th: 'การบูรณาการระบบสื่อสาร' },
    ],
    image: '/images/projects/mocd2-map-ta-phut-olefins-network-telephone.webp',
    category: 'communication',
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
  {
    slug: 'cybersecurity',
    name: { en: 'Cybersecurity', th: 'ความปลอดภัยไซเบอร์' },
    tagline: {
      en: 'Protecting industrial networks and remote access.',
      th: 'ปกป้องเครือข่ายอุตสาหกรรมและการเข้าถึงจากระยะไกล',
    },
    description: {
      en: 'Firewalls, VPN and site-to-site connectivity, secure remote access and industrial network security — implemented with the operational constraints of plant environments in mind.',
      th: 'ติดตั้ง Firewall, VPN, การเชื่อมต่อ Site-to-Site และระบบ Remote Access ที่ปลอดภัย โดยออกแบบให้สอดคล้องกับข้อจำกัดและความต่อเนื่องของการปฏิบัติงานในโรงงาน',
    },
    icon: 'ShieldCheck',
    features: [
      { en: 'Firewall', th: 'ระบบ Firewall' },
      { en: 'VPN', th: 'ระบบ VPN' },
      { en: 'Site-to-Site VPN', th: 'การเชื่อมต่อ Site-to-Site VPN' },
      { en: 'Network Security', th: 'ความปลอดภัยเครือข่าย' },
      { en: 'Remote Access', th: 'การเข้าถึงจากระยะไกล' },
      { en: 'Industrial Network Security', th: 'ความปลอดภัยเครือข่ายอุตสาหกรรม' },
      { en: 'Security Integration', th: 'การบูรณาการระบบความปลอดภัย' },
    ],
    image: '/images/projects/d-enterprise-firewall-vpn.webp',
    category: 'cybersecurity',
    industries: ['petrochemical', 'manufacturing', 'power-energy'],
  },
  {
    slug: 'maintenance',
    name: { en: 'Maintenance & Support', th: 'บำรุงรักษาและสนับสนุน' },
    tagline: {
      en: 'Keeping your systems reliable for the long run.',
      th: 'ดูแลให้ระบบพร้อมใช้งานและเชื่อถือได้ในระยะยาว',
    },
    description: {
      en: 'Preventive and corrective maintenance, MA contracts, inspections, troubleshooting, training and technical support — so the systems we integrate keep performing years after commissioning.',
      th: 'ให้บริการบำรุงรักษาเชิงป้องกันและแก้ไข สัญญา MA การตรวจสอบระบบ แก้ไขปัญหา ฝึกอบรม และสนับสนุนด้านเทคนิค เพื่อให้ระบบทำงานได้อย่างต่อเนื่องหลังการส่งมอบ',
    },
    icon: 'Wrench',
    features: [
      { en: 'Preventive Maintenance', th: 'บำรุงรักษาเชิงป้องกัน' },
      { en: 'Corrective Maintenance', th: 'บำรุงรักษาเชิงแก้ไข' },
      { en: 'MA Contract', th: 'สัญญาบำรุงรักษา MA' },
      { en: 'System Inspection', th: 'ตรวจสอบระบบ' },
      { en: 'Troubleshooting', th: 'วิเคราะห์และแก้ไขปัญหา' },
      { en: 'System Support', th: 'สนับสนุนการใช้งานระบบ' },
      { en: 'Training', th: 'ฝึกอบรมผู้ใช้งาน' },
      { en: 'Technical Support', th: 'สนับสนุนด้านเทคนิค' },
    ],
    image: '/images/projects/gc-glycol-ea-plant-cctv-maintenance.webp',
    category: 'maintenance',
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
]

export const solutionsIntro = {
  en: 'ESI covers six solution areas that most industrial sites need together: the network that carries everything, the surveillance and access systems that protect it, the communication people rely on, the security that keeps it isolated from threats, and the maintenance that keeps it running. We design, supply, install, commission and support each of them — so one partner is accountable from the first drawing to the next service visit.',
  th: 'ESI ให้บริการ 6 กลุ่มโซลูชันที่เชื่อมโยงกันในพื้นที่อุตสาหกรรม ได้แก่ ระบบเครือข่าย กล้องวงจรปิด ระบบควบคุมการเข้าออก ระบบสื่อสาร ความปลอดภัยไซเบอร์ และการบำรุงรักษา เราดูแลตั้งแต่ออกแบบ จัดหา ติดตั้ง ทดสอบ ไปจนถึงสนับสนุนหลังส่งมอบ เพื่อให้ลูกค้ามีผู้รับผิดชอบงานเพียงรายเดียวตลอดโครงการ',
}

export function getServiceBySlug(slug: string | undefined): Service | undefined {
  return services.find((s) => s.slug === slug)
}

export function getServiceByCategory(category: Service['category']): Service | undefined {
  return services.find((s) => s.category === category)
}

/** Previous / next solution for the detail-page footer navigation (wraps around). */
export function getAdjacentServices(slug: string): { prev: Service; next: Service } {
  const i = Math.max(
    0,
    services.findIndex((s) => s.slug === slug),
  )
  const n = services.length
  return { prev: services[(i - 1 + n) % n]!, next: services[(i + 1) % n]! }
}
