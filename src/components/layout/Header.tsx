import { Menu } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import logo from '@/assets/logo/esi-logo.png'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { LangSwitch } from '@/components/ui/LangSwitch'
import { company } from '@/data/company'
import { contactCta, headerNav } from '@/data/navigation'
import { useScrolled } from '@/hooks/useScrolled'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

import { MobileMenu } from './MobileMenu'
import { navLinkClass } from './navStyles'
import { NavUnderline } from './NavUnderline'
import { SolutionsMenu } from './SolutionsMenu'

/**
 * Sticky header (spec §11, design-spec §3): slanted white logo panel with a blue stroke,
 * centred nav with the active bar on the header's bottom edge, Contact ESI button, TH | EN.
 * Compacts to 68px with a shadow once the page scrolls. Below lg: logo + hamburger.
 */
export function Header() {
  const scrolled = useScrolled(12)
  const [menuOpen, setMenuOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const { t, label } = useT()

  // Close the drawer when the route changes (state derived from the previous render — no effect needed).
  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    if (menuOpen) setMenuOpen(false)
  }

  const closeMenu = () => {
    setMenuOpen(false)
    burgerRef.current?.focus()
  }

  return (
    <header
      className={cn(
        // Solid white in both states (client feedback: the translucent/blurred version looked grey
        // over the navy hero and made the white logo panel stand out as a box). Shadow when scrolled.
        'sticky top-0 z-50 border-t-[3px] border-t-esi-blue bg-white transition-[box-shadow] duration-[250ms]',
        scrolled ? 'shadow-header' : 'border-b border-b-esi-border',
      )}
    >
      <Container
        className={cn(
          'flex items-center justify-between gap-6 transition-[height] duration-[250ms]',
          scrolled ? 'h-[68px]' : 'h-20',
        )}
      >
        {/* Logo panel — white parallelogram with a slanted right edge, flush with the header line.
            (The mockup's panel dips below the header, but with a centred container on wide screens
            that reads as a floating white block over the hero, so it ends at the border instead.) */}
        <Link
          to="/"
          aria-label={t('a11y.home')}
          className="relative -ml-5 flex h-full shrink-0 items-center pr-14 pl-5 lg:-ml-8 lg:pl-8"
        >
          <span aria-hidden className="absolute inset-0 bg-white clip-slant-right" />
          <span
            aria-hidden
            className="absolute inset-0 bg-esi-blue [clip-path:polygon(calc(100%-3px)_0,100%_0,calc(100%-28px)_100%,calc(100%-31px)_100%)]"
          />
          <img
            src={logo}
            alt={`${company.shortName} logo`}
            className={cn(
              'relative w-auto transition-[height] duration-[250ms]',
              scrolled ? 'h-9' : 'h-10',
            )}
            width={1216}
            height={312}
          />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label={t('a11y.mainNav')} className="hidden h-full lg:block">
          <ul className="flex h-full items-center gap-7 xl:gap-10">
            {headerNav.map((item) =>
              item.children ? (
                <SolutionsMenu key={item.to} label={label(item.labelKey)} to={item.to} />
              ) : (
                <li key={item.to} className="group flex h-full items-center">
                  <NavLink to={item.to} end={item.to === '/'} className={navLinkClass}>
                    {({ isActive }) => (
                      <>
                        {label(item.labelKey)}
                        <NavUnderline active={isActive} />
                      </>
                    )}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-4 xl:gap-5">
          {/* wrapper carries the responsive display so it can't be overridden by the Button's own display class */}
          <div className="hidden sm:block">
            <Button size="sm" to={contactCta.to}>
              {t('cta.contact')}
            </Button>
          </div>
          <LangSwitch className="hidden lg:flex" />
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={t('a11y.openMenu')}
            className="-mr-2 flex size-11 items-center justify-center rounded-[4px] text-esi-navy transition-colors hover:bg-esi-light lg:hidden"
          >
            <Menu aria-hidden size={26} strokeWidth={2} />
          </button>
        </div>
      </Container>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </header>
  )
}
