import { Mail, MapPin, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import logoWhite from '@/assets/logo/esi-logo-white.png'
import { Container } from '@/components/ui/Container'
import { NetworkGraphic } from '@/components/ui/NetworkGraphic'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { company } from '@/data/company'
import { footerQuickLinks } from '@/data/navigation'
import { services } from '@/data/services'
import { useT } from '@/i18n'
import { socialLabels, type SocialNetwork } from '@/lib/social'
import { cn } from '@/lib/utils'

const linkClass =
  'text-[14px] text-white/85 transition-colors hover:text-white hover:underline underline-offset-4'

function FooterHeading({ children }: { children: ReactNode }) {
  return <h2 className="mb-5 text-[14px] font-bold tracking-[.06em] uppercase">{children}</h2>
}

function FooterColumn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('lg:border-l lg:border-white/12 lg:px-6 xl:px-10', className)}>
      {children}
    </div>
  )
}

/**
 * Footer (spec §37, design-spec §3): brand + social · contact · quick links · solutions,
 * separated by hairline dividers on a navy surface with a faint network graphic.
 * Certifications render only when real ones exist (D2). No calendar / search / "powered by".
 */
export function Footer() {
  const { t, l, label } = useT()
  const socials = (Object.keys(socialLabels) as SocialNetwork[]).filter((n) => company.social[n])
  const year = new Date().getFullYear()

  return (
    <footer className="relative isolate overflow-hidden bg-esi-navy text-white">
      <NetworkGraphic
        seed={23}
        nodes={30}
        opacity={0.12}
        animated={false}
        className="absolute inset-y-0 right-0 -z-10 w-[55%]"
      />

      <Container className="pt-14 pb-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1.2fr_1fr_1fr] lg:gap-0">
          {/* Brand */}
          <div className="lg:pr-6 xl:pr-10">
            <img
              src={logoWhite}
              alt={`${company.shortName} logo`}
              className="h-12 w-auto"
              width={1216}
              height={312}
              loading="lazy"
            />
            <p className="mt-4 text-[15px] font-bold">{company.name}</p>
            <p className="mt-2 max-w-[30ch] text-[14px] leading-relaxed text-white/75">
              {l(company.tagline)}
            </p>
            {socials.length > 0 && (
              <ul className="mt-6 flex items-center gap-3" aria-label="Social media">
                {socials.map((n) => (
                  <li key={n}>
                    <a
                      href={company.social[n]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${company.shortName} on ${socialLabels[n]}`}
                      className="flex size-10 items-center justify-center rounded-full border-[1.5px] border-white/70 text-white transition-colors hover:border-white hover:bg-white hover:text-esi-navy"
                    >
                      <SocialIcon network={n} size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Contact */}
          <FooterColumn>
            <FooterHeading>{t('footer.contactUs')}</FooterHeading>
            <ul className="space-y-3.5 text-[14px] text-white/85">
              <li className="flex items-start gap-3">
                <Phone aria-hidden size={18} className="mt-0.5 shrink-0 text-white/70" />
                <a href={`tel:${company.phoneHref}`} className={linkClass}>
                  {company.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail aria-hidden size={18} className="mt-0.5 shrink-0 text-white/70" />
                <a href={`mailto:${company.email}`} className={linkClass}>
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin aria-hidden size={18} className="mt-0.5 shrink-0 text-white/70" />
                <address className="leading-relaxed not-italic">
                  {company.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
            </ul>
          </FooterColumn>

          {/* Quick links */}
          <FooterColumn>
            <FooterHeading>{t('footer.quickLinks')}</FooterHeading>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {footerQuickLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {label(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          {/* Solutions */}
          <FooterColumn>
            <FooterHeading>{t('footer.solutions')}</FooterHeading>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/solutions/${s.slug}`} className={linkClass}>
                    {l(s.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>

        {company.certifications.length > 0 && (
          <div className="mt-10 border-t border-white/12 pt-8">
            <FooterHeading>{t('footer.certifications')}</FooterHeading>
            <ul className="flex flex-wrap items-center gap-6">
              {company.certifications.map((c) => (
                <li key={c.name}>
                  <img src={c.image} alt={c.name} className="h-14 w-auto" loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 flex flex-col-reverse items-center gap-2 border-t border-white/12 pt-5 text-[13px] text-white/60 md:flex-row md:justify-between">
          <p>
            {company.nameTh} · Tax ID {company.taxId}
          </p>
          <p>
            © {year} {company.name} {t('footer.rights')}
          </p>
        </div>
      </Container>
    </footer>
  )
}
