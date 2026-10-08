import type { Localized } from '@/types'

/** SEO defaults (spec §44). Per-page titles follow "<Page> | ESI"; Home uses the site title. */
export const seo = {
  siteTitle: {
    en: 'ESI | Industrial System Integration Thailand',
    th: 'ESI | ระบบสื่อสารและบูรณาการระบบอุตสาหกรรม',
  } satisfies Localized,
  siteDescription: {
    en: 'Engineering System Integration Co., Ltd. provides industrial communication, network, security and system integration solutions.',
    th: 'บริษัท เอ็นจิเนียริ่ง ซิสเต็ม อินทีเกรชั่น จำกัด ให้บริการระบบสื่อสาร เครือข่าย ความปลอดภัย และการบูรณาการระบบสำหรับภาคอุตสาหกรรม',
  } satisfies Localized,
  titleSuffix: ' | ESI',
  /** 1200×630 Open Graph image — generated in Phase 8. */
  ogImage: '/og-cover.jpg',
  locale: { en: 'en_US', th: 'th_TH' } satisfies Localized,
}

export function pageTitle(page: string): string {
  return `${page}${seo.titleSuffix}`
}
