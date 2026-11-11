import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'

import { Seo } from '@/components/ui/Seo'
import { useT } from '@/i18n'
import {
  adminAuthApi,
  AdminAuthError,
  adminAuthRequiredEvent,
  adminLoginPath,
  isAdminLoginPath,
  type AdminUser,
} from '@/lib/adminAuth'
import { AdminAuthContext, type AdminAuthContextValue } from '@/lib/adminAuthContext'

/** This route owns authentication for the editor, previews and Login; public pages never fetch it. */
export function AdminAuthLayout() {
  const { t } = useT()
  const location = useLocation()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [phase, setPhase] = useState<AdminAuthContextValue['phase']>('loading')
  const [expired, setExpired] = useState(false)
  const operation = useRef({ id: 0, active: true })
  const authenticating = useRef(false)

  const refresh = useCallback(async () => {
    if (authenticating.current) return
    const control = operation.current
    const request = ++control.id
    try {
      const session = await adminAuthApi.session()
      if (!control.active || request !== control.id) return
      setUser(session.authenticated ? session.user : null)
      setPhase('ready')
    } catch {
      if (!control.active || request !== control.id) return
      // A failed background check must not discard open edits. A confirmed anonymous
      // session or API 401 still clears the user; protected APIs always fail closed.
      setPhase((current) => (current === 'loading' ? 'error' : current))
    }
  }, [])

  useEffect(() => {
    const control = operation.current
    control.active = true
    const request = ++control.id
    void adminAuthApi.session().then(
      (session) => {
        if (!control.active || request !== control.id) return
        setUser(session.authenticated ? session.user : null)
        setPhase('ready')
      },
      () => {
        if (!control.active || request !== control.id) return
        setUser(null)
        setPhase('error')
      },
    )
    const checkFocus = () => void refresh()
    const requireLogin = () => {
      ++control.id
      setUser(null)
      setExpired(true)
      setPhase('loading')
      void refresh()
    }
    window.addEventListener('focus', checkFocus)
    window.addEventListener(adminAuthRequiredEvent, requireLogin)
    return () => {
      control.active = false
      ++control.id
      window.removeEventListener('focus', checkFocus)
      window.removeEventListener(adminAuthRequiredEvent, requireLogin)
    }
  }, [refresh])

  const login = useCallback(async (username: string, password: string) => {
    authenticating.current = true
    const control = operation.current
    const request = ++control.id
    try {
      const session = await adminAuthApi.login(username, password)
      if (!session.authenticated || !session.user) throw new AdminAuthError('BACKEND_UNAVAILABLE')
      if (!control.active || request !== control.id) return
      setUser(session.user)
      setExpired(false)
      setPhase('ready')
    } finally {
      authenticating.current = false
    }
  }, [])

  const logout = useCallback(async () => {
    authenticating.current = true
    const control = operation.current
    const request = ++control.id
    try {
      await adminAuthApi.logout()
      if (!control.active || request !== control.id) return
      setUser(null)
      setExpired(false)
      setPhase('ready')
    } finally {
      authenticating.current = false
    }
  }, [])

  const value = useMemo(
    () => ({ user, phase, expired, refresh, login, logout }),
    [user, phase, expired, refresh, login, logout],
  )
  const isLogin = isAdminLoginPath(location.pathname)

  let content
  if (isLogin) content = <Outlet />
  else if (phase === 'error')
    content = (
      <div className="min-h-screen bg-esi-light px-5 py-16">
        <Seo title={`${t('auth.loginTitle')} | ESI`} path={location.pathname} />
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <main className="mx-auto max-w-xl rounded-sm border border-esi-border bg-white p-6 sm:p-8">
          <h1 className="display-title text-2xl text-esi-blue">{t('auth.loginTitle')}</h1>
          <span aria-hidden className="mt-3 block h-[3px] w-10 bg-esi-blue" />
          <p role="alert" className="mt-5 text-sm leading-relaxed text-esi-muted">
            {t('auth.unavailable')}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => {
                setPhase('loading')
                void refresh()
              }}
              className="min-h-11 rounded-sm bg-esi-blue px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-esi-secondary"
            >
              {t('admin.retry')}
            </button>
            <Link to="/" className="text-sm font-semibold text-esi-blue">
              {t('auth.backToWebsite')}
            </Link>
          </div>
        </main>
      </div>
    )
  else if (phase === 'loading' && !user)
    content = (
      <div className="min-h-screen bg-esi-light px-5 py-16">
        <Seo title={`${t('auth.loginTitle')} | ESI`} path={location.pathname} />
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <main className="mx-auto max-w-xl rounded-sm border border-esi-border bg-white p-6 sm:p-8">
          <h1 className="display-title text-2xl text-esi-blue">{t('auth.loginTitle')}</h1>
          <p role="status" className="mt-5 text-sm text-esi-muted">
            {t('auth.checkingSession')}
          </p>
        </main>
      </div>
    )
  else if (!user)
    content = (
      <Navigate
        replace
        to={adminLoginPath(location.pathname + location.search + location.hash, expired)}
      />
    )
  else content = <Outlet />

  return <AdminAuthContext value={value}>{content}</AdminAuthContext>
}
