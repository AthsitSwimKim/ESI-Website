import type { Feature, Localized } from '@/types'

/**
 * Image beside "Company Introduction" on /about. Until ESI supplies a real control-room photo
 * this is a brand panel (navy gradient + network graphic + the ESI mark) rather than a generic
 * placeholder, so the section looks finished.
 */
export const aboutIntroImage = '/images/about/esi-engineer-control-room.webp'

/** Home "About ESI" feature grid (spec §22) — copy from the mockup. */
export const aboutFeatures: Feature[] = [
  {
    title: { en: 'Reliability You Can Trust', th: 'ความน่าเชื่อถือที่ไว้วางใจได้' },
    description: {
      en: 'Robust solutions engineered for dependable day-to-day operation.',
      th: 'ออกแบบระบบให้แข็งแรงและพร้อมรองรับการใช้งานประจำวันอย่างต่อเนื่อง',
    },
    icon: 'Award',
  },
  {
    title: { en: 'Engineering Expertise', th: 'ความเชี่ยวชาญด้านวิศวกรรม' },
    description: {
      en: 'Experienced engineers with deep domain knowledge and practical site experience.',
      th: 'ทีมวิศวกรที่เข้าใจเทคโนโลยีและมีประสบการณ์จากการทำงานในพื้นที่อุตสาหกรรมจริง',
    },
    icon: 'HardHat',
  },
  {
    title: { en: 'End-to-End Integration', th: 'บริการครบวงจร' },
    description: {
      en: 'From design and supply to installation and commissioning.',
      th: 'ดูแลตั้งแต่ออกแบบและจัดหา ไปจนถึงติดตั้งและทดสอบระบบ',
    },
    icon: 'Workflow',
  },
  {
    title: { en: 'Lifecycle Support', th: 'ดูแลตลอดอายุการใช้งาน' },
    description: {
      en: 'Ongoing maintenance and technical support throughout the system lifecycle.',
      th: 'บริการบำรุงรักษาและสนับสนุนด้านเทคนิคตลอดอายุการใช้งานของระบบ',
    },
    icon: 'Headset',
  },
]

/** "Why partner with ESI" (spec §31). Item names from the spec; descriptions DRAFT – ESI to approve. */
export const whyEsi: Feature[] = [
  {
    title: { en: 'Industrial Experience', th: 'ประสบการณ์ในภาคอุตสาหกรรม' },
    description: {
      en: 'Proven track record in oil & gas, petrochemical, power and manufacturing environments.',
      th: 'มีผลงานอ้างอิงในอุตสาหกรรมน้ำมันและก๊าซ ปิโตรเคมี พลังงาน และการผลิต',
    },
    icon: 'Factory',
  },
  {
    title: { en: 'Engineering Expertise', th: 'ความเชี่ยวชาญด้านวิศวกรรม' },
    description: {
      en: 'Experienced engineers who design to standards and understand plant operations.',
      th: 'ทีมวิศวกรที่ออกแบบตามมาตรฐานและเข้าใจข้อจำกัดของการปฏิบัติงานในโรงงาน',
    },
    icon: 'HardHat',
  },
  {
    title: { en: 'Reliable Solutions', th: 'โซลูชันที่เชื่อถือได้' },
    description: {
      en: 'Systems specified and built for uptime in demanding, hazardous conditions.',
      th: 'คัดเลือกและออกแบบระบบให้เหมาะกับสภาพแวดล้อมอุตสาหกรรมที่มีข้อกำหนดสูง',
    },
    icon: 'ShieldCheck',
  },
  {
    title: { en: 'End-to-End Integration', th: 'บูรณาการระบบครบวงจร' },
    description: {
      en: 'One partner from consultation and engineering to installation and commissioning.',
      th: 'มีผู้รับผิดชอบรายเดียวตั้งแต่ให้คำปรึกษา ออกแบบ ติดตั้ง จนถึงทดสอบส่งมอบ',
    },
    icon: 'Workflow',
  },
  {
    title: { en: 'Long-Term Support', th: 'ดูแลระยะยาว' },
    description: {
      en: 'Maintenance contracts and technical support for the full system lifecycle.',
      th: 'รองรับสัญญาบำรุงรักษาและการสนับสนุนด้านเทคนิคตลอดอายุระบบ',
    },
    icon: 'LifeBuoy',
  },
  {
    title: { en: 'Professional Service', th: 'บริการอย่างมืออาชีพ' },
    description: {
      en: 'Clear communication, documentation and delivery you can plan around.',
      th: 'สื่อสารชัดเจน จัดทำเอกสารเป็นระบบ และส่งมอบงานตามแผนที่ตรวจสอบได้',
    },
    icon: 'BadgeCheck',
  },
]

