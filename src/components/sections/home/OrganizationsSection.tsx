import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { organizations } from '@/data/organizations'
import { useT } from '@/i18n'

/** Owner-supplied project-reference logos, separate from equipment-brand partners. */
export function OrganizationsSection() {
  const { t } = useT()

  return (
    <section
      id="organizations"
      aria-labelledby="organizations-title"
      className="bg-white pt-6 pb-14 md:pt-8 md:pb-20"
    >
      <Container>
        <Reveal>
          <SectionTitle id="organizations-title" title={t('home.organizations')} />
        </Reveal>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-12 sm:gap-y-8">
          {organizations.map((organization) => (
            <Reveal
              as="li"
              key={organization.id}
              className="flex h-20 w-[calc((100%-2rem)/2)] items-center justify-center sm:w-[calc((100%-6rem)/3)] lg:w-[calc((100%-15rem)/6)]"
            >
              <img
                src={organization.image}
                alt={organization.name}
                width={organization.width}
                height={organization.height}
                loading="lazy"
                className="max-h-14 max-w-full object-contain sm:max-h-16"
              />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
