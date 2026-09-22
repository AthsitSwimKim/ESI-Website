import { Seo } from '@/components/ui/Seo'
import { company } from '@/data/company'
import { pageHeroes } from '@/data/pages'
import { pageTitle } from '@/data/seo'
import { useT } from '@/i18n'

import { PageStub } from './PageStub'

export function ContactPage() {
  const { l, t } = useT()
  return (
    <>
      <Seo title={pageTitle('Contact')} description={l(pageHeroes.contact.lead!)} path="/contact" />
      <PageStub title={l(pageHeroes.contact.title)} phase="Phase 7">
        <address className="not-italic">
          <p className="font-semibold">{company.name}</p>
          <p>{company.address}</p>
          <p>
            {t('contact.phone')}:{' '}
            <a className="text-esi-blue" href={`tel:${company.phoneHref}`}>
              {company.phone}
            </a>
          </p>
          <p>
            {t('contact.email')}:{' '}
            <a className="text-esi-blue" href={`mailto:${company.email}`}>
              {company.email}
            </a>
          </p>
          <p>
            {t('contact.hours')}: {l(company.hours)}
          </p>
        </address>
      </PageStub>
    </>
  )
}
