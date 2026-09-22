import type { ProcessStep } from '@/types'

/** Delivery process (spec §32) — descriptions from the mockup. */
export const processSteps: ProcessStep[] = [
  {
    step: 1,
    name: { en: 'Consult' },
    description: { en: 'Understand your needs and operational goals.' },
    icon: 'MessagesSquare',
  },
  {
    step: 2,
    name: { en: 'Engineering' },
    description: { en: 'Design solutions tailored to your requirements.' },
    icon: 'DraftingCompass',
  },
  {
    step: 3,
    name: { en: 'Supply' },
    description: { en: 'Source and deliver quality products on time.' },
    icon: 'Package',
  },
  {
    step: 4,
    name: { en: 'Installation' },
    description: { en: 'Professional installation with safety and precision.' },
    icon: 'Wrench',
  },
  {
    step: 5,
    name: { en: 'Commissioning' },
    description: { en: 'Rigorous testing and system validation.' },
    icon: 'CircleCheck',
  },
  {
    step: 6,
    name: { en: 'Maintenance' },
    description: { en: 'Ongoing support to ensure reliability and uptime.' },
    icon: 'Headset',
  },
]
