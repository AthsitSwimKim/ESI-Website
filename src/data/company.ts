import type { Company } from '@/types'

/**
 * Company information — confirmed against the existing website (esi-th.com, 2026-09-22):
 * address, phone, fax, email, Thai legal name, tax ID, Facebook page and office location all
 * match the project spec (§34). PLAN.md D1 / D9 / D10 resolved.
 *
 * The address below is confirmed correct by ESI (2026-09-29). Their Google Business listing still
 * shows an older address, so the map's info card may disagree until they update it (D24) —
 * don't "fix" these fields to match Google.
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
    // Official "Share → Embed a map" URL supplied by ESI: it carries the company's own Google
    // Business place ID, so the pin shows the listing (not just a dropped coordinate). No API key.
    embedUrl:
      'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3522.4338416384085!2d101.2721614!3d12.6862423!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3102fdc808aee941%3A0xb12d9dc2e18bcb84!2z4LmA4Lit4LmH4LiZ4LiI4Li04LmA4LiZ4Li14Lii4Lij4Li04LmI4LiHIOC4i-C4tOC4quC5gOC4leC5h-C4oSDguK3guLTguJnguJfguKPguLXguYDguIHguKPguIrguLHguYjguJkg4LiI4Liz4LiB4Lix4LiU!5e1!3m2!1sth!2sth!4v1790658330739!5m2!1sth!2sth',
  },
}
