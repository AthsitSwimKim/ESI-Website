import type { PageHeroContent } from '@/types'

/** Inner-page heroes (design-spec §3 PageHero). Leads marked DRAFT – ESI to approve. */
export const pageHeroes: Record<
  'about' | 'solutions' | 'industries' | 'projects' | 'contact',
  PageHeroContent
> = {
  about: {
    title: { en: 'About ESI', th: 'เกี่ยวกับ ESI' },
    lead: {
      en: 'Engineering and system integration for industry where reliability is non-negotiable.',
      th: 'งานวิศวกรรมและการบูรณาการระบบสำหรับภาคอุตสาหกรรมที่ต้องการความเชื่อถือได้',
    }, // DRAFT
    image: '/images/about/esi-engineer-control-room.webp',
  },
  solutions: {
    title: { en: 'Solutions', th: 'โซลูชัน' },
    lead: {
      en: 'From network backbone to lifecycle support, ESI delivers the systems that keep industrial operations connected, secure and running.',
      th: 'ตั้งแต่โครงข่ายหลักไปจนถึงการดูแลระยะยาว ESI ส่งมอบระบบที่ช่วยให้การดำเนินงานเชื่อมต่อ ปลอดภัย และต่อเนื่อง',
    }, // DRAFT
    image: '/images/hero/esi-industrial-hero.webp',
  },
  industries: {
    title: { en: 'Industries We Serve', th: 'อุตสาหกรรมที่เราให้บริการ' },
    lead: {
      en: 'Proven in oil & gas, petrochemical, power, manufacturing and industrial infrastructure.',
      th: 'รองรับอุตสาหกรรมน้ำมันและก๊าซ ปิโตรเคมี พลังงาน การผลิต และโครงสร้างพื้นฐานอุตสาหกรรม',
    }, // DRAFT
    image: '/images/industries/petrochemical.webp',
  },
  projects: {
    title: { en: 'Projects', th: 'ผลงาน' },
    lead: {
      en: 'Selected references from the industrial sites we have connected, secured and supported.',
      th: 'ผลงานอ้างอิงด้านระบบเครือข่าย การสื่อสาร ความปลอดภัย และการบำรุงรักษาจากหลากหลายอุตสาหกรรม',
    }, // DRAFT
    image: '/images/industries/industrial-infrastructure.webp',
  },
  contact: {
    title: { en: 'Contact', th: 'ติดต่อเรา' },
    lead: {
      en: 'Talk to our engineers about your site, system or maintenance requirements.',
      th: 'พูดคุยกับทีม ESI เกี่ยวกับความต้องการด้านระบบ หน้างาน หรือการบำรุงรักษาของคุณ',
    }, // DRAFT
    image: '/images/hero/esi-industrial-hero.webp',
  },
}

/** 404 page copy (spec §49). */
export const notFound = {
  eyebrow: { en: '404 – PAGE NOT FOUND', th: '404 – ไม่พบหน้าที่ต้องการ' },
  title: {
    en: 'The page you are looking for may have been moved or no longer exists.',
    th: 'หน้าที่คุณกำลังค้นหาอาจถูกย้ายหรือไม่มีอยู่แล้ว',
  },
  button: { labelKey: 'cta.backHome', to: '/' },
}
