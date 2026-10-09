import { solutionImages } from '@/data/profileAssets'
import type { Localized, Service } from '@/types'

/** Source: ESi Profile Company_R7 copy.pptx, solution slides 5–11 (owner supplied). */
function gallery(slug: keyof typeof solutionImages, captions: Localized[]) {
  return solutionImages[slug].map((image, index) => ({ ...image, caption: captions[index]! }))
}

export const services: Service[] = [
  {
    slug: 'paga',
    name: { en: 'Public Address & General Alarm', th: 'ระบบประกาศเสียงและสัญญาณเตือนภัย' },
    tagline: {
      en: 'Plant announcements, emergency alarms and two-way intercom.',
      th: 'ประกาศเสียง แจ้งเตือนเหตุฉุกเฉิน และสื่อสารสองทางภายในโรงงาน',
    },
    description: {
      en: 'Public Address & General Alarm (PA/GA) systems support announcements during normal plant operations and emergencies. Paging and intercom provide two-way communication between individual stations or groups of stations. The system can interface with telephone and radio systems to extend communication across the plant.',
      th: 'ระบบ Public Address & General Alarm (PA/GA) ใช้ประกาศข่าวสารระหว่างการปฏิบัติงานและแจ้งเตือนเมื่อเกิดเหตุฉุกเฉินในโรงงาน พร้อมระบบ Paging และ Intercom สำหรับสื่อสารสองทางระหว่างจุดหรือกลุ่มสถานี และสามารถเชื่อมต่อกับระบบโทรศัพท์และวิทยุเพื่อขยายการสื่อสารให้ครอบคลุมพื้นที่',
    },
    icon: 'Megaphone',
    features: [
      {
        en: 'Public Address & General Alarm (PA/GA)',
        th: 'ระบบประกาศเสียงและสัญญาณเตือนภัย PA/GA',
      },
      { en: 'Operational and emergency announcements', th: 'ประกาศข่าวสารและแจ้งเหตุฉุกเฉิน' },
      { en: 'Alarm notification', th: 'แจ้งเตือนด้วยสัญญาณเสียง' },
      { en: 'Paging & Intercom', th: 'ระบบ Paging และ Intercom' },
      { en: 'Point-to-point and group communication', th: 'สื่อสารระหว่างจุดและกลุ่มสถานี' },
      { en: 'Telephone and radio interfaces', th: 'เชื่อมต่อกับระบบโทรศัพท์และวิทยุ' },
    ],
    image: solutionImages.paga[0]!.src,
    gallery: gallery('paga', [
      { en: 'PA/GA system architecture', th: 'แผนผังระบบประกาศเสียงและสัญญาณเตือนภัย PA/GA' },
      {
        en: 'Paging and intercom across hazardous and non-hazardous areas',
        th: 'ระบบ Paging และ Intercom สำหรับพื้นที่อันตรายและพื้นที่ทั่วไป',
      },
    ]),
    brandIds: ['industronic', 'gai-tronics', 'bosch', 'toa', 'eaton', 'rcs'],
    sourceSlide: 5,
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
  {
    slug: 'industrial-network',
    name: { en: 'Industrial LAN/WAN Networks', th: 'ระบบเครือข่ายอุตสาหกรรม LAN/WAN' },
    tagline: {
      en: 'Network infrastructure for data and IP-based plant communication.',
      th: 'โครงสร้างพื้นฐานเครือข่ายสำหรับข้อมูลและระบบสื่อสาร IP ในโรงงาน',
    },
    description: {
      en: 'Industrial LAN/WAN networks form the communication backbone for data transfer and IP-based systems. Network design considers the application, equipment and site requirements, with star, ring or mesh topologies selected to suit the purpose. Solutions range from small and medium-sized business networks to large project infrastructure.',
      th: 'ระบบเครือข่ายอุตสาหกรรม LAN/WAN เป็นโครงข่ายหลักสำหรับรับส่งข้อมูลและเชื่อมต่อระบบที่ใช้ Internet Protocol (IP) การออกแบบคำนึงถึงลักษณะงาน อุปกรณ์ และความต้องการของพื้นที่ โดยเลือกโครงสร้างแบบ Star, Ring หรือ Mesh ให้เหมาะสม รองรับตั้งแต่เครือข่ายธุรกิจขนาดเล็กและขนาดกลางจนถึงโครงสร้างพื้นฐานของโครงการขนาดใหญ่',
    },
    icon: 'Network',
    features: [
      {
        en: 'Industrial LAN / WAN infrastructure',
        th: 'โครงสร้างพื้นฐานเครือข่ายอุตสาหกรรม LAN/WAN',
      },
      { en: 'Data and IP communication backbone', th: 'โครงข่ายหลักสำหรับข้อมูลและการสื่อสาร IP' },
      {
        en: 'Star, ring and mesh network design',
        th: 'ออกแบบโครงสร้างเครือข่ายแบบ Star, Ring และ Mesh',
      },
      { en: 'Network equipment selection', th: 'เลือกอุปกรณ์ให้เหมาะกับการใช้งาน' },
      { en: 'Industrial network switches', th: 'สวิตช์เครือข่ายสำหรับงานอุตสาหกรรม' },
      {
        en: 'Small business to large project networks',
        th: 'เครือข่ายตั้งแต่ธุรกิจขนาดเล็กจนถึงโครงการขนาดใหญ่',
      },
    ],
    image: solutionImages['industrial-network'][0]!.src,
    gallery: gallery('industrial-network', [
      { en: 'Industrial network architecture', th: 'แผนผังเครือข่ายอุตสาหกรรม' },
      { en: 'Network switch', th: 'สวิตช์เครือข่าย' },
      { en: 'Ethernet switch', th: 'สวิตช์ Ethernet' },
      { en: 'Wireless network equipment', th: 'อุปกรณ์เครือข่ายไร้สาย' },
      { en: 'Industrial switching equipment', th: 'อุปกรณ์สวิตช์สำหรับงานอุตสาหกรรม' },
      { en: 'Industrial network product range', th: 'กลุ่มอุปกรณ์เครือข่ายอุตสาหกรรม' },
    ]),
    category: 'network',
    brandIds: ['hpe', 'aruba', 'hirschmann', 'moxa', 'fortinet', 'cisco'],
    sourceSlide: 6,
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
  {
    slug: 'communication',
    name: { en: 'PABX & Telephone Systems', th: 'ระบบตู้สาขาโทรศัพท์ PABX และโทรศัพท์ IP' },
    tagline: {
      en: 'Analogue, digital and IP telephone systems for offices and plants.',
      th: 'ระบบโทรศัพท์ Analogue, Digital และ IP สำหรับสำนักงานและโรงงาน',
    },
    description: {
      en: 'Telephone systems provide wired communication within offices and plants and to external networks. Solutions include analogue, IP and hybrid PABX systems, with analogue, digital or IP handsets selected for indoor, outdoor, weatherproof or explosion-proof applications. Supporting infrastructure includes MDF, IDF and cabling.',
      th: 'ระบบโทรศัพท์รองรับการสื่อสารผ่านสายภายในสำนักงานและโรงงาน รวมถึงการติดต่อภายนอก มีทั้งระบบ PABX แบบ Analogue, IP และ Hybrid ที่ใช้งานร่วมกันได้ พร้อมเลือกเครื่องโทรศัพท์ Analogue, Digital หรือ IP ให้เหมาะกับพื้นที่ภายในอาคาร ภายนอกอาคาร สภาพอากาศ และพื้นที่ที่ต้องใช้อุปกรณ์ชนิดป้องกันการระเบิด รวมถึงโครงสร้างพื้นฐาน MDF, IDF และสายสัญญาณ',
    },
    icon: 'Phone',
    features: [
      { en: 'Analogue and IP PABX', th: 'ตู้สาขาโทรศัพท์ PABX แบบ Analogue และ IP' },
      { en: 'Hybrid telephone systems', th: 'ระบบโทรศัพท์แบบ Hybrid' },
      { en: 'Analogue, digital and IP handsets', th: 'เครื่องโทรศัพท์ Analogue, Digital และ IP' },
      { en: 'Indoor and outdoor telephones', th: 'โทรศัพท์สำหรับภายในและภายนอกอาคาร' },
      {
        en: 'Weatherproof and explosion-proof telephones',
        th: 'โทรศัพท์ชนิดทนสภาพอากาศและป้องกันการระเบิด',
      },
      { en: 'MDF, IDF and telephone cabling', th: 'ระบบ MDF, IDF และสายสัญญาณโทรศัพท์' },
    ],
    image: solutionImages.communication[0]!.src,
    gallery: gallery('communication', [
      { en: 'Telephone system architecture', th: 'แผนผังระบบโทรศัพท์' },
      { en: 'Plant telephone network', th: 'เครือข่ายโทรศัพท์ภายในโรงงาน' },
      { en: 'IP telephone handset', th: 'เครื่องโทรศัพท์ IP' },
      { en: 'PABX and telephone equipment', th: 'ตู้สาขาและอุปกรณ์โทรศัพท์' },
      { en: 'Telephone product range', th: 'กลุ่มอุปกรณ์โทรศัพท์' },
    ]),
    category: 'communication',
    brandIds: ['ericsson-lg', 'panasonic', 'nec', 'unify', 'cisco'],
    sourceSlide: 7,
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
    name: { en: 'CCTV & Surveillance', th: 'ระบบกล้องวงจรปิดและเฝ้าระวัง' },
    tagline: {
      en: 'Surveillance for plant operations, process areas and perimeter security.',
      th: 'เฝ้าระวังการปฏิบัติงาน กระบวนการผลิต และแนวเขตโรงงาน',
    },
    description: {
      en: 'CCTV supports plant safety, surveillance and security by monitoring abnormal conditions in operating and process areas and detecting perimeter intrusion. Systems can use digital IP, conventional analogue or hybrid technology. Camera selection considers the operating requirements and environment, including indoor, weatherproof, explosion-proof, fixed and pan-tilt-zoom cameras.',
      th: 'ระบบ CCTV สนับสนุนความปลอดภัยและการเฝ้าระวังในโรงงาน ใช้ตรวจสอบความผิดปกติในพื้นที่ปฏิบัติงานและกระบวนการผลิต รวมถึงการบุกรุกบริเวณแนวเขต รองรับเทคโนโลยี Digital IP, Analogue และ Hybrid โดยเลือกกล้องให้เหมาะกับการใช้งานและสภาพแวดล้อม ทั้งกล้องภายในอาคาร กล้องทนสภาพอากาศ กล้องชนิดป้องกันการระเบิด กล้องแบบคงที่ และกล้อง Pan-Tilt-Zoom (PTZ)',
    },
    icon: 'Cctv',
    features: [
      {
        en: 'Digital IP, analogue and hybrid CCTV',
        th: 'ระบบ CCTV แบบ Digital IP, Analogue และ Hybrid',
      },
      {
        en: 'Operating and process area monitoring',
        th: 'เฝ้าระวังพื้นที่ปฏิบัติงานและกระบวนการผลิต',
      },
      { en: 'Perimeter intrusion monitoring', th: 'เฝ้าระวังการบุกรุกบริเวณแนวเขต' },
      { en: 'Indoor and weatherproof cameras', th: 'กล้องภายในอาคารและกล้องทนสภาพอากาศ' },
      { en: 'Explosion-proof cameras', th: 'กล้องชนิดป้องกันการระเบิด' },
      { en: 'Fixed and pan-tilt-zoom (PTZ) cameras', th: 'กล้องแบบคงที่และกล้อง PTZ' },
    ],
    image: solutionImages['cctv-security'][0]!.src,
    gallery: gallery('cctv-security', [
      { en: 'CCTV system architecture', th: 'แผนผังระบบกล้องวงจรปิด' },
      { en: 'Surveillance illumination equipment', th: 'อุปกรณ์ส่องสว่างสำหรับงานเฝ้าระวัง' },
      { en: 'PTZ dome camera', th: 'กล้องโดม PTZ' },
      { en: 'Fixed surveillance camera', th: 'กล้องเฝ้าระวังแบบคงที่' },
      { en: 'Dome camera', th: 'กล้องโดม' },
      { en: 'Industrial pan-tilt camera', th: 'กล้องอุตสาหกรรมแบบ Pan-Tilt' },
      { en: 'Hazardous-area camera equipment', th: 'อุปกรณ์กล้องสำหรับพื้นที่อันตราย' },
      { en: 'Industrial camera housing', th: 'ชุดกล้องสำหรับงานอุตสาหกรรม' },
      { en: 'Camera control equipment', th: 'อุปกรณ์ควบคุมกล้อง' },
    ]),
    category: 'cctv',
    brandIds: [
      'flir',
      'avigilon',
      'bosch',
      'hernis',
      'oxalis',
      'honeywell',
      'panasonic',
      'raytec',
      'hikvision',
      'pelco',
      'ventionex',
      'axis',
      'videotec',
      'tecnovideo',
      'ots',
      'osd',
      'axxonsoft',
      'network-optix',
      'wisenet',
      'march-networks',
      'genetec',
      'digifort',
      'indigovision',
      'synectics',
      'milestone',
      'i-pro',
    ],
    sourceSlide: 8,
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
    name: { en: 'Access Control Systems', th: 'ระบบควบคุมการเข้าออก' },
    tagline: {
      en: 'Access permissions, time attendance and fire-system integration.',
      th: 'จัดการสิทธิ์เข้าออก บันทึกเวลาทำงาน และเชื่อมต่อระบบป้องกันอัคคีภัย',
    },
    description: {
      en: 'Access control systems monitor, protect and manage authorised entry for employees and workers in buildings and facilities. They can also support time and attendance and link to payroll systems. Integration with fire protection systems supports safe evacuation, including releasing doors when the configured fire conditions require it.',
      th: 'ระบบควบคุมการเข้าออกใช้ตรวจสอบและจัดการสิทธิ์การเข้าพื้นที่ของพนักงานและผู้ปฏิบัติงานในอาคารหรือสถานประกอบการ สามารถใช้บันทึกเวลาเข้างานและเชื่อมต่อระบบเงินเดือน รวมถึงทำงานร่วมกับระบบป้องกันอัคคีภัยเพื่อรองรับการอพยพอย่างปลอดภัย เช่น การปลดล็อกประตูตามเงื่อนไขที่กำหนดเมื่อเกิดเหตุเพลิงไหม้',
    },
    icon: 'DoorClosed',
    features: [
      { en: 'Authorised personnel access', th: 'ควบคุมสิทธิ์เข้าออกของบุคลากร' },
      {
        en: 'Building and facility access management',
        th: 'จัดการการเข้าออกอาคารและสถานประกอบการ',
      },
      { en: 'Time & Attendance', th: 'ระบบบันทึกเวลาเข้างาน' },
      { en: 'Payroll system interfaces', th: 'เชื่อมต่อข้อมูลกับระบบเงินเดือน' },
      { en: 'Fire protection system integration', th: 'เชื่อมต่อกับระบบป้องกันอัคคีภัย' },
      { en: 'Emergency door release', th: 'ปลดล็อกประตูในกรณีฉุกเฉิน' },
    ],
    image: solutionImages['access-control'][0]!.src,
    gallery: gallery('access-control', [
      {
        en: 'Access control and fire-system integration',
        th: 'แผนผังระบบควบคุมการเข้าออกและการเชื่อมต่อระบบอัคคีภัย',
      },
      { en: 'Access control equipment', th: 'อุปกรณ์ควบคุมการเข้าออก' },
      { en: 'Card reader', th: 'เครื่องอ่านบัตร' },
      { en: 'Biometric access reader', th: 'เครื่องอ่านไบโอเมตริกสำหรับควบคุมการเข้าออก' },
      { en: 'Access reader product range', th: 'กลุ่มอุปกรณ์อ่านสิทธิ์เข้าออก' },
    ]),
    category: 'access-control',
    brandIds: [
      'suprema',
      'siemens',
      'genetec',
      'hid',
      'bosch',
      'lenel',
      'avigilon',
      'johnson-controls',
      'asis',
      'entrypass',
    ],
    sourceSlide: 9,
    industries: ['manufacturing', 'industrial-infrastructure'],
  },
  {
    slug: 'radio',
    name: { en: 'Radio Communication Systems', th: 'ระบบวิทยุสื่อสาร' },
    tagline: {
      en: 'Two-way wireless voice communication for operations and emergencies.',
      th: 'สื่อสารเสียงสองทางแบบไร้สายสำหรับการปฏิบัติงานและเหตุฉุกเฉิน',
    },
    description: {
      en: 'Radio systems provide two-way wireless voice communication for public safety, emergency services, transport and enterprise operations. Solutions range from point-to-point communication to large systems, using analogue, digital or trunked radio technology across HF, VHF and UHF bands. Equipment includes base stations, repeaters, portable radios and low-loss cable.',
      th: 'ระบบวิทยุรองรับการสื่อสารเสียงสองทางแบบไร้สาย สำหรับความปลอดภัยสาธารณะ การตอบสนองเหตุฉุกเฉิน การขนส่ง และการปฏิบัติงานขององค์กร มีตั้งแต่การสื่อสารระหว่างจุดจนถึงระบบขนาดใหญ่ รองรับเทคโนโลยี Analogue, Digital และ Trunked Radio ในย่านความถี่ HF, VHF และ UHF พร้อมอุปกรณ์สถานีฐาน Repeater วิทยุพกพา และสายสัญญาณชนิดสูญเสียต่ำ',
    },
    icon: 'RadioTower',
    features: [
      { en: 'Two-way wireless voice communication', th: 'สื่อสารเสียงสองทางแบบไร้สาย' },
      {
        en: 'Analogue, digital and trunked radio',
        th: 'ระบบวิทยุ Analogue, Digital และ Trunked Radio',
      },
      { en: 'HF, VHF and UHF bands', th: 'ย่านความถี่ HF, VHF และ UHF' },
      { en: 'Base stations & repeaters', th: 'สถานีฐานและ Repeater' },
      { en: 'Portable radios', th: 'วิทยุสื่อสารแบบพกพา' },
      { en: 'Low-loss cable', th: 'สายสัญญาณชนิดสูญเสียต่ำ' },
    ],
    image: solutionImages.radio[0]!.src,
    gallery: gallery('radio', [
      { en: 'Two-way radio communication', th: 'แผนผังการสื่อสารวิทยุสองทาง' },
      { en: 'Mobile radio equipment', th: 'อุปกรณ์วิทยุเคลื่อนที่' },
      { en: 'Radio cabling', th: 'สายสัญญาณสำหรับระบบวิทยุ' },
      { en: 'Base station equipment', th: 'อุปกรณ์สถานีฐาน' },
      { en: 'Portable radios', th: 'วิทยุสื่อสารแบบพกพา' },
    ]),
    brandIds: ['motorola', 'kenwood', 'l-com', 'andrew'],
    sourceSlide: 10,
    industries: [
      'oil-gas',
      'petrochemical',
      'power-energy',
      'manufacturing',
      'industrial-infrastructure',
    ],
  },
  {
    slug: 'video-wall',
    name: { en: 'Video Wall', th: 'ระบบจอภาพ Video Wall' },
    tagline: {
      en: 'Multiple display panels combined into one large viewing surface.',
      th: 'รวมจอภาพหลายจอเป็นพื้นที่แสดงผลขนาดใหญ่',
    },
    description: {
      en: 'A video wall combines multiple display panels into one large viewing surface. Display technologies include direct-view LED, LCD and rear projection. The solution brings displays, controllers and signal connections together, with panel layout and bezel size considered as part of the overall viewing area.',
      th: 'Video Wall คือการนำจอภาพหลายจอมาจัดเรียงให้ทำงานร่วมกันเป็นพื้นที่แสดงผลขนาดใหญ่ รองรับเทคโนโลยี Direct-view LED, LCD และ Rear Projection โดยระบบประกอบด้วยจอภาพ ชุดควบคุม และการเชื่อมต่อสัญญาณ พร้อมคำนึงถึงรูปแบบการจัดเรียงและขนาดขอบจอที่มีผลต่อพื้นที่แสดงภาพโดยรวม',
    },
    icon: 'PanelsTopLeft',
    features: [
      { en: 'Multi-panel video wall', th: 'ระบบแสดงผลด้วยจอภาพหลายจอ' },
      { en: 'Direct-view LED displays', th: 'จอแสดงผล Direct-view LED' },
      { en: 'LCD display panels', th: 'จอแสดงผล LCD' },
      { en: 'Rear projection displays', th: 'จอแสดงผล Rear Projection' },
      {
        en: 'Video wall controllers and signal connections',
        th: 'ชุดควบคุม Video Wall และการเชื่อมต่อสัญญาณ',
      },
      { en: 'Panel layout and bezel considerations', th: 'รูปแบบการจัดเรียงและขนาดขอบจอ' },
    ],
    image: solutionImages['video-wall'][0]!.src,
    gallery: gallery('video-wall', [
      { en: 'Video wall display example', th: 'ตัวอย่างการแสดงผลของระบบ Video Wall' },
      { en: 'Video wall system components', th: 'องค์ประกอบของระบบ Video Wall' },
      { en: 'Video wall controller connections', th: 'แผนผังการเชื่อมต่อชุดควบคุม Video Wall' },
    ]),
    brandIds: [],
    sourceSlide: 11,
    industries: ['industrial-infrastructure', 'manufacturing', 'power-energy'],
  },
]

export const solutionsIntro: Localized = {
  en: 'ESI provides industrial communication solutions covering PA/GA and intercom, LAN/WAN networks, PABX and telephone systems, CCTV, access control, radio communication and video walls. Its core business also includes hazardous-area hardware, engineering management and communication consultation.',
  th: 'ESI ให้บริการระบบสื่อสารสำหรับภาคอุตสาหกรรม 7 กลุ่ม ได้แก่ ระบบ PA/GA และ Intercom เครือข่าย LAN/WAN ระบบ PABX และโทรศัพท์ กล้องวงจรปิด ระบบควบคุมการเข้าออก วิทยุสื่อสาร และ Video Wall รวมถึงอุปกรณ์สำหรับพื้นที่อันตราย การบริหารงานวิศวกรรม และการให้คำปรึกษาด้านระบบสื่อสาร',
}

export function getServiceBySlug(slug: string | undefined): Service | undefined {
  return services.find((s) => s.slug === slug)
}

export function getServiceByCategory(category: Service['category']): Service | undefined {
  return category ? services.find((s) => s.category === category) : undefined
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
