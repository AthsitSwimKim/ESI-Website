import { ContactInfo } from '@/components/sections/shared/ContactInfo'
import { MapEmbed } from '@/components/sections/shared/MapEmbed'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/ui/PageHero'
import { Reveal } from '@/components/ui/Reveal'
import { Seo } from '@/components/ui/Seo'
import { pageHeroes } from '@/data/pages'
import { pageTitle } from '@/data/seo'
import { useT } from '@/i18n'

/**
 * /contact (spec §34–36, design-spec §5): contact card + Google Maps embed.
 * No contact form and no CTA band — the CTA band would just repeat this page (RootLayout
 * hides it via the route's `handle.hideCta`).
 */
export function ContactPage() {
  const { t, l } = useT()
  const hero = pageHeroes.contact

  return (
    <>
      <Seo title={pageTitle('Contact')} description={l(hero.lead!)} path="/contact" />
      <PageHero
        title={l(hero.title)}
        lead={l(hero.lead!)}
        image={hero.image}
        breadcrumb={[{ label: t('nav.home'), to: '/' }, { label: t('nav.contact') }]}
      />

      <section aria-label={t('nav.contact')} className="py-14 md:py-20">
        <Container className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Reveal immediate>
            <ContactInfo />
          </Reveal>
          <Reveal immediate delay={0.1}>
            <MapEmbed />
          </Reveal>
        </Container>
      </section>
    </>
  )
}
