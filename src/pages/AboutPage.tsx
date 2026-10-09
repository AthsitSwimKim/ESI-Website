import { FeatureItem } from '@/components/cards/FeatureItem'
import { SolutionCard } from '@/components/cards/SolutionCard'
import { IndustriesSection } from '@/components/sections/home/IndustriesSection'
import { WhyEsiSection } from '@/components/sections/home/WhyEsiSection'
import { TrustEvidence } from '@/components/sections/shared/TrustEvidence'
import { Container } from '@/components/ui/Container'
import { DiagonalLines } from '@/components/ui/DiagonalLines'
import { Icon } from '@/components/ui/Icon'
import { PageHero } from '@/components/ui/PageHero'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Seo } from '@/components/ui/Seo'
import { aboutFeatures, aboutIntroImage, aboutPage } from '@/data/about'
import { pageHeroes } from '@/data/pages'
import { pageTitle } from '@/data/seo'
import { services } from '@/data/services'
import { useT } from '@/i18n'
import { scaleIn } from '@/lib/motion'

/**
 * /about (spec §23, design-spec §5): Introduction → Overview → Expertise → Mission / Vision →
 * Core Values → Why ESI (reused) → Industries Served (reused) → CTA (layout).
 * Long-form copy in data/about.ts is DRAFT until ESI approves it.
 */
export function AboutPage() {
  const { t, l } = useT()
  const hero = pageHeroes.about

  return (
    <>
      <Seo title={pageTitle(l(hero.title))} description={l(hero.lead!)} path="/about" />
      <PageHero
        title={l(hero.title)}
        lead={l(hero.lead!)}
        image={hero.image}
        breadcrumb={[{ label: t('nav.home'), to: '/' }, { label: t('nav.about') }]}
      />

      {/* Company Introduction */}
      <section aria-labelledby="about-intro-title" className="py-14 md:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal staggerChildren={0.1} immediate>
            <RevealItem>
              <SectionTitle
                id="about-intro-title"
                title={t('about.introduction')}
                className="mb-6"
              />
            </RevealItem>
            <RevealItem>
              <p className="max-w-[60ch] text-base leading-[1.7] text-esi-text">
                {l(aboutPage.introduction)}
              </p>
            </RevealItem>
          </Reveal>
          <Reveal variants={scaleIn} immediate>
            <img
              src={aboutIntroImage}
              alt=""
              loading="lazy"
              width={1200}
              height={900}
              className="aspect-[4/3] w-full object-cover lg:clip-slant-img-left"
            />
          </Reveal>
        </Container>
      </section>

      <TrustEvidence />

      {/* Company Overview + the four pillars */}
      <section
        aria-labelledby="about-overview-title"
        className="relative isolate overflow-hidden bg-esi-light py-14 md:py-20"
      >
        <DiagonalLines className="absolute -right-4 bottom-6" />
        <Container className="relative">
          <SectionTitle
            id="about-overview-title"
            title={t('about.overview')}
            subtitle={l(aboutPage.overview)}
          />
          <Reveal
            as="ul"
            staggerChildren={0.08}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {aboutFeatures.map((f) => (
              <RevealItem key={f.title.en} as="li">
                <FeatureItem feature={f} />
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Expertise — the seven Company Profile solutions */}
      <section aria-labelledby="about-expertise-title" className="py-14 md:py-20">
        <Container>
          <SectionTitle id="about-expertise-title" title={t('about.expertise')} />
          <ul className="flex flex-wrap justify-center gap-6">
            {services.map((s) => (
              <Reveal
                key={s.slug}
                as="li"
                className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
              >
                <SolutionCard service={s} variant="rich" />
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Mission / Vision */}
      <section
        aria-label={`${t('about.mission')} & ${t('about.vision')}`}
        className="bg-esi-light py-14 md:py-20"
      >
        <Container>
          <Reveal as="ul" staggerChildren={0.12} className="grid gap-6 md:grid-cols-2">
            {(
              [
                { key: 'mission', icon: 'Target', text: aboutPage.mission },
                { key: 'vision', icon: 'Eye', text: aboutPage.vision },
              ] as const
            ).map((item) => (
              <RevealItem key={item.key} as="li">
                <article className="h-full rounded-[4px] border border-esi-border bg-white p-8 shadow-card">
                  <div className="flex size-12 items-center justify-center rounded-[4px] bg-esi-light text-esi-blue">
                    <Icon name={item.icon} size={26} strokeWidth={1.5} />
                  </div>
                  <h2 className="mt-5 display-title text-xl text-esi-blue">
                    {t(`about.${item.key}`)}
                  </h2>
                  <span aria-hidden className="mt-2.5 block h-[3px] w-10 bg-esi-blue" />
                  <p className="mt-4 text-base leading-[1.7] text-esi-text">{l(item.text)}</p>
                </article>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Core Values */}
      <section aria-labelledby="about-values-title" className="py-14 md:py-20">
        <Container>
          <SectionTitle id="about-values-title" title={t('about.coreValues')} />
          <Reveal
            as="ul"
            staggerChildren={0.08}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5"
          >
            {aboutPage.coreValues.map((v) => (
              <RevealItem key={v.title.en} as="li">
                <div className="h-full rounded-[4px] bg-esi-light p-6">
                  <Icon name={v.icon} size={32} strokeWidth={1.5} className="text-esi-blue" />
                  <h3 className="mt-4 text-base font-semibold text-esi-navy">{l(v.title)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-esi-muted">
                    {l(v.description)}
                  </p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      <WhyEsiSection id="about-why" />
      <IndustriesSection id="about-industries" title={t('about.industriesServed').toUpperCase()} />
    </>
  )
}
