import type { ProcessStep } from '@/types'

/** Delivery process (spec §32) — descriptions from the mockup. */
export const processSteps: ProcessStep[] = [
  {
    step: 1,
    name: { en: 'Consult', th: 'ให้คำปรึกษา' },
    description: {
      en: 'Understand your needs and operational goals.',
      th: 'ทำความเข้าใจความต้องการและเป้าหมายการปฏิบัติงาน',
    },
    icon: 'MessagesSquare',
  },
  {
    step: 2,
    name: { en: 'Engineering', th: 'ออกแบบวิศวกรรม' },
    description: {
      en: 'Design solutions tailored to your requirements.',
      th: 'ออกแบบโซลูชันให้เหมาะกับข้อกำหนดและสภาพหน้างาน',
    },
    icon: 'DraftingCompass',
  },
  {
    step: 3,
    name: { en: 'Supply', th: 'จัดหาอุปกรณ์' },
    description: {
      en: 'Source and deliver quality products on time.',
      th: 'คัดเลือกและจัดส่งอุปกรณ์ที่เหมาะสมตามแผนงาน',
    },
    icon: 'Package',
  },
  {
    step: 4,
    name: { en: 'Installation', th: 'ติดตั้ง' },
    description: {
      en: 'Professional installation with safety and precision.',
      th: 'ติดตั้งอย่างเป็นระบบโดยคำนึงถึงความปลอดภัยและความถูกต้อง',
    },
    icon: 'Wrench',
  },
  {
    step: 5,
    name: { en: 'Commissioning', th: 'ทดสอบระบบ' },
    description: {
      en: 'Rigorous testing and system validation.',
      th: 'ทดสอบและตรวจสอบการทำงานของระบบก่อนส่งมอบ',
    },
    icon: 'CircleCheck',
  },
  {
    step: 6,
    name: { en: 'Maintenance', th: 'บำรุงรักษา' },
    description: {
      en: 'Ongoing support to ensure reliability and uptime.',
      th: 'ดูแลต่อเนื่องเพื่อให้ระบบพร้อมใช้งานและเชื่อถือได้',
    },
    icon: 'Headset',
  },
]
