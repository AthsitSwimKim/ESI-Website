import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { services } from '@/data/services'
import { useT } from '@/i18n'
import { EASE_ESI } from '@/lib/motion'
import { cn } from '@/lib/utils'

import { navLinkClass } from './navStyles'
import { NavUnderline } from './NavUnderline'

const MENU_ID = 'solutions-menu'

/**
 * Desktop "Solutions" nav item with its dropdown (design-spec §3 Header).
 * Opens on hover; the chevron button opens it for keyboard users (Enter / ArrowDown).
 * Escape closes and returns focus; arrow keys move between the six solutions.
 * The list is derived from services.ts, so a new service appears here automatically.
 */
export function SolutionsMenu({ label, to }: { label: string; to: string }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLLIElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const closeTimer = useRef<number>(0)
  const { pathname } = useLocation()
  const { l, t } = useT()

  // Close whenever the route changes (derived during render, per React's "previous render" pattern).
  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    if (open) setOpen(false)
  }

  // Close on outside pointer-down.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }
  const cancelClose = () => window.clearTimeout(closeTimer.current)

  const focusItem = (index: number) => {
    const links = listRef.current?.querySelectorAll<HTMLAnchorElement>('a')
    if (!links?.length) return
    const i = (index + links.length) % links.length
    links[i]?.focus()
  }

  const onToggleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || (e.key === 'Enter' && !open)) {
      e.preventDefault()
      setOpen(true)
      requestAnimationFrame(() => focusItem(0))
    }
  }

  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const links = [...(listRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])]
    const current = links.indexOf(document.activeElement as HTMLAnchorElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      focusItem(current + 1)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      focusItem(current - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focusItem(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      focusItem(links.length - 1)
    }
  }

  const onRootKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
      toggleRef.current?.focus()
    }
  }

  return (
    <li
      ref={rootRef}
      className="group relative flex h-full items-center"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
      onKeyDown={onRootKeyDown}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <NavLink to={to} className={navLinkClass}>
        {({ isActive }) => (
          <>
            {label}
            <NavUnderline active={isActive} />
          </>
        )}
      </NavLink>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={MENU_ID}
        aria-label={`${label} – ${t('nav.solutions')} submenu`}
        // Mouse users already opened it by hovering, so a pointer click keeps it open (they close by
        // moving away or clicking outside); keyboard "clicks" (detail === 0) toggle it.
        onClick={(e) => setOpen(e.detail === 0 ? (o) => !o : true)}
        onKeyDown={onToggleKeyDown}
        // 24px hit target around a 14px glyph → pull the right edge back by the 5px inner padding so the
        // visible gap to the next item equals the flex gap (otherwise "Solutions" looks spaced wider).
        className="-mr-[5px] ml-0.5 flex size-6 items-center justify-center rounded-[2px] text-esi-muted transition-colors hover:text-esi-blue"
      >
        <ChevronDown
          aria-hidden
          size={14}
          strokeWidth={2.25}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={MENU_ID}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: EASE_ESI }}
            className="absolute top-full left-1/2 z-50 w-[560px] -translate-x-1/2 pt-1"
          >
            <ul
              ref={listRef}
              onKeyDown={onListKeyDown}
              className="grid grid-cols-2 gap-1 rounded-[4px] border border-esi-border bg-white p-3 shadow-card-hover"
            >
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={`/solutions/${s.slug}`}
                    className="flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm font-medium text-esi-navy transition-colors hover:bg-esi-light focus-visible:bg-esi-light"
                  >
                    <Icon
                      name={s.icon}
                      size={20}
                      strokeWidth={1.75}
                      className="shrink-0 text-esi-blue"
                    />
                    <span>{l(s.name)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
