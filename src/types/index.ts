import type { IconName } from '@/data/icons'

export type { IconName }

/** Supported UI languages (header TH / EN switch, spec §11). */
export type Lang = 'en' | 'th'

/** Content field with an English source and an optional Thai translation (falls back to en). */
export type Localized = { en: string; th?: string }

/** Project filter categories (spec §27) — also the key that links a Solution to its Projects. */
export const PROJECT_CATEGORIES = [
  'network',
  'cctv',
  'access-control',
  'communication',
  'cybersecurity',
  'maintenance',
] as const
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

/** Industries served (spec §24). */
export const INDUSTRY_SLUGS = [
  'oil-gas',
  'petrochemical',
  'power-energy',
  'manufacturing',
  'industrial-infrastructure',
] as const
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number]

/** Project reference (spec §29, extended with `featured`/`year`). */
export interface Project {
  id: number
  slug: string
  title: string
  client: string
  categories: ProjectCategory[]
  industry: IndustrySlug
  location: string
  /** Public path, e.g. '/images/projects/<slug>.webp' */
  image: string
  description: string
  scope?: string[]
  gallery?: string[]
  /** Shown in the Home "Featured Projects" section (3–6 projects). */
  featured?: boolean
  year?: number
  /** Other parties on the project, e.g. 'EPC: TTCL Public Company Limited'. */
  partners?: string[]
  /** Where this reference was published before (old esi-th.com site) — for content tracing. */
  source?: string
}

/** A solution / service page (spec §15–21). */
export interface Service {
  /** Route segment: /solutions/<slug> */
  slug: string
  name: Localized
  tagline: Localized
  description: Localized
  icon: IconName
  features: string[]
  image: string
  /** Links this solution to project cards with the same category. */
  category: ProjectCategory
  industries: IndustrySlug[]
}

export interface Industry {
  slug: IndustrySlug
  name: Localized
  description: Localized
  /** "Typical scope" chips (spec §25). */
  scope: string[]
  icon: IconName
  image: string
}

export interface ProcessStep {
  step: number
  name: Localized
  description: Localized
  icon: IconName
}

export interface Feature {
  title: Localized
  description: Localized
  icon: IconName
}

export interface NavItem {
  /** i18n key, e.g. 'nav.home' */
  labelKey: string
  to: string
  children?: NavItem[]
}

export interface Company {
  /** English legal name */
  name: string
  /** Thai legal name (บริษัท … จำกัด) */
  nameTh: string
  shortName: string
  tagline: Localized
  description: Localized
  address: string
  addressLines: string[]
  addressTh: string
  taxId: string
  /** Display form, e.g. '038-623-000' */
  phone: string
  /** tel: href value, e.g. '+6638623000' */
  phoneHref: string
  fax: string
  email: string
  hours: Localized
  social: { linkedin?: string; facebook?: string; youtube?: string }
  /** Only real, ESI-supplied certificates — empty hides the footer badge row. */
  certifications: { name: string; image: string }[]
  /** Canonical origin for SEO, no trailing slash. */
  siteUrl: string
  map: {
    lat: number
    lng: number
    /** Google Maps place link for "Open in Google Maps" */
    url: string
    /** No-API-key embed URL for the Contact page iframe */
    embedUrl: string
  }
}

export interface PageHeroContent {
  title: Localized
  lead?: Localized
  image: string
}
