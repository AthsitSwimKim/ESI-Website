import type { IndustrySlug, Project, ProjectCategory } from '@/types'

/**
 * Project references — 22 real projects published on the previous website
 * (esi-th.com/reference, pages 1–3; text retrieved 2026-09-22, photos 2026-09-29 via the
 * WordPress REST API). Titles were normalised to "Client – System"; `scope` keeps ESI's own
 * wording. Fields marked "to confirm" are inferred (mostly locations).
 *
 * Photos: the old site's media library holds 18 files, 12 of which are project photos — ALL 12
 * are now used here, re-encoded to WebP 3:2 in public/images/projects/. Three of them
 * (Senior Aerospace, SCG Kaeng Khoi, Edehege) are only ~300px wide; they are kept because a real
 * site photo beats a placeholder, but ESI should send the originals.
 * ESI authorised reusing what their reference page showed, including the images it loaded from
 * other companies' sites (2026-09-29), so three more are in use — each marked with its source
 * above. Note the copyright in those stays with the original site, so swap them for ESI's own
 * photos when available.
 * Seven projects still show the navy placeholder: their source URL is dead (LinkedIn tokens
 * expired, 404s, site gone) or the image was another vendor's marketing banner / a 225px video
 * thumbnail, too small and too branded to put on an ESI card. See PLAN.md D6.
 *
 * Array order = display order (newest first). `id` is stable and chronological — a new
 * project gets the next id and goes at the TOP of the array (spec §50).
 */
