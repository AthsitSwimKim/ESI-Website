import { Clock, Mail, MapPin, Phone, Printer } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { company } from '@/data/company'
import { useT } from '@/i18n'

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span aria-hidden className="mt-0.5 shrink-0 text-esi-blue">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold tracking-[.08em] text-esi-muted uppercase">
          {label}
        </p>
        <div className="mt-1 text-base text-esi-text">{children}</div>
      </div>
    </div>
  )
}

/**
 * Company contact card (spec §34, design-spec §5). No form — the project is frontend-only, so
 * the actions are `mailto:` and `tel:` links (spec §35, PLAN D12).
 */
export function ContactInfo() {
  const { t, l, lang } = useT()
  const mailSubject = encodeURIComponent(`Inquiry from the ${company.shortName} website`)

  return (
    <div className="rounded-[4px] bg-esi-light p-6 md:p-8">
      <h2 className="text-lg font-bold text-esi-navy">{company.name}</h2>
      <p className="mt-1 text-sm text-esi-muted">{company.nameTh}</p>

      <div className="mt-7 space-y-6">
        <Row icon={<MapPin size={20} strokeWidth={1.75} />} label={t('contact.address')}>
          <address className="leading-relaxed not-italic">
            {(lang === 'th' ? [company.addressTh] : company.addressLines).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </Row>

        <Row icon={<Phone size={20} strokeWidth={1.75} />} label={t('contact.phone')}>
          <a
            href={`tel:${company.phoneHref}`}
            className="font-semibold text-esi-blue underline-offset-4 hover:underline"
          >
            {company.phone}
          </a>
        </Row>

        <Row icon={<Printer size={20} strokeWidth={1.75} />} label={t('contact.fax')}>
          {company.fax}
        </Row>

        <Row icon={<Mail size={20} strokeWidth={1.75} />} label={t('contact.email')}>
          <a
            href={`mailto:${company.email}`}
            className="font-semibold text-esi-blue underline-offset-4 hover:underline"
          >
            {company.email}
          </a>
        </Row>

        <Row icon={<Clock size={20} strokeWidth={1.75} />} label={t('contact.hours')}>
          {l(company.hours)}
        </Row>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          href={`mailto:${company.email}?subject=${mailSubject}`}
          leadingIcon={<Mail size={18} strokeWidth={2} />}
          className="w-full sm:w-auto"
        >
          {t('cta.emailUs')}
        </Button>
        <Button
          variant="outline"
          href={`tel:${company.phoneHref}`}
          leadingIcon={<Phone size={18} strokeWidth={2} />}
          className="w-full sm:w-auto"
        >
          {t('cta.call')} {company.phone}
        </Button>
      </div>

      <p className="mt-6 text-[13px] text-esi-muted">
        {t('contact.taxId')} {company.taxId}
      </p>
    </div>
  )
}
