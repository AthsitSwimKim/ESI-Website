import type { Company } from '@/types'

/**
 * Company information — confirmed against the existing website (esi-th.com, 2026-09-22):
 * address, phone, fax, email, Thai legal name, tax ID, Facebook page and office location all
 * match the project spec (§34). PLAN.md D1 / D9 / D10 resolved.
 */
const MAP_LAT = 12.68721
const MAP_LNG = 101.2745016

export const company: Company = {
  name: 'Engineering System Integration Co., Ltd.',
  nameTh: 'บริษัท เอ็นจิเนียริ่ง ซิสเต็ม อินทีเกรชั่น จำกัด',
  shortName: 'ESI',
  tagline: {
    en: 'Reliable Industrial Communication & System Integration Solutions.',
  },
  description: {
    en: 'Engineering System Integration Co., Ltd. (ESI) delivers reliable industrial communication and system integration solutions for mission-critical environments. With proven engineering expertise and deep industry experience, we design, build, and support systems that keep your operations connected, secure, and performing at their best.',
    // ESI's own words from the previous website (About us), typos corrected.
    th: 'ปัจจุบันการสื่อสารด้านต่าง ๆ มีความจำเป็นอย่างมากสำหรับทุกองค์กร เราซึ่งมีประสบการณ์และความเชี่ยวชาญในระบบสื่อสารทุกด้าน จึงต้องการเป็นส่วนหนึ่งร่วมกับลูกค้า เพื่อนำเสนอโซลูชันและแนวทางที่สอดคล้องกับความต้องการของธุรกิจ ให้ได้ประโยชน์สูงสุดอย่างมืออาชีพ',
  },
  address:
    '69/13 Chanthaudom Road, Choengnoen Subdistrict, Muang Rayong District, Rayong 21000, Thailand',
  addressLines: [
    '69/13 Chanthaudom Road, Choengnoen Subdistrict,',
    'Muang Rayong District, Rayong 21000, Thailand',
  ],
  addressTh: '69/13 ถนนจันทอุดม ตำบลเชิงเนิน อำเภอเมืองระยอง จังหวัดระยอง 21000',
  taxId: '0215560000858',
  phone: '038-623-000',
  phoneHref: '+6638623000',
  fax: '038-623-001',
  email: 'info@esi-th.com',
  hours: { en: 'Monday – Friday, 08:00 – 17:00', th: 'จันทร์ – ศุกร์ 08:00 – 17:00' },
  // LinkedIn / YouTube not provided — empty values hide the icons in the footer (D9).
  social: {
    facebook: 'https://www.facebook.com/engineeringsystemintegration',
    linkedin: '',
    youtube: '',
  },
  // No certifications published — add only real, ESI-supplied certificates (D2).
  certifications: [],
  siteUrl: 'https://esi-th.com',
  map: {
    lat: MAP_LAT,
    lng: MAP_LNG,
    url: 'https://goo.gl/maps/QZkF68qDPFv',
    // Coordinates are more reliable than a free-text address for the key-less embed (spec §36).
    embedUrl: `https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}&z=16&output=embed`,
  },
}
