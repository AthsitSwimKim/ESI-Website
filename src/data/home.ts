import type { Localized } from '@/types'

/** Home hero (spec §14) — headline lines are split so the display type can break as in the mockup. */
export const hero = {
  headlineLines: [
    { en: 'ENGINEERING THE', th: 'เชื่อมต่อทุกระบบ' },
    { en: 'CONNECTION THAT', th: 'ให้ภาคอุตสาหกรรม' },
    { en: 'INDUSTRY RELIES ON.', th: 'ดำเนินงานอย่างมั่นใจ' },
  ] satisfies Localized[],
  subline: {
    en: 'Reliable Industrial Communication & System Integration Solutions.',
    th: 'โซลูชันระบบสื่อสารและการบูรณาการระบบอุตสาหกรรมที่เชื่อถือได้',
  } satisfies Localized,
  primaryCta: { labelKey: 'cta.exploreSolutions', to: '/solutions' },
  secondaryCta: { labelKey: 'cta.viewProjects', to: '/projects' },
  image: '/images/hero/esi-industrial-hero.webp',
}

/** Section headings on Home. Kept in English in both languages — part of the visual identity (D5). */
export const homeSections = {
  solutions: 'OUR SOLUTIONS',
  about: 'ABOUT ESI',
  industries: 'INDUSTRIES WE SERVE',
  projects: 'FEATURED PROJECTS',
  whyEsi: 'WHY PARTNER WITH ESI',
  process: 'OUR PROCESS',
  processSubtitle: {
    en: 'From concept to reliable operation.',
    th: 'ดูแลตั้งแต่แนวคิดจนถึงการใช้งานที่เชื่อถือได้',
  } satisfies Localized,
}

/** Call-to-action band shown above the footer (spec §33). */
export const ctaBand = {
  line1: {
    en: 'HAVE AN INDUSTRIAL SYSTEM CHALLENGE?',
    th: 'มีโจทย์ด้านระบบอุตสาหกรรมที่ต้องการคำตอบ?',
  } satisfies Localized,
  line2: {
    en: "LET'S ENGINEER THE RIGHT SOLUTION TOGETHER.",
    th: 'ร่วมออกแบบโซลูชันที่เหมาะกับหน้างานของคุณ',
  } satisfies Localized,
  button: { labelKey: 'cta.contact', to: '/contact' },
}

/** Home "About ESI" image (spec §22: engineer / control room / industrial plant). */
export const aboutImage = '/images/about/esi-engineer-control-room.webp'
