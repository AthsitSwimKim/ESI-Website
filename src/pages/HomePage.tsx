import { AboutSection } from '@/components/sections/home/AboutSection'
import { FeaturedProjectsSection } from '@/components/sections/home/FeaturedProjectsSection'
import { HeroSection } from '@/components/sections/home/HeroSection'
import { IndustriesSection } from '@/components/sections/home/IndustriesSection'
import { ProcessSection } from '@/components/sections/home/ProcessSection'
import { SolutionsSection } from '@/components/sections/home/SolutionsSection'
import { WhyEsiSection } from '@/components/sections/home/WhyEsiSection'
import { TrustEvidence } from '@/components/sections/shared/TrustEvidence'
import { Seo } from '@/components/ui/Seo'
import { seo } from '@/data/seo'
import { useT } from '@/i18n'

/** Home (spec §13): Hero → Solutions → About → Industries → Featured Projects → Why ESI → Process → CTA (layout) → Footer. */
export function HomePage() {
  const { l } = useT()
  return (
    <>
      <Seo title={l(seo.siteTitle)} path="/" />
      <HeroSection />
      <SolutionsSection />
      <AboutSection />
      <TrustEvidence />
      <IndustriesSection />
      <FeaturedProjectsSection />
      <WhyEsiSection />
      <ProcessSection />
    </>
  )
}
