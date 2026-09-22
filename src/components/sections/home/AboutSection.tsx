import { FeatureItem } from '@/components/cards/FeatureItem'
import { Button } from '@/components/ui/Button'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { aboutFeatures } from '@/data/about'
import { company } from '@/data/company'
import { aboutImage, homeSections } from '@/data/home'
import { useT } from '@/i18n'
import { scaleIn } from '@/lib/motion'

/**
 * "About ESI" (spec §22, design-spec §4.3): photo bleeding to the left edge, light text panel
 * on the right with the company description and the 2×2 feature grid.
 */
export function AboutSection() {
  const { t, l } = useT()

  return (
    <section aria-labelledby="about-title" className="grid overflow-hidden lg:grid-cols-2">
      <Reveal variants={scaleIn} className="relative min-h-[260px] lg:min-h-[520px]">
        <img
          src={aboutImage}
          alt=""
          loading="lazy"
          width={1200}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </Reveal>

      <div className="bg-esi-light px-5 py-12 sm:px-8 md:px-14 md:py-16 lg:pr-8">
        {/* Keep the copy aligned with the page container's right half on wide screens */}
        <Reveal staggerChildren={0.1} className="lg:max-w-[608px]">
          <RevealItem>
            <SectionTitle id="about-title" title={homeSections.about} className="mb-6" />
          </RevealItem>
          <RevealItem>
            <p className="max-w-[60ch] text-base leading-[1.7] text-esi-text">
              {l(company.description)}
            </p>
          </RevealItem>
          <RevealItem as="ul" className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {aboutFeatures.map((f) => (
              <li key={f.title.en}>
                <FeatureItem feature={f} />
              </li>
            ))}
          </RevealItem>
          <RevealItem className="mt-9">
            <Button variant="link" to="/about">
              {t('cta.learnMoreAbout')}
            </Button>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  )
}