/** About page long-form copy (spec §23). All DRAFT – ESI to approve (content.md §7). */
export const aboutPage: {
  introduction: Localized
  overview: Localized
  mission: Localized
  vision: Localized
  coreValues: Feature[]
} = {
  introduction: {
    en: 'Engineering System Integration Co., Ltd. (ESI) is a Rayong-based system integrator specialising in communication systems for oil & gas and industrial operations. We combine practical engineering with accountable delivery for sites where dependable connectivity matters.',
    th: 'บริษัท เอ็นจิเนียริ่ง ซิสเต็ม อินทีเกรชั่น จำกัด (ESI) เป็นผู้ให้บริการด้านการบูรณาการระบบจากจังหวัดระยอง เชี่ยวชาญระบบสื่อสารสำหรับอุตสาหกรรมน้ำมันและก๊าซ รวมถึงโรงงานอุตสาหกรรมที่ต้องการการเชื่อมต่อที่มั่นคงและเชื่อถือได้',
  },
  overview: {
    en: 'Our work covers consultation, engineering design and management, system supply, commissioning and setup, documentation, maintenance contracts and training. ESI supports networks, CCTV, access control, communication and security as one integrated scope.',
    th: 'ขอบเขตงานของเราครอบคลุมการให้คำปรึกษา ออกแบบและบริหารงานวิศวกรรม จัดหาอุปกรณ์ ติดตั้ง ทดสอบและตั้งค่าระบบ จัดทำเอกสาร ตลอดจนสัญญาบำรุงรักษาและการฝึกอบรม โดยรวมระบบเครือข่าย กล้องวงจรปิด ระบบควบคุมการเข้าออก ระบบสื่อสาร และความปลอดภัยไว้ภายใต้การดูแลเดียวกัน',
  },
  mission: {
    en: 'To deliver industrial communication and system integration solutions that keep our customers’ operations connected, secure and reliable.',
    th: 'ส่งมอบโซลูชันระบบสื่อสารและการบูรณาการระบบอุตสาหกรรมที่ช่วยให้การดำเนินงานของลูกค้าเชื่อมต่อได้อย่างมั่นคง ปลอดภัย และเชื่อถือได้',
  },
  vision: {
    en: 'To be the trusted system integration partner for industry in Thailand and the region.',
    th: 'เป็นพันธมิตรด้านการบูรณาการระบบที่ภาคอุตสาหกรรมในประเทศไทยและภูมิภาคไว้วางใจ',
  },
  coreValues: [
    {
      title: { en: 'Reliability', th: 'ความน่าเชื่อถือ' },
      description: {
        en: 'Systems our customers can depend on, every day.',
        th: 'ระบบที่ลูกค้าวางใจได้ในทุกวันของการใช้งาน',
      },
      icon: 'ShieldCheck',
    },
    {
      title: { en: 'Engineering Excellence', th: 'มาตรฐานงานวิศวกรรม' },
      description: {
        en: 'Designed to standards, built with precision.',
        th: 'ออกแบบตามมาตรฐานและดำเนินงานด้วยความละเอียดรอบคอบ',
      },
      icon: 'DraftingCompass',
    },
    {
      title: { en: 'Safety', th: 'ความปลอดภัย' },
      description: {
        en: 'Safe work and safe systems in every environment.',
        th: 'ให้ความสำคัญกับความปลอดภัยของผู้ปฏิบัติงานและระบบในทุกพื้นที่',
      },
      icon: 'HardHat',
    },
    {
      title: { en: 'Integrity', th: 'ความซื่อตรง' },
      description: {
        en: 'Straightforward advice and honest delivery.',
        th: 'ให้คำแนะนำอย่างตรงไปตรงมาและรับผิดชอบต่อการส่งมอบ',
      },
      icon: 'Handshake',
    },
    {
      title: { en: 'Long-Term Partnership', th: 'พันธมิตรระยะยาว' },
      description: {
        en: 'Support that lasts the lifetime of the system.',
        th: 'พร้อมดูแลและสนับสนุนตลอดอายุการใช้งานของระบบ',
      },
      icon: 'LifeBuoy',
    },
  ],
}
