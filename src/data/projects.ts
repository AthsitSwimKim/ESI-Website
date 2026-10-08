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
 * Five projects still show the navy placeholder — their source URL is dead (LinkedIn tokens
 * expired, 404s, site gone), so there is nothing to fetch. See PLAN.md D6.
 *
 * Array order = display order (newest first). `id` is stable and chronological — a new
 * project gets the next id and goes at the TOP of the array (spec §50).
 */
export const projects: Project[] = [
  {
    id: 22,
    slug: 'map-ta-phut-tank-terminal-cctv',
    title: 'Map Ta Phut Tank Terminal – CCTV Explosion-Proof',
    titleTh: 'Map Ta Phut Tank Terminal – ระบบกล้องวงจรปิดชนิดป้องกันการระเบิด',
    client: 'Map Ta Phut Tank Terminal Co., Ltd. (SCG Chemicals)',
    categories: ['cctv'],
    industry: 'oil-gas',
    location: 'Map Ta Phut, Rayong, Thailand',
    locationTh: 'มาบตาพุด จ.ระยอง ประเทศไทย',
    // photo source: Google Maps place photo used by the old site — replace with ESI's own
    image: '/images/projects/map-ta-phut-tank-terminal-cctv.webp',
    description:
      'Design, supply, and installation of explosion-proof CCTV system for hazardous area monitoring.',
    descriptionTh:
      'ออกแบบ จัดหา และติดตั้งระบบกล้องวงจรปิดชนิดป้องกันการระเบิดสำหรับเฝ้าระวังในพื้นที่อันตราย',
    scope: [
      'Explosion-proof (Ex d) CCTV system installed in hazardous areas',
      'Modification and revamp of the existing CCTV system',
    ],
    scopeTh: [
      'ติดตั้งระบบกล้องวงจรปิดชนิด Explosion-Proof (Ex d) ในพื้นที่อันตราย',
      'ปรับปรุงและ Revamp ระบบกล้องวงจรปิดเดิม',
    ],
    imageKind: 'illustration',
    featured: true,
    year: 2024,
    source: 'https://esi-th.com/refference/mttscgchem/',
  },
  {
    id: 21,
    slug: 'long-son-petrochemical-network',
    title: 'Long Son Petrochemical Complex – Network System',
    titleTh: 'Long Son Petrochemical Complex – ระบบเครือข่าย',
    client: 'SCG – Long Son Integrated Petrochemicals Complex',
    categories: ['network'],
    industry: 'petrochemical',
    location: 'Ba Ria – Vung Tau, Vietnam',
    locationTh: 'บ่าเสีย–หวุงเต่า ประเทศเวียดนาม',
    // photo source: Google image result via the old site; LuxSolar wordmark and LXS logo cropped off — only ~117px wide once clean — replace with ESI's own
    image: '/images/projects/long-son-petrochemical-network.webp',
    description:
      'Industrial network infrastructure design and implementation for plant-wide connectivity.',
    descriptionTh:
      'ออกแบบและติดตั้งโครงสร้างพื้นฐานเครือข่ายอุตสาหกรรมสำหรับเชื่อมต่อระบบทั่วทั้งโรงงาน',
    scope: ['Network system'],
    scopeTh: ['ระบบเครือข่าย'],
    imageKind: 'illustration',
    featured: true,
    year: 2020,
    source: 'https://esi-th.com/refference/scgls/',
  },
  {
    id: 20,
    slug: 'senior-aerospace-access-control',
    title: 'Senior Aerospace Thailand – Access Control',
    titleTh: 'Senior Aerospace Thailand – ระบบควบคุมการเข้าออก',
    client: 'Senior Aerospace (Thailand)',
    categories: ['access-control'],
    industry: 'manufacturing',
    location: 'Rayong, Thailand', // to confirm
    locationTh: 'จ.ระยอง ประเทศไทย',
    image: '/images/projects/senior-aerospace-access-control.webp',
    description:
      'Consultancy and installation of an access control system for an aerospace manufacturing facility.',
    descriptionTh: 'ให้คำปรึกษาและติดตั้งระบบควบคุมการเข้าออกสำหรับโรงงานผลิตชิ้นส่วนอากาศยาน',
    scope: ['Access control system – consultancy', 'Access control system – installation'],
    scopeTh: ['ให้คำปรึกษาระบบควบคุมการเข้าออก', 'ติดตั้งระบบควบคุมการเข้าออก'],
    partners: ['Consortium: Hostech Co., Ltd.'],
    partnersTh: ['ผู้ร่วมดำเนินงาน: Hostech Co., Ltd.'],
    imageKind: 'illustration',
    year: 2019,
    source: 'https://esi-th.com/refference/senior-aerospace-thailand/',
  },
  {
    id: 19,
    slug: 'gc-glycol-ea-plant-cctv-maintenance',
    title: 'GC Glycol EA Plant – CCTV Maintenance',
    titleTh: 'GC Glycol EA Plant – บำรุงรักษาระบบกล้องวงจรปิด',
    client: 'GC Glycol Co., Ltd. – EA Plant (Ethanolamine)',
    categories: ['cctv', 'maintenance'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand', // to confirm
    locationTh: 'มาบตาพุด จ.ระยอง ประเทศไทย',
    image: '/images/projects/gc-glycol-ea-plant-cctv-maintenance.webp',
    description: 'Maintenance of the CCTV system at the ethanolamine (EA) plant.',
    descriptionTh: 'บำรุงรักษาระบบกล้องวงจรปิดภายในโรงงาน Ethanolamine (EA)',
    scope: ['CCTV system maintenance'],
    scopeTh: ['บำรุงรักษาระบบกล้องวงจรปิด'],
    imageKind: 'illustration',
    year: 2019,
    source: 'https://esi-th.com/refference/gc-glycol-ea-plant-ethanolamine/',
  },
  {
    id: 18,
    slug: 'henkel-thailand-access-control',
    title: 'Henkel Thailand – Access Control',
    titleTh: 'Henkel Thailand – ระบบควบคุมการเข้าออก',
    client: 'Henkel (Thailand) – Bangpakong plant',
    categories: ['access-control'],
    industry: 'manufacturing',
    location: 'Bang Pakong, Chonburi, Thailand',
    locationTh: 'บางปะกง ประเทศไทย',
    // photo source: henkel.co.th (the client’s own plant photo) used by the old site — replace with ESI's own
    image: '/images/projects/henkel-thailand-access-control.webp',
    description: 'Integrated access control system enhancing security and operational efficiency.',
    descriptionTh:
      'ติดตั้งระบบควบคุมการเข้าออกแบบบูรณาการ เพื่อเสริมความปลอดภัยและสนับสนุนการปฏิบัติงาน',
    scope: ['Access control system'],
    scopeTh: ['ระบบควบคุมการเข้าออก'],
    featured: true,
    year: 2019,
    source: 'https://esi-th.com/refference/henkel-thailand-bangpakong/',
  },
  {
    id: 17,
    slug: 'lenzing-t3-lyocell-cctv-timelapse',
    title: 'Lenzing T3 Lyocell Fibers Plant – Construction CCTV',
    titleTh: 'Lenzing T3 Lyocell Fibers Plant – กล้องบันทึกความคืบหน้างานก่อสร้าง',
    client: 'Lenzing (Thailand) Co., Ltd.',
    categories: ['cctv'],
    industry: 'manufacturing',
    location: 'Prachinburi, Thailand', // to confirm
    locationTh: 'จ.ปราจีนบุรี ประเทศไทย',
    // photo source: Google image result via the old site (a video thumbnail); Lenzing logo and "Construction diary" caption cropped off — only ~168px wide once clean — replace with ESI's own
    image: '/images/projects/lenzing-t3-lyocell-cctv-timelapse.webp',
    description:
      'Time-lapse CCTV system for monitoring the construction site of the T3 lyocell fibers plant.',
    descriptionTh:
      'ติดตั้งระบบกล้องวงจรปิดแบบ Time-Lapse เพื่อติดตามความคืบหน้าพื้นที่ก่อสร้างโรงงานเส้นใย Lyocell โครงการ T3',
    scope: ['CCTV time-lapse system for the construction site'],
    scopeTh: ['ระบบกล้องวงจรปิดแบบ Time-Lapse สำหรับพื้นที่ก่อสร้าง'],
    partners: [
      'EPC: Wood (Foster Wheeler (Thailand) Limited)',
      'Consortium: SN Provider Co., Ltd.',
    ],
    partnersTh: [
      'ผู้รับเหมา EPC: Wood (Foster Wheeler (Thailand) Limited)',
      'ผู้ร่วมดำเนินงาน: SN Provider Co., Ltd.',
    ],
    imageKind: 'illustration',
    year: 2019,
    source: 'https://esi-th.com/refference/t3-project-lyocell-fibers-plant/',
  },
  {
    id: 16,
    slug: 'd-enterprise-firewall-vpn',
    title: 'D.Enterprise – Firewall Security & Site-to-Site VPN',
    titleTh: 'D.Enterprise – Firewall Security และ Site-to-Site VPN',
    client: 'D.Enterprise',
    categories: ['cybersecurity'],
    industry: 'manufacturing',
    location: 'Thailand', // to confirm
    locationTh: 'ประเทศไทย',
    image: '/images/projects/d-enterprise-firewall-vpn.webp',
    description:
      'Firewall security and site-to-site VPN connecting the office and factory networks.',
    descriptionTh:
      'ติดตั้งระบบ Firewall Security และ Site-to-Site VPN เพื่อเชื่อมต่อเครือข่ายสำนักงานกับโรงงานอย่างปลอดภัย',
    scope: ['Firewall security', 'Site-to-site VPN (office & factory)'],
    scopeTh: ['ระบบ Firewall Security', 'Site-to-Site VPN ระหว่างสำนักงานและโรงงาน'],
    imageKind: 'illustration',
    year: 2019,
    source: 'https://esi-th.com/refference/dent/',
  },
  {
    id: 15,
    slug: 'gc-orp-olefins-reconfiguration-network',
    title: 'ORP Olefins Reconfiguration Project – Network System',
    titleTh: 'ORP Olefins Reconfiguration Project – ระบบเครือข่าย',
    client: 'PTT Global Chemical Public Company Limited',
    categories: ['network'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand', // to confirm
    locationTh: 'มาบตาพุด จ.ระยอง ประเทศไทย',
    image: '/images/projects/gc-orp-olefins-reconfiguration-network.webp',
    description: 'Network system for the Olefins Reconfiguration Project (ORP).',
    descriptionTh:
      'ติดตั้งระบบเครือข่ายสำหรับโครงการปรับปรุงระบบ Olefins Reconfiguration Project (ORP)',
    scope: ['Network system'],
    scopeTh: ['ระบบเครือข่าย'],
    partners: ['EPC: TTCL Public Company Limited'],
    partnersTh: ['ผู้รับเหมา EPC: TTCL Public Company Limited'],
    imageKind: 'illustration',
    year: 2019,
    source: 'https://esi-th.com/refference/orp/',
  },
  {
    id: 14,
    slug: 'mocd2-map-ta-phut-olefins-network-telephone',
    title: 'MOCD2 Petrochemical & Refinery Project – Network & IP Telephone',
    titleTh: 'MOCD2 Petrochemical & Refinery Project – ระบบเครือข่ายและโทรศัพท์ IP',
    client: 'Map Ta Phut Olefins Co., Ltd. (SCG)',
    categories: ['network', 'communication'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand',
    locationTh: 'มาบตาพุด จ.ระยอง ประเทศไทย',
    // photo source: kaohoon.com via the old site; TTCL watermark cropped out — replace with ESI's own
    image: '/images/projects/mocd2-map-ta-phut-olefins-network-telephone.webp',
    description:
      'Network system and IP telephone system for the MOCD2 petrochemical and refinery project.',
    descriptionTh: 'ติดตั้งระบบเครือข่ายและระบบโทรศัพท์ IP สำหรับโครงการปิโตรเคมีและโรงกลั่น MOCD2',
    scope: ['Network system', 'IP telephone system'],
    scopeTh: ['ระบบเครือข่าย', 'ระบบโทรศัพท์ IP'],
    partners: ['EPC: TTCL Public Company Limited'],
    partnersTh: ['ผู้รับเหมา EPC: TTCL Public Company Limited'],
    imageKind: 'illustration',
    year: 2019,
    source: 'https://esi-th.com/refference/mocd2-project-petrochemical-refinery/',
  },
  {
    id: 13,
    slug: 'gulf-ut-uthai-power-plant-pabx',
    title: 'Gulf UT Uthai Power Plant – PABX Service & Maintenance',
    titleTh: 'Gulf UT โรงไฟฟ้าอุทัย – บริการและบำรุงรักษาระบบ PABX',
    client: 'Gulf UT – Uthai Power Plant (Rojana), Independent Power Producer', // to confirm ("Guft UT" on the old site)
    categories: ['communication', 'maintenance'],
    industry: 'power-energy',
    location: 'Uthai, Ayutthaya, Thailand', // to confirm
    locationTh: 'อ.อุทัย จ.พระนครศรีอยุธยา ประเทศไทย',
    image: '/images/projects/gulf-ut-uthai-power-plant-pabx.webp',
    description: 'Service and maintenance of the PABX system at an IPP power plant.',
    descriptionTh: 'ให้บริการและบำรุงรักษาระบบ PABX ภายในโรงไฟฟ้าเอกชน (IPP)',
    scope: ['PABX system – service & maintenance'],
    scopeTh: ['บริการและบำรุงรักษาระบบ PABX'],
    imageKind: 'illustration',
    year: 2019,
    source:
      'https://esi-th.com/refference/guft-ut-%e0%b9%82%e0%b8%a3%e0%b8%87%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%e0%b8%ad%e0%b8%b8%e0%b8%97%e0%b8%b1%e0%b8%a2/',
  },
  {
    id: 12,
    slug: 'ggc-tfa-cctv',
    title: 'GGC Thai Fatty Alcohols – CCTV System',
    titleTh: 'GGC Thai Fatty Alcohols – ระบบกล้องวงจรปิด',
    client: 'Global Green Chemicals PCL – Thai Fatty Alcohols Co., Ltd.',
    categories: ['cctv'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand', // to confirm
    locationTh: 'มาบตาพุด จ.ระยอง ประเทศไทย',
    image: '/images/projects/ggc-tfa-cctv.webp',
    description: 'Installation, modification and revamp of the analog CCTV system.',
    descriptionTh: 'ติดตั้ง ดัดแปลง และ Revamp ระบบกล้องวงจรปิดแบบ Analog เดิม',
    scope: ['CCTV (analog) system – install, modification & revamp of the existing system'],
    scopeTh: ['ติดตั้ง ดัดแปลง และ Revamp ระบบกล้องวงจรปิดแบบ Analog เดิม'],
    imageKind: 'illustration',
    year: 2018,
    source: 'https://esi-th.com/refference/ggctfa/',
  },
  {
    id: 11,
    slug: 'ptt-gc5-aromatics-2-cctv',
    title: 'PTT GC5 Aromatics 2 Plant – CCTV System',
    titleTh: 'PTT GC5 Aromatics 2 Plant – ระบบกล้องวงจรปิด',
    client: 'PTT Global Chemical – GC5 Aromatics and Refining Plant',
    categories: ['cctv'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand', // to confirm
    locationTh: 'มาบตาพุด จ.ระยอง ประเทศไทย',
    image: '/images/projects/ptt-gc5-aromatics-2-cctv.webp',
    description:
      'Installation, modification and revamp of the analog CCTV system at the aromatics and refining plant.',
    descriptionTh:
      'ติดตั้ง ดัดแปลง และ Revamp ระบบกล้องวงจรปิดแบบ Analog ภายในโรงงาน Aromatics and Refining',
    scope: ['CCTV (analog) system – install, modification & revamp of the existing system'],
    scopeTh: ['ติดตั้ง ดัดแปลง และ Revamp ระบบกล้องวงจรปิดแบบ Analog เดิม'],
    year: 2018,
    source: 'https://esi-th.com/refference/pptgc5ar/',
  },
  {
    id: 10,
    slug: 'scale-360-lqid-360',
    title: 'SCALE 360 (LQID 360) – CCTV, Network & Access Control',
    titleTh: 'SCALE 360 (LQID 360) – กล้องวงจรปิด เครือข่าย และระบบควบคุมการเข้าออก',
    client: 'SCALE 360 – LQID 360',
    categories: ['cctv', 'network', 'access-control'],
    industry: 'industrial-infrastructure',
    location: 'Thailand', // to confirm
    locationTh: 'ประเทศไทย',
    image: '/images/projects/scale-360-lqid-360.webp',
    description:
      'CCTV, Cisco networking and wireless with structured cabling, face-recognition access control and card printing.',
    descriptionTh:
      'ติดตั้งระบบกล้องวงจรปิด ระบบเครือข่ายและไร้สายพร้อม Structured Cabling ระบบควบคุมการเข้าออกด้วยการจดจำใบหน้า และระบบพิมพ์บัตร',
    scope: [
      'CCTV system',
      'Networking & wireless system (Cisco) with structured cabling',
      'Access control system (face recognition)',
      'Card printing solution',
    ],
    scopeTh: [
      'ระบบกล้องวงจรปิด',
      'ระบบเครือข่ายและไร้สาย (Cisco) พร้อม Structured Cabling',
      'ระบบควบคุมการเข้าออกด้วยการจดจำใบหน้า',
      'ระบบพิมพ์บัตร',
    ],
    imageKind: 'illustration',
    year: 2018,
    source: 'https://esi-th.com/refference/scale360/',
  },
  {
    id: 9,
    slug: 'linde-asu3-cctv',
    title: 'Linde ASU3 Map Ta Phut – CCTV System',
    titleTh: 'Linde ASU3 มาบตาพุด – ระบบกล้องวงจรปิด',
    client: 'Linde Group – ASU3',
    categories: ['cctv', 'maintenance'],
    industry: 'petrochemical',
    location: 'Map Ta Phut, Rayong, Thailand',
    locationTh: 'มาบตาพุด จ.ระยอง ประเทศไทย',
    image: '/images/projects/linde-asu3-cctv.webp',
    description:
      'Maintenance, installation, modification and revamp of the CCTV system at the ASU3 air separation unit.',
    descriptionTh: 'บำรุงรักษา ติดตั้ง ดัดแปลง และ Revamp ระบบกล้องวงจรปิดภายในหน่วยแยกอากาศ ASU3',
    scope: ['CCTV system – maintenance, install, modification & revamp of the existing system'],
    scopeTh: ['บำรุงรักษา ติดตั้ง ดัดแปลง และ Revamp ระบบกล้องวงจรปิดเดิม'],
    year: 2018,
    source: 'https://esi-th.com/refference/linde-group-asu3/',
  },
  {
    id: 8,
    slug: 'irpc-cctv',
    title: 'IRPC – CCTV System',
    titleTh: 'IRPC – ระบบกล้องวงจรปิด',
    client: 'IRPC Public Company Limited',
    categories: ['cctv'],
    industry: 'petrochemical',
    location: 'Rayong, Thailand', // to confirm
    locationTh: 'จ.ระยอง ประเทศไทย',
    image: '/images/projects/irpc-cctv.webp',
    description: 'Installation, modification and revamp of the CCTV system.',
    descriptionTh: 'ติดตั้ง ดัดแปลง และ Revamp ระบบกล้องวงจรปิดเดิม',
    scope: ['CCTV system – install, modification & revamp of the existing system'],
    scopeTh: ['ติดตั้ง ดัดแปลง และ Revamp ระบบกล้องวงจรปิดเดิม'],
    year: 2018,
    source: 'https://esi-th.com/refference/ptt-irpc/',
  },
  {
    id: 7,
    slug: 'greenlake-resort-pabx',
    title: 'Greenlake Resort Chiang Mai – PABX System',
    titleTh: 'Greenlake Resort Chiang Mai – ระบบ PABX',
    client: 'Greenlake Resort',
    categories: ['communication'],
    industry: 'industrial-infrastructure',
    location: 'Chiang Mai, Thailand',
    locationTh: 'จ.เชียงใหม่ ประเทศไทย',
    image: '/images/projects/greenlake-resort-pabx.webp',
    description: 'PABX telephone system for a resort.',
    descriptionTh: 'ติดตั้งระบบโทรศัพท์ PABX สำหรับรีสอร์ต',
    scope: ['PABX system'],
    scopeTh: ['ระบบโทรศัพท์ PABX'],
    partners: ['Main contractor: Silentech'],
    partnersTh: ['ผู้รับเหมาหลัก: Silentech'],
    year: 2018,
    source: 'https://esi-th.com/refference/greenlake/',
  },
  {
    id: 6,
    slug: 'scg-kaeng-khoi-access-control',
    title: 'SCG Kaeng Khoi Cement Plant – Access Control',
    titleTh: 'SCG โรงงานปูนซีเมนต์แก่งคอย – ระบบควบคุมการเข้าออก',
    client: 'The Siam Cement PCL (Kaeng Khoi)',
    categories: ['access-control'],
    industry: 'manufacturing',
    location: 'Kaeng Khoi, Saraburi, Thailand',
    locationTh: 'อ.แก่งคอย จ.สระบุรี ประเทศไทย',
    image: '/images/projects/scg-kaeng-khoi-access-control.webp',
    description: 'Access control system for the Kaeng Khoi cement plant.',
    descriptionTh: 'ติดตั้งระบบควบคุมการเข้าออกสำหรับโรงงานปูนซีเมนต์แก่งคอย',
    scope: ['Access control system'],
    scopeTh: ['ระบบควบคุมการเข้าออก'],
    imageKind: 'illustration',
    year: 2018,
    source: 'https://esi-th.com/refference/scg/',
  },
  {
    id: 5,
    slug: 'orisma-office-access-control',
    title: 'Orisma Technology Office – Access Control',
    titleTh: 'สำนักงาน Orisma Technology – ระบบควบคุมการเข้าออก',
    client: 'Orisma Technology Co., Ltd.',
    categories: ['access-control'],
    industry: 'industrial-infrastructure',
    location: 'Thailand', // to confirm
    locationTh: 'ประเทศไทย',
    image: '/images/projects/orisma-office-access-control.webp',
    description: 'Access control system for a software development office.',
    descriptionTh: 'ติดตั้งระบบควบคุมการเข้าออกสำหรับสำนักงานพัฒนาซอฟต์แวร์',
    scope: ['Access control system'],
    scopeTh: ['ระบบควบคุมการเข้าออก'],
    year: 2017,
    source: 'https://esi-th.com/refference/orisma/',
  },
  {
    id: 4,
    slug: 'government-house-phakdi-bodin-network-telephone',
    title: 'Government House, Phakdi Bodin Building – Network & Telephone',
    titleTh: 'ทำเนียบรัฐบาล อาคารภักดีบดินทร์ – ระบบเครือข่ายและโทรศัพท์',
    client: 'Royal Thai Government – Government House (Phakdi Bodin Building)',
    categories: ['network', 'communication'],
    industry: 'industrial-infrastructure',
    location: 'Bangkok, Thailand',
    locationTh: 'กรุงเทพมหานคร ประเทศไทย',
    image: '/images/projects/government-house-phakdi-bodin-network-telephone.webp',
    description: 'Network and telephone systems for the Phakdi Bodin Building at Government House.',
    descriptionTh: 'ติดตั้งระบบเครือข่ายและระบบโทรศัพท์สำหรับอาคารภักดีบดินทร์ ทำเนียบรัฐบาล',
    scope: ['Network system', 'Telephone system'],
    scopeTh: ['ระบบเครือข่าย', 'ระบบโทรศัพท์'],
    partners: ['Consultant / main contractor: Silentech · Excellence Plan & Engineering Co., Ltd.'],
    partnersTh: ['ที่ปรึกษา / ผู้รับเหมาหลัก: Silentech · Excellence Plan & Engineering Co., Ltd.'],
    year: 2017,
    source:
      'https://esi-th.com/refference/%e0%b8%97%e0%b8%b3%e0%b9%80%e0%b8%99%e0%b8%b5%e0%b8%a2%e0%b8%9a/',
  },
  {
    id: 3,
    slug: 'edehege-factory-network-security',
    title: 'Edehege Factory – Enterprise Network & Security',
    titleTh: 'โรงงาน Edehege – ระบบเครือข่ายองค์กรและความปลอดภัย',
    client: 'Edehege (Thailand) Co., Ltd.',
    categories: ['network', 'cybersecurity'],
    industry: 'manufacturing',
    location: 'Thailand', // to confirm
    locationTh: 'ประเทศไทย',
    image: '/images/projects/edehege-factory-network-security.webp',
    description: 'Enterprise network and security system for a packaging and manufacturing plant.',
    descriptionTh: 'ติดตั้งระบบเครือข่ายองค์กรและระบบความปลอดภัยสำหรับโรงงานบรรจุภัณฑ์และการผลิต',
    scope: ['Enterprise network system', 'Network security system'],
    scopeTh: ['ระบบเครือข่ายองค์กร', 'ระบบความปลอดภัยเครือข่าย'],
    imageKind: 'illustration',
    year: 2017,
    source: 'https://esi-th.com/refference/edehege/',
  },
  {
    id: 2,
    slug: 'solar-center-office-systems',
    title: 'Solar Center Office – Integrated Security, Network & AV',
    titleTh: 'สำนักงาน Solar Center – ระบบความปลอดภัย เครือข่าย และภาพเสียงแบบบูรณาการ',
    client: 'Solarcon Co., Ltd.',
    categories: ['cctv', 'access-control', 'network', 'cybersecurity'],
    industry: 'power-energy',
    location: 'Thailand', // to confirm
    locationTh: 'ประเทศไทย',
    image: '/images/projects/solar-center-office-systems.webp',
    gallery: ['/images/projects/solar-center-office-alt.webp'],
    description:
      'CCTV, access control, network, firewall security and audio-visual systems for a solar company office.',
    descriptionTh:
      'ติดตั้งระบบกล้องวงจรปิด ระบบควบคุมการเข้าออก เครือข่าย Firewall และระบบภาพเสียงสำหรับสำนักงานบริษัทพลังงานแสงอาทิตย์',
    scope: [
      'CCTV system',
      'Access control system',
      'Network system',
      'Firewall security',
      'Visual & audio system',
      'Video conference',
      'Video wall system',
    ],
    scopeTh: [
      'ระบบกล้องวงจรปิด',
      'ระบบควบคุมการเข้าออก',
      'ระบบเครือข่าย',
      'ระบบ Firewall Security',
      'ระบบภาพและเสียง',
      'ระบบประชุมทางวิดีโอ',
      'ระบบ Video Wall',
    ],
    partners: ['Main contractor: Rubik Cube'],
    partnersTh: ['ผู้รับเหมาหลัก: Rubik Cube'],
    year: 2017,
    source: 'https://esi-th.com/refference/slc/',
  },
  {
    id: 1,
    slug: 'klongluang-utilities-spp-systems',
    title: 'Klongluang Utilities 120 MW Cogeneration Plant – Network, CCTV, Security & PABX',
    titleTh:
      'Klongluang Utilities โรงไฟฟ้าพลังความร้อนร่วม 120 MW – เครือข่าย กล้องวงจรปิด ความปลอดภัย และ PABX',
    client: 'Klongluang Utilities Co., Ltd. (EGCO) – SPP cogeneration power plant 120 MW',
    categories: ['network', 'cctv', 'cybersecurity', 'communication'],
    industry: 'power-energy',
    location: 'Khlong Luang, Pathum Thani, Thailand',
    locationTh: 'อ.คลองหลวง จ.ปทุมธานี ประเทศไทย',
    image: '/images/projects/klongluang-utilities-spp-systems.webp',
    description:
      'WAN/LAN network, CCTV expansion, firewall security and PABX expansion for a 120 MW SPP cogeneration power plant.',
    descriptionTh:
      'ติดตั้งระบบเครือข่าย WAN/LAN ขยายระบบกล้องวงจรปิด ระบบ Firewall Security และขยายระบบ PABX สำหรับโรงไฟฟ้าพลังความร้อนร่วม SPP ขนาด 120 MW',
    scope: [
      'Network WAN/LAN system',
      'CCTV system (expansion)',
      'Firewall security',
      'PABX system (expansion)',
    ],
    scopeTh: [
      'ระบบเครือข่าย WAN/LAN',
      'ขยายระบบกล้องวงจรปิด',
      'ระบบ Firewall Security',
      'ขยายระบบ PABX',
    ],
    partners: ['Owner: EGCO', 'Consultant: JERA', 'Main contractor: TTCL'],
    partnersTh: ['เจ้าของโครงการ: EGCO', 'ที่ปรึกษา: JERA', 'ผู้รับเหมาหลัก: TTCL'],
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
