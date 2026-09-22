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
    }, // DRAFT
    image: '/images/placeholders/page-hero.svg',
  },
  solutions: {
    title: { en: 'Solutions', th: 'โซลูชัน' },
    lead: {
      en: 'From network backbone to lifecycle support, ESI delivers the systems that keep industrial operations connected, secure and running.',
    }, // DRAFT
    image: '/images/placeholders/page-hero.svg',
  },
  industries: {
    title: { en: 'Industries We Serve', th: 'อุตสาหกรรมที่เราให้บริการ' },
    lead: {
      en: 'Proven in oil & gas, petrochemical, power, manufacturing and industrial infrastructure.',
    }, // DRAFT
    image: '/images/placeholders/page-hero.svg',
  },
  projects: {
    title: { en: 'Projects', th: 'ผลงาน' },
    lead: {
      en: 'Selected references from the industrial sites we have connected, secured and supported.',
    }, // DRAFT
    image: '/images/placeholders/page-hero.svg',
  },
  contact: {
    title: { en: 'Contact', th: 'ติดต่อเรา' },
    lead: {
      en: 'Talk to our engineers about your site, system or maintenance requirements.',
    }, // DRAFT
    image: '/images/placeholders/page-hero.svg',
  },
}

/** 404 page copy (spec §49). */
export const notFound = {
  eyebrow: '404 – PAGE NOT FOUND',
  title: { en: 'The page you are looking for may have been moved or no longer exists.' },
  button: { labelKey: 'cta.backHome', to: '/' },
}
