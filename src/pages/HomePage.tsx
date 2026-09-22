import { AboutSection } from '@/components/sections/home/AboutSection'
import { FeaturedProjectsSection } from '@/components/sections/home/FeaturedProjectsSection'
import { HeroSection } from '@/components/sections/home/HeroSection'
import { IndustriesSection } from '@/components/sections/home/IndustriesSection'
import { ProcessSection } from '@/components/sections/home/ProcessSection'
import { SolutionsSection } from '@/components/sections/home/SolutionsSection'
import { WhyEsiSection } from '@/components/sections/home/WhyEsiSection'
import { Seo } from '@/components/ui/Seo'
import { seo } from '@/data/seo'

/** Home (spec §13): Hero → Solutions → About → Industries → Featured Projects → Why ESI → Process → CTA (layout) → Footer. */
export function HomePage() {
  return (
    <>
      <Seo title={seo.siteTitle} path="/" />
      <HeroSection />
      <SolutionsSection />
      <AboutSection />
      <IndustriesSection />
      <FeaturedProjectsSection />
      <WhyEsiSection />
      <ProcessSection />
    </>
  )
}
