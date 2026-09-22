import type { Industry, IndustrySlug } from '@/types'

/**
 * Industries we serve (spec §24–25). Names and scope are from the spec;
 * descriptions are DRAFT – ESI to approve (content.md §5).
 */
export const industries: Industry[] = [
  {
    slug: 'oil-gas',
    name: { en: 'Oil & Gas' },
    description: {
      en: 'Communication and surveillance systems for terminals, tank farms and processing sites, including explosion-proof equipment for hazardous areas.',
    }, // DRAFT – ESI to approve
    scope: ['Network', 'Communication', 'Explosion-Proof CCTV', 'Security', 'Maintenance'],
    icon: 'Droplet',
    image: '/images/placeholders/industry-oil-gas.svg',
  },
  {
    slug: 'petrochemical',
    name: { en: 'Petrochemical' },
    description: {
      en: 'Plant-wide network, security and communication systems integrated to the demanding standards of petrochemical complexes.',
    }, // DRAFT – ESI to approve
    scope: ['Industrial Network', 'CCTV', 'Access Control', 'Communication', 'Cybersecurity'],
    icon: 'Hexagon',
    image: '/images/placeholders/industry-petrochemical.svg',
  },
  {
    slug: 'power-energy',
    name: { en: 'Power & Energy' },
    description: {
      en: 'Reliable connectivity and monitoring for power plants and energy infrastructure where downtime is not an option.',
    }, // DRAFT – ESI to approve
    scope: ['Network', 'Communication', 'CCTV', 'Security', 'Maintenance'],
    icon: 'Zap',
    image: '/images/placeholders/industry-power-energy.svg',
  },
  {
    slug: 'manufacturing',
    name: { en: 'Manufacturing' },
    description: {
      en: 'Secure factory networks, access control and surveillance that support safe, efficient production.',
    }, // DRAFT – ESI to approve
    scope: ['Network', 'Access Control', 'CCTV', 'Cybersecurity'],
    icon: 'Factory',
    image: '/images/placeholders/industry-manufacturing.svg',
  },
  {
    slug: 'industrial-infrastructure',
    name: { en: 'Industrial Infrastructure' },
    description: {
      en: 'Communication, networking and security systems for ports, utilities, industrial estates and large facilities.',
    }, // DRAFT – ESI to approve
    scope: ['Communication', 'Network', 'Security', 'Monitoring'],
    icon: 'Building2',
    image: '/images/placeholders/industry-industrial-infrastructure.svg',
  },
]

export function getIndustry(slug: IndustrySlug): Industry {
  // Every IndustrySlug has an entry above; the non-null assertion is safe by construction.
  return industries.find((i) => i.slug === slug)!
}
