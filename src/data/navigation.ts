import type { NavItem } from '@/types'

import { services } from './services'

/**
 * Main navigation (spec §11). The Solutions sub-menu is DERIVED from services.ts so adding a
 * service (spec §51) updates the header dropdown, mobile accordion and footer automatically.
 * Labels are i18n keys resolved with t(); solution names come from the service data itself.
 */
export const mainNav: NavItem[] = [
  { labelKey: 'nav.home', to: '/' },
  { labelKey: 'nav.about', to: '/about' },
  {
    labelKey: 'nav.solutions',
    to: '/solutions',
    children: services.map((s) => ({ labelKey: `service:${s.slug}`, to: `/solutions/${s.slug}` })),
  },
  { labelKey: 'nav.industries', to: '/industries' },
  { labelKey: 'nav.projects', to: '/projects' },
  { labelKey: 'nav.contact', to: '/contact' },
]

/** Header / CTA button target. */
export const contactCta = { labelKey: 'cta.contact', to: '/contact' }

/**
 * Header (and mobile drawer) links — Contact is left out because the "Contact ESI" button
 * sits right beside the nav and would duplicate it (PLAN.md D19). Footer keeps the full list.
 */
export const headerNav: NavItem[] = mainNav.filter((item) => item.to !== contactCta.to)

/** Footer "Quick Links" = the main nav without children (includes Contact). */
export const footerQuickLinks: NavItem[] = mainNav.map(({ labelKey, to }) => ({ labelKey, to }))
