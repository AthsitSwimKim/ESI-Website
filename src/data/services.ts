import type { Service } from '@/types'

/**
 * Solutions / services (spec §15–21). Names, slugs and feature lists are from the spec.
 * Taglines, descriptions and industry links are DRAFT – ESI to approve (content.md §4).
 */
export const services: Service[] = [
  {
    slug: 'industrial-network',
    name: { en: 'Industrial Network' },
    tagline: { en: 'Resilient plant-wide connectivity, engineered for uptime.' }, // DRAFT – ESI to approve
    description: {
      en: 'We design and deliver industrial network infrastructure — from fibre backbones and industrial Ethernet to redundant switching and monitoring — so control, safety and business systems stay connected across the whole site.',
    }, // DRAFT – ESI to approve
    icon: 'Network',
    features: [
      'Network Infrastructure',
      'Industrial Ethernet',
      'Fiber Optic Network',
      'LAN / WAN',
      'Network Switching',
      'Network Redundancy',
      'Industrial Communication',
      'Network Monitoring',
      'Network Integration',
    ],
    image: '/images/placeholders/solution-industrial-network.svg',
    category: 'network',
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
  {
    slug: 'cctv-security',
    name: { en: 'CCTV & Security' },
    tagline: { en: 'Surveillance built for hazardous and mission-critical areas.' }, // DRAFT – ESI to approve
    description: {
      en: 'Industrial and IP CCTV systems, including explosion-proof cameras for hazardous areas, integrated with video management and remote monitoring — designed, installed and maintained by our engineers.',
    }, // DRAFT – ESI to approve
    icon: 'Cctv',
    features: [
      'Industrial CCTV',
      'IP CCTV',
      'Explosion-Proof CCTV',
      'Hazardous Area CCTV',
      'Video Management System',
      'Remote Monitoring',
      'CCTV Installation',
      'CCTV Maintenance',
    ],
    image: '/images/placeholders/solution-cctv-security.svg',
    category: 'cctv',
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
  {
    slug: 'access-control',
    name: { en: 'Access Control' },
    tagline: { en: 'Secure, auditable access for plants and facilities.' }, // DRAFT – ESI to approve
    description: {
      en: 'Door access, RFID and card systems, biometrics and visitor management — integrated into one platform that fits industrial operations and security policies.',
    }, // DRAFT – ESI to approve
    icon: 'DoorClosed',
    features: [
      'Door Access Control',
      'RFID',
      'Card Access',
      'Biometric',
      'Visitor Access',
      'Industrial Access Control',
      'Access Control Integration',
    ],
    image: '/images/placeholders/solution-access-control.svg',
    category: 'access-control',
    industries: ['petrochemical', 'manufacturing', 'industrial-infrastructure'],
  },
  {
    slug: 'communication',
    name: { en: 'Communication System' },
    tagline: { en: 'Clear, dependable communication across the site.' }, // DRAFT – ESI to approve
    description: {
      en: 'IP telephony, PABX, industrial telephones, intercom and PA systems — with the infrastructure and integration to keep operations, safety and emergency communication reliable.',
    }, // DRAFT – ESI to approve
    icon: 'RadioTower',
    features: [
      'IP Telephone',
      'PABX',
      'Industrial Telephone',
      'Intercom',
      'Communication Infrastructure',
      'PA System',
      'Communication Integration',
    ],
    image: '/images/placeholders/solution-communication.svg',
    category: 'communication',
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
  {
    slug: 'cybersecurity',
    name: { en: 'Cybersecurity' },
    tagline: { en: 'Protecting industrial networks and remote access.' }, // DRAFT – ESI to approve
    description: {
      en: 'Firewalls, VPN and site-to-site connectivity, secure remote access and industrial network security — implemented with the operational constraints of plant environments in mind.',
    }, // DRAFT – ESI to approve
    icon: 'ShieldCheck',
    features: [
      'Firewall',
      'VPN',
      'Site-to-Site VPN',
      'Network Security',
      'Remote Access',
      'Industrial Network Security',
      'Security Integration',
    ],
    image: '/images/placeholders/solution-cybersecurity.svg',
    category: 'cybersecurity',
    industries: ['petrochemical', 'manufacturing', 'power-energy'],
  },
  {
    slug: 'maintenance',
    name: { en: 'Maintenance & Support' },
    tagline: { en: 'Keeping your systems reliable for the long run.' }, // DRAFT – ESI to approve
    description: {
      en: 'Preventive and corrective maintenance, MA contracts, inspections, troubleshooting, training and technical support — so the systems we integrate keep performing years after commissioning.',
    }, // DRAFT – ESI to approve
    icon: 'Wrench',
    features: [
      'Preventive Maintenance',
      'Corrective Maintenance',
      'MA Contract',
      'System Inspection',
      'Troubleshooting',
      'System Support',
      'Training',
      'Technical Support',
    ],
    image: '/images/placeholders/solution-maintenance.svg',
    category: 'maintenance',
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
]

export const solutionsIntro = {
  en: 'From network backbone to lifecycle support, ESI delivers the systems that keep industrial operations connected, secure and running.',
} // DRAFT – ESI to approve

export function getServiceBySlug(slug: string | undefined): Service | undefined {
  return services.find((s) => s.slug === slug)
}

export function getServiceByCategory(category: Service['category']): Service | undefined {
  return services.find((s) => s.category === category)
}

/** Previous / next solution for the detail-page footer navigation (wraps around). */
export function getAdjacentServices(slug: string): { prev: Service; next: Service } {
  const i = Math.max(
    0,
    services.findIndex((s) => s.slug === slug),
  )
  const n = services.length
  return { prev: services[(i - 1 + n) % n]!, next: services[(i + 1) % n]! }
}
