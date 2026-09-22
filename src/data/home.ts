import type { Localized } from '@/types'

/** Home hero (spec §14) — headline lines are split so the display type can break as in the mockup. */
export const hero = {
  headlineLines: ['ENGINEERING THE', 'CONNECTION THAT', 'INDUSTRY RELIES ON.'],
  subline: {
    en: 'Reliable Industrial Communication & System Integration Solutions.',
  } satisfies Localized,
  primaryCta: { labelKey: 'cta.exploreSolutions', to: '/solutions' },
  secondaryCta: { labelKey: 'cta.viewProjects', to: '/projects' },
  image: '/images/placeholders/hero.svg',
}

/** Section headings on Home. Kept in English in both languages — part of the visual identity (D5). */
export const homeSections = {
  solutions: 'OUR SOLUTIONS',
  about: 'ABOUT ESI',
  industries: 'INDUSTRIES WE SERVE',
  projects: 'FEATURED PROJECTS',
  whyEsi: 'WHY PARTNER WITH ESI',
  process: 'OUR PROCESS',
  processSubtitle: { en: 'From concept to reliable operation.' } satisfies Localized,
}

/** Call-to-action band shown above the footer (spec §33). */
export const ctaBand = {
  line1: 'HAVE AN INDUSTRIAL SYSTEM CHALLENGE?',
  line2: "LET'S ENGINEER THE RIGHT SOLUTION TOGETHER.",
  button: { labelKey: 'cta.contact', to: '/contact' },
}

/** Home "About ESI" image (spec §22: engineer / control room / industrial plant). */
export const aboutImage = '/images/placeholders/about.svg'
