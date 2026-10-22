import { AboutSection } from '@/components/sections/home/AboutSection'
import { FeaturedProjectsSection } from '@/components/sections/home/FeaturedProjectsSection'
import { HeroSection } from '@/components/sections/home/HeroSection'
import { IndustriesSection } from '@/components/sections/home/IndustriesSection'
import { OrganizationsSection } from '@/components/sections/home/OrganizationsSection'
import { ProcessSection } from '@/components/sections/home/ProcessSection'
import { SolutionsSection } from '@/components/sections/home/SolutionsSection'
import { WhyEsiSection } from '@/components/sections/home/WhyEsiSection'
import { TrustEvidence } from '@/components/sections/shared/TrustEvidence'
import { BrandPartners } from '@/components/sections/shared/BrandPartners'
import { Seo } from '@/components/ui/Seo'
import { seo } from '@/data/seo'
import { featuredBrandIds } from '@/data/partners'
import { useT } from '@/i18n'

/** Home: Hero → Solutions → About → Evidence → Industries → Projects → Brands → Organizations → Why ESI → Process → CTA → Footer. */
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
      <BrandPartners ids={featuredBrandIds} overviewLink />
      <OrganizationsSection />
      <WhyEsiSection />
      <ProcessSection />
    </>
  )
}
