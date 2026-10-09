import { IndustryShowcase } from '@/components/sections/shared/IndustryShowcase'
import { IndustryPhotoCredits } from '@/components/sections/shared/IndustryPhotoCredits'
import { Container } from '@/components/ui/Container'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { PageHero } from '@/components/ui/PageHero'
import { Seo } from '@/components/ui/Seo'
import { industries } from '@/data/industries'
import { pageHeroes } from '@/data/pages'
import { pageTitle } from '@/data/seo'
import { useT } from '@/i18n'

/** /industries (spec §25, design-spec §5): hero, jump links, one alternating block per industry. */
export function IndustriesPage() {
  const { t, l } = useT()
  const hero = pageHeroes.industries

  return (
    <>
      <Seo title={pageTitle(l(hero.title))} description={l(hero.lead!)} path="/industries" />
      <PageHero
        title={l(hero.title)}
        lead={l(hero.lead!)}
        image={hero.image}
        breadcrumb={[{ label: t('nav.home'), to: '/' }, { label: t('nav.industries') }]}
      />

      {/* Jump links — the five industries are one long page, so give readers a way in */}
      <nav aria-label={t('nav.industries')} className="border-b border-esi-border bg-white">
        <Container>
          <Reveal
            as="ul"
            immediate
            staggerChildren={0.05}
            delay={0.35}
            className="-mx-5 scrollbar-none flex gap-2 overflow-x-auto px-5 py-4 lg:-mx-8 lg:px-8"
          >
            {industries.map((i) => (
              <RevealItem key={i.slug} as="li" className="shrink-0">
                <a
                  href={`#${i.slug}`}
                  className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-esi-border bg-white px-4 text-sm font-semibold text-esi-navy transition-colors hover:border-esi-accent hover:text-esi-blue"
                >
                  <Icon name={i.icon} size={18} strokeWidth={1.75} className="text-esi-blue" />
                  {l(i.name)}
                </a>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </nav>

      <section aria-label={t('nav.industries')} className="py-14 md:py-20">
        <Container className="space-y-16 md:space-y-24">
          {industries.map((industry, i) => (
            <IndustryShowcase
              key={industry.slug}
              industry={industry}
              reverse={i % 2 === 1}
              immediate={i === 0}
            />
          ))}
          <IndustryPhotoCredits />
        </Container>
      </section>
    </>
  )
}