export const projects: Project[] = [
  {
    id: 22,
    slug: 'map-ta-phut-tank-terminal-cctv',
    title: 'Map Ta Phut Tank Terminal – CCTV Explosion-Proof',
    client: 'Map Ta Phut Tank Terminal Co., Ltd. (SCG Chemicals)',
    categories: ['cctv'],
    industry: 'oil-gas',
    location: 'Map Ta Phut, Rayong, Thailand',
    // photo source: Google Maps place photo used by the old site — replace with ESI's own
    image: '/images/projects/map-ta-phut-tank-terminal-cctv.webp',
    description:
      'Design, supply, and installation of explosion-proof CCTV system for hazardous area monitoring.',
    scope: [
      'Explosion-proof (Ex d) CCTV system installed in hazardous areas',
      'Modification and revamp of the existing CCTV system',
    ],
    featured: true,
    year: 2024,
    source: 'https://esi-th.com/refference/mttscgchem/',
  },
  {
    id: 21,
    slug: 'long-son-petrochemical-network',
    title: 'Long Son Petrochemical Complex – Network System',
    client: 'SCG – Long Son Integrated Petrochemicals Complex',
    categories: ['network'],
    industry: 'petrochemical',
    location: 'Ba Ria – Vung Tau, Vietnam',
    image: '/images/placeholders/project-long-son-petrochemical-network.svg',
    description:
      'Industrial network infrastructure design and implementation for plant-wide connectivity.',
    scope: ['Network system'],
    featured: true,
    year: 2020,
    source: 'https://esi-th.com/refference/scgls/',
  },
  {
    id: 20,
    slug: 'senior-aerospace-access-control',
    title: 'Senior Aerospace Thailand – Access Control',
    client: 'Senior Aerospace (Thailand)',
    categories: ['access-control'],
    industry: 'manufacturing',
    location: 'Rayong, Thailand', // to confirm
    image: '/images/projects/senior-aerospace-access-control.webp',
    description:
      'Consultancy and installation of an access control system for an aerospace manufacturing facility.',
    scope: ['Access control system – consultancy', 'Access control system – installation'],
    partners: ['Consortium: Hostech Co., Ltd.'],
    year: 2019,
    source: 'https://esi-th.com/refference/senior-aerospace-thailand/',
  },
  {
    id: 19,
    slug: 'gc-glycol-ea-plant-cctv-maintenance',
    title: 'GC Glycol EA Plant – CCTV Maintenance',
    client: 'GC Glycol Co., Ltd. – EA Plant (Ethanolamine)',
    categories: ['cctv', 'maintenance'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand', // to confirm
    image: '/images/placeholders/project-gc-glycol-ea-plant-cctv-maintenance.svg',
    description: 'Maintenance of the CCTV system at the ethanolamine (EA) plant.',
    scope: ['CCTV system maintenance'],
    year: 2019,
    source: 'https://esi-th.com/refference/gc-glycol-ea-plant-ethanolamine/',
  },
  {
    id: 18,
    slug: 'henkel-thailand-access-control',
    title: 'Henkel Thailand – Access Control',
    client: 'Henkel (Thailand) – Bangpakong plant',
    categories: ['access-control'],
    industry: 'manufacturing',
    location: 'Bang Pakong, Chonburi, Thailand',
    // photo source: henkel.co.th (the client’s own plant photo) used by the old site — replace with ESI's own
    image: '/images/projects/henkel-thailand-access-control.webp',
    description: 'Integrated access control system enhancing security and operational efficiency.',
    scope: ['Access control system'],
    featured: true,
    year: 2019,
    source: 'https://esi-th.com/refference/henkel-thailand-bangpakong/',
  },
  {
    id: 17,
    slug: 'lenzing-t3-lyocell-cctv-timelapse',
    title: 'Lenzing T3 Lyocell Fibers Plant – Construction CCTV',
    client: 'Lenzing (Thailand) Co., Ltd.',
    categories: ['cctv'],
    industry: 'manufacturing',
    location: 'Prachinburi, Thailand', // to confirm
    image: '/images/placeholders/project-lenzing-t3-lyocell-cctv-timelapse.svg',
    description:
      'Time-lapse CCTV system for monitoring the construction site of the T3 lyocell fibers plant.',
    scope: ['CCTV time-lapse system for the construction site'],
    partners: [
      'EPC: Wood (Foster Wheeler (Thailand) Limited)',
      'Consortium: SN Provider Co., Ltd.',
    ],
    year: 2019,
    source: 'https://esi-th.com/refference/t3-project-lyocell-fibers-plant/',
  },
  {
    id: 16,
    slug: 'd-enterprise-firewall-vpn',
    title: 'D.Enterprise – Firewall Security & Site-to-Site VPN',
    client: 'D.Enterprise',
    categories: ['cybersecurity'],
    industry: 'manufacturing',
    location: 'Thailand', // to confirm
    image: '/images/placeholders/project-d-enterprise-firewall-vpn.svg',
    description:
      'Firewall security and site-to-site VPN connecting the office and factory networks.',
    scope: ['Firewall security', 'Site-to-site VPN (office & factory)'],
    year: 2019,
    source: 'https://esi-th.com/refference/dent/',
  },
  {
    id: 15,
    slug: 'gc-orp-olefins-reconfiguration-network',
    title: 'ORP Olefins Reconfiguration Project – Network System',
    client: 'PTT Global Chemical Public Company Limited',
    categories: ['network'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand', // to confirm
    image: '/images/placeholders/project-gc-orp-olefins-reconfiguration-network.svg',
    description: 'Network system for the Olefins Reconfiguration Project (ORP).',
    scope: ['Network system'],
    partners: ['EPC: TTCL Public Company Limited'],
    year: 2019,
    source: 'https://esi-th.com/refference/orp/',
  },
  {
    id: 14,
    slug: 'mocd2-map-ta-phut-olefins-network-telephone',
    title: 'MOCD2 Petrochemical & Refinery Project – Network & IP Telephone',
    client: 'Map Ta Phut Olefins Co., Ltd. (SCG)',
    categories: ['network', 'communication'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand',
    // photo source: kaohoon.com via the old site; TTCL watermark cropped out — replace with ESI's own
    image: '/images/projects/mocd2-map-ta-phut-olefins-network-telephone.webp',
    description:
      'Network system and IP telephone system for the MOCD2 petrochemical and refinery project.',
    scope: ['Network system', 'IP telephone system'],
    partners: ['EPC: TTCL Public Company Limited'],
    year: 2019,
    source: 'https://esi-th.com/refference/mocd2-project-petrochemical-refinery/',
  },
  {
    id: 13,
    slug: 'gulf-ut-uthai-power-plant-pabx',
    title: 'Gulf UT Uthai Power Plant – PABX Service & Maintenance',
    client: 'Gulf UT – Uthai Power Plant (Rojana), Independent Power Producer', // to confirm ("Guft UT" on the old site)
    categories: ['communication', 'maintenance'],
    industry: 'power-energy',
    location: 'Uthai, Ayutthaya, Thailand', // to confirm
    image: '/images/placeholders/project-gulf-ut-uthai-power-plant-pabx.svg',
    description: 'Service and maintenance of the PABX system at an IPP power plant.',
    scope: ['PABX system – service & maintenance'],
    year: 2019,
    source:
      'https://esi-th.com/refference/guft-ut-%e0%b9%82%e0%b8%a3%e0%b8%87%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%e0%b8%ad%e0%b8%b8%e0%b8%97%e0%b8%b1%e0%b8%a2/',
  },
  {
    id: 12,
    slug: 'ggc-tfa-cctv',
    title: 'GGC Thai Fatty Alcohols – CCTV System',
    client: 'Global Green Chemicals PCL – Thai Fatty Alcohols Co., Ltd.',
    categories: ['cctv'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand', // to confirm
    image: '/images/placeholders/project-ggc-tfa-cctv.svg',
    description: 'Installation, modification and revamp of the analog CCTV system.',
    scope: ['CCTV (analog) system – install, modification & revamp of the existing system'],
    year: 2018,
    source: 'https://esi-th.com/refference/ggctfa/',
  },
  {
    id: 11,
    slug: 'ptt-gc5-aromatics-2-cctv',
    title: 'PTT GC5 Aromatics 2 Plant – CCTV System',
    client: 'PTT Global Chemical – GC5 Aromatics and Refining Plant',
    categories: ['cctv'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand', // to confirm
    image: '/images/projects/ptt-gc5-aromatics-2-cctv.webp',
    description:
      'Installation, modification and revamp of the analog CCTV system at the aromatics and refining plant.',
    scope: ['CCTV (analog) system – install, modification & revamp of the existing system'],
    year: 2018,
    source: 'https://esi-th.com/refference/pptgc5ar/',
  },
  {
    id: 10,
    slug: 'scale-360-lqid-360',
    title: 'SCALE 360 (LQID 360) – CCTV, Network & Access Control',
    client: 'SCALE 360 – LQID 360',
    categories: ['cctv', 'network', 'access-control'],
    industry: 'industrial-infrastructure',
    location: 'Thailand', // to confirm
    image: '/images/placeholders/project-scale-360-lqid-360.svg',
    description:
      'CCTV, Cisco networking and wireless with structured cabling, face-recognition access control and card printing.',
    scope: [
      'CCTV system',
      'Networking & wireless system (Cisco) with structured cabling',
      'Access control system (face recognition)',
      'Card printing solution',
    ],
    year: 2018,
    source: 'https://esi-th.com/refference/scale360/',
  },
  {
    id: 9,
    slug: 'linde-asu3-cctv',
    title: 'Linde ASU3 Map Ta Phut – CCTV System',
    client: 'Linde Group – ASU3',
    categories: ['cctv', 'maintenance'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand',
    image: '/images/projects/linde-asu3-cctv.webp',
    description:
      'Maintenance, installation, modification and revamp of the CCTV system at the ASU3 air separation unit.',
    scope: ['CCTV system – maintenance, install, modification & revamp of the existing system'],
    year: 2018,
    source: 'https://esi-th.com/refference/linde-group-asu3/',
  },
  {
    id: 8,
    slug: 'irpc-cctv',
    title: 'IRPC – CCTV System',
    client: 'IRPC Public Company Limited',
    categories: ['cctv'],
    industry: 'petrochemical',
    location: 'Rayong, Thailand', // to confirm
    image: '/images/projects/irpc-cctv.webp',
    description: 'Installation, modification and revamp of the CCTV system.',
    scope: ['CCTV system – install, modification & revamp of the existing system'],
    year: 2018,
    source: 'https://esi-th.com/refference/ptt-irpc/',
  },
  {
    id: 7,
    slug: 'greenlake-resort-pabx',
    title: 'Greenlake Resort Chiang Mai – PABX System',
    client: 'Greenlake Resort',
    categories: ['communication'],
    industry: 'industrial-infrastructure',
    location: 'Chiang Mai, Thailand',
    image: '/images/projects/greenlake-resort-pabx.webp',
    description: 'PABX telephone system for a resort.',
    scope: ['PABX system'],
    partners: ['Main contractor: Silentech'],
    year: 2018,
    source: 'https://esi-th.com/refference/greenlake/',
  },
  {
    id: 6,
    slug: 'scg-kaeng-khoi-access-control',
    title: 'SCG Kaeng Khoi Cement Plant – Access Control',
    client: 'The Siam Cement PCL (Kaeng Khoi)',
    categories: ['access-control'],
    industry: 'manufacturing',
    location: 'Kaeng Khoi, Saraburi, Thailand',
    image: '/images/projects/scg-kaeng-khoi-access-control.webp',
    description: 'Access control system for the Kaeng Khoi cement plant.',
    scope: ['Access control system'],
    year: 2018,
    source: 'https://esi-th.com/refference/scg/',
  },
  {
    id: 5,
    slug: 'orisma-office-access-control',
    title: 'Orisma Technology Office – Access Control',
    client: 'Orisma Technology Co., Ltd.',
    categories: ['access-control'],
    industry: 'industrial-infrastructure',
    location: 'Thailand', // to confirm
    image: '/images/projects/orisma-office-access-control.webp',
    description: 'Access control system for a software development office.',
    scope: ['Access control system'],
    year: 2017,
    source: 'https://esi-th.com/refference/orisma/',
  },
  {
    id: 4,
    slug: 'government-house-phakdi-bodin-network-telephone',
    title: 'Government House, Phakdi Bodin Building – Network & Telephone',
    client: 'Royal Thai Government – Government House (Phakdi Bodin Building)',
    categories: ['network', 'communication'],
    industry: 'industrial-infrastructure',
    location: 'Bangkok, Thailand',
    image: '/images/projects/government-house-phakdi-bodin-network-telephone.webp',
    description: 'Network and telephone systems for the Phakdi Bodin Building at Government House.',
    scope: ['Network system', 'Telephone system'],
    partners: ['Consultant / main contractor: Silentech · Excellence Plan & Engineering Co., Ltd.'],
    year: 2017,
    source:
      'https://esi-th.com/refference/%e0%b8%97%e0%b8%b3%e0%b9%80%e0%b8%99%e0%b8%b5%e0%b8%a2%e0%b8%9a/',
  },
  {
    id: 3,
    slug: 'edehege-factory-network-security',
    title: 'Edehege Factory – Enterprise Network & Security',
    client: 'Edehege (Thailand) Co., Ltd.',
    categories: ['network', 'cybersecurity'],
    industry: 'manufacturing',
    location: 'Thailand', // to confirm
    image: '/images/projects/edehege-factory-network-security.webp',
    description: 'Enterprise network and security system for a packaging and manufacturing plant.',
    scope: ['Enterprise network system', 'Network security system'],
    year: 2017,
    source: 'https://esi-th.com/refference/edehege/',
  },
  {
    id: 2,
    slug: 'solar-center-office-systems',
    title: 'Solar Center Office – Integrated Security, Network & AV',
    client: 'Solarcon Co., Ltd.',
    categories: ['cctv', 'access-control', 'network', 'cybersecurity'],
    industry: 'power-energy',
    location: 'Thailand', // to confirm
    image: '/images/projects/solar-center-office-systems.webp',
    gallery: ['/images/projects/solar-center-office-alt.webp'],
    description:
      'CCTV, access control, network, firewall security and audio-visual systems for a solar company office.',
    scope: [
      'CCTV system',
      'Access control system',
      'Network system',
      'Firewall security',
      'Visual & audio system',
      'Video conference',
      'Video wall system',
    ],
    partners: ['Main contractor: Rubik Cube'],
    year: 2017,
    source: 'https://esi-th.com/refference/slc/',
  },
  {
    id: 1,
    slug: 'klongluang-utilities-spp-systems',
    title: 'Klongluang Utilities 120 MW Cogeneration Plant – Network, CCTV, Security & PABX',
    client: 'Klongluang Utilities Co., Ltd. (EGCO) – SPP cogeneration power plant 120 MW',
    categories: ['network', 'cctv', 'cybersecurity', 'communication'],
    industry: 'power-energy',
    location: 'Khlong Luang, Pathum Thani, Thailand',
    image: '/images/projects/klongluang-utilities-spp-systems.webp',
    description:
      'WAN/LAN network, CCTV expansion, firewall security and PABX expansion for a 120 MW SPP cogeneration power plant.',
    scope: [
      'Network WAN/LAN system',
      'CCTV system (expansion)',
      'Firewall security',
      'PABX system (expansion)',
    ],
    partners: ['Owner: EGCO', 'Consultant: JERA', 'Main contractor: TTCL'],
    year: 2017,
    source: 'https://esi-th.com/refference/klu/',
  },
]

/** Filter tabs on /projects (spec §27) — 'all' plus the six categories, in display order. */
export const projectFilters: { value: ProjectCategory | 'all'; labelKey: string }[] = [
  { value: 'all', labelKey: 'projects.filterAll' },
  { value: 'network', labelKey: 'categories.network' },
  { value: 'cctv', labelKey: 'categories.cctv' },
  { value: 'access-control', labelKey: 'categories.access-control' },
  { value: 'communication', labelKey: 'categories.communication' },
  { value: 'cybersecurity', labelKey: 'categories.cybersecurity' },
  { value: 'maintenance', labelKey: 'categories.maintenance' },
]

export function getProjectBySlug(slug: string | undefined): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getFeaturedProjects(limit = 6): Project[] {
  return projects.filter((p) => p.featured).slice(0, limit)
}

export function getProjectsByIndustry(industry: IndustrySlug): Project[] {
  return projects.filter((p) => p.industry === industry)
}

export function getProjectsByCategory(category: ProjectCategory | 'all'): Project[] {
  if (category === 'all') return projects
  return projects.filter((p) => p.categories.includes(category))
}

/** Same category first, then same industry; never the project itself. */
export function getRelatedProjects(project: Project, limit = 3): Project[] {
  const others = projects.filter((p) => p.id !== project.id)
  const sameCategory = others.filter((p) =>
    p.categories.some((c) => project.categories.includes(c)),
  )
  const sameIndustry = others.filter(
    (p) => !sameCategory.includes(p) && p.industry === project.industry,
  )
  return [...sameCategory, ...sameIndustry].slice(0, limit)
}
