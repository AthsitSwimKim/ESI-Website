import { ChevronDown, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import logo from '@/assets/logo/esi-logo.png'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { LangSwitch } from '@/components/ui/LangSwitch'
import { company } from '@/data/company'
import { contactCta, headerNav } from '@/data/navigation'
import { services } from '@/data/services'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useT } from '@/i18n'
import { EASE_ESI } from '@/lib/motion'
import { cn } from '@/lib/utils'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

/**
 * Mobile drawer (spec §12, design-spec §3): slides in from the right over a navy overlay,
 * Solutions expands as an accordion, Contact ESI is the contact link (D19), TH/EN at the bottom.
 * Locks body scroll, traps focus, closes on Escape / overlay click / route change.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { t, l, label } = useT()
  const { pathname } = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [solutionsOpen, setSolutionsOpen] = useState(pathname.startsWith('/solutions'))

  useLockBodyScroll(open)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
    if (focusables.length === 0) return
    const first = focusables[0]!
    const last = focusables[focusables.length - 1]!
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const rowClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex h-[52px] flex-1 items-center px-5 text-[18px] font-medium transition-colors',
      isActive ? 'text-esi-blue' : 'text-esi-navy hover:text-esi-blue',
    )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          className="fixed inset-0 z-[60] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div aria-hidden className="absolute inset-0 bg-esi-navy/50" onClick={onClose} />

          <motion.div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t('a11y.mainNav')}
            onKeyDown={onKeyDown}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: EASE_ESI }}
            className="absolute top-0 right-0 flex h-full w-[min(320px,85vw)] flex-col bg-white shadow-card-hover"
          >
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-esi-border px-5">
              <img
                src={logo}
                alt={`${company.shortName} logo`}
                className="h-8 w-auto"
                width={1216}
                height={312}
              />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={t('a11y.closeMenu')}
                className="-mr-2 flex size-11 items-center justify-center rounded-[4px] text-esi-navy transition-colors hover:bg-esi-light"
              >
                <X aria-hidden size={24} />
              </button>
            </div>

            <nav aria-label={t('a11y.mainNav')} className="flex-1 overflow-y-auto">
              <ul>
                {headerNav.map((item) =>
                  item.children ? (
                    <li key={item.to} className="border-b border-esi-border">
                      <div className="flex items-center">
                        <NavLink to={item.to} className={rowClass}>
                          {label(item.labelKey)}
                        </NavLink>
                        <button
                          type="button"
                          aria-expanded={solutionsOpen}
                          aria-controls="mobile-solutions"
                          aria-label={`${label(item.labelKey)} submenu`}
                          onClick={() => setSolutionsOpen((o) => !o)}
                          className="flex size-[52px] shrink-0 items-center justify-center text-esi-muted transition-colors hover:text-esi-blue"
                        >
                          <ChevronDown
                            aria-hidden
                            size={20}
                            className={cn(
                              'transition-transform duration-200',
                              solutionsOpen && 'rotate-180',
                            )}
                          />
                        </button>
                      </div>
                      <AnimatePresence initial={false}>
                        {solutionsOpen && (
                          <motion.ul
                            id="mobile-solutions"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: EASE_ESI }}
                            className="overflow-hidden bg-esi-light/60"
                          >
                            {services.map((s) => (
                              <li key={s.slug}>
                                <NavLink
                                  to={`/solutions/${s.slug}`}
                                  className={({ isActive }) =>
                                    cn(
                                      'flex h-11 items-center gap-3 pr-5 pl-10 text-base transition-colors',
                                      isActive
                                        ? 'text-esi-blue'
                                        : 'text-esi-navy hover:text-esi-blue',
                                    )
                                  }
                                >
                                  <Icon
                                    name={s.icon}
                                    size={18}
                                    strokeWidth={1.75}
                                    className="shrink-0 text-esi-blue"
                                  />
                                  {l(s.name)}
                                </NavLink>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  ) : (
                    <li key={item.to} className="border-b border-esi-border">
                      <NavLink to={item.to} end={item.to === '/'} className={rowClass}>
                        {label(item.labelKey)}
                      </NavLink>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <div className="shrink-0 space-y-4 border-t border-esi-border p-5">
              <Button to={contactCta.to} className="w-full">
                {t('cta.contact')}
              </Button>
              <LangSwitch size="md" className="justify-center" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
