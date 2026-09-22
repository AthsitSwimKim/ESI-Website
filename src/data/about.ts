import type { Feature, Localized } from '@/types'

/** Home "About ESI" feature grid (spec §22) — copy from the mockup. */
export const aboutFeatures: Feature[] = [
  {
    title: { en: 'Reliability You Can Trust' },
    description: { en: 'Robust solutions engineered for uptime and operational excellence.' },
    icon: 'Award',
  },
  {
    title: { en: 'Engineering Expertise' },
    description: {
      en: 'Certified engineers with deep domain knowledge and practical experience.',
    },
    icon: 'HardHat',
  },
  {
    title: { en: 'End-to-End Integration' },
    description: { en: 'From design and supply to installation and commissioning.' },
    icon: 'Workflow',
  },
  {
    title: { en: 'Lifecycle Support' },
    description: { en: 'Ongoing maintenance and support to maximize system performance.' },
    icon: 'Headset',
  },
]

/** "Why partner with ESI" (spec §31). Item names from the spec; descriptions DRAFT – ESI to approve. */
export const whyEsi: Feature[] = [
  {
    title: { en: 'Industrial Experience' },
    description: {
      en: 'Proven track record in oil & gas, petrochemical, power and manufacturing environments.',
    },
    icon: 'Factory',
  },
  {
    title: { en: 'Engineering Expertise' },
    description: {
      en: 'Certified engineers who design to standards and understand plant operations.',
    },
    icon: 'HardHat',
  },
  {
    title: { en: 'Reliable Solutions' },
    description: {
      en: 'Systems specified and built for uptime in demanding, hazardous conditions.',
    },
    icon: 'ShieldCheck',
  },
  {
    title: { en: 'End-to-End Integration' },
    description: {
      en: 'One partner from consultation and engineering to installation and commissioning.',
    },
    icon: 'Workflow',
  },
  {
    title: { en: 'Long-Term Support' },
    description: {
      en: 'Maintenance contracts and technical support for the full system lifecycle.',
    },
    icon: 'LifeBuoy',
  },
  {
    title: { en: 'Professional Service' },
    description: {
      en: 'Clear communication, documentation and delivery you can plan around.',
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
    en: "Engineering System Integration Co., Ltd. (ESI) is a Rayong-based engineering and system integration company serving Thailand's industrial heartland. We specialise in industrial communication, networking, security and integrated systems for plants and facilities where reliability is non-negotiable.",
  },
  overview: {
    en: 'From our base in Rayong we support customers across the Eastern Seaboard and beyond — from petrochemical complexes and tank terminals to power plants and manufacturing sites — as a single accountable partner from design to long-term support.',
  },
  mission: {
    en: 'To deliver industrial communication and system integration solutions that keep our customers’ operations connected, secure and reliable.',
  },
  vision: {
    en: 'To be the trusted system integration partner for industry in Thailand and the region.',
  },
  coreValues: [
    {
      title: { en: 'Reliability' },
      description: { en: 'Systems our customers can depend on, every day.' },
      icon: 'ShieldCheck',
    },
    {
      title: { en: 'Engineering Excellence' },
      description: { en: 'Designed to standards, built with precision.' },
      icon: 'DraftingCompass',
    },
    {
      title: { en: 'Safety' },
      description: { en: 'Safe work and safe systems in every environment.' },
      icon: 'HardHat',
    },
    {
      title: { en: 'Integrity' },
      description: { en: 'Straightforward advice and honest delivery.' },
      icon: 'Handshake',
    },
    {
      title: { en: 'Long-Term Partnership' },
      description: { en: 'Support that lasts the lifetime of the system.' },
      icon: 'LifeBuoy',
    },
  ],
}
