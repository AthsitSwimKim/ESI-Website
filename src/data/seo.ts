/** SEO defaults (spec §44). Per-page titles follow "<Page> | ESI"; Home uses the site title. */
export const seo = {
  siteTitle: 'ESI | Industrial System Integration Thailand',
  siteDescription:
    'Engineering System Integration Co., Ltd. provides industrial communication, network, security and system integration solutions.',
  titleSuffix: ' | ESI',
  /** 1200×630 Open Graph image — generated in Phase 8. */
  ogImage: '/og-cover.jpg',
  locale: 'en_US',
}

export function pageTitle(page: string): string {
  return `${page}${seo.titleSuffix}`
}
