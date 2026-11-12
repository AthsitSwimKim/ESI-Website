import { useState } from 'react'
import { ClipboardList, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useT } from '@/i18n'
import { adminAuthErrorKey } from '@/lib/adminAuth'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { cn } from '@/lib/utils'

export function AdminAccountMenu({
  beforeLogout,
  onLogoutFailed,
  disabled = false,
}: {
  beforeLogout?: () => boolean
  onLogoutFailed?: () => void
  disabled?: boolean
}) {
  const { t } = useT()
  const auth = useAdminAuth()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  async function logout() {
    if (busy || disabled || (beforeLogout && !beforeLogout())) return
    setBusy(true)
    setError(false)
    try {
      await auth.logout()
    } catch (reason) {
      if (adminAuthErrorKey(reason) === 'sessionExpired') await auth.refresh()
      else setError(true)
      onLogoutFailed?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {auth.user?.role === 'admin' && (
        <Link
          to="/admin-portal-update/audit-logs"
          aria-current={location.pathname === '/admin-portal-update/audit-logs' ? 'page' : undefined}
          aria-disabled={disabled || undefined}
          onClick={(event) => {
            if (disabled) event.preventDefault()
          }}
          className={cn(
            'inline-flex min-h-11 items-center gap-2 rounded-sm px-1 text-sm font-semibold text-esi-blue hover:underline',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <ClipboardList size={16} aria-hidden />
          {t('audit.title')}
        </Link>
      )}
      <span className="max-w-40 truncate text-sm text-esi-muted" title={auth.user?.displayName}>
        {auth.user?.displayName || auth.user?.username}
      </span>
      <button
        type="button"
        disabled={busy || disabled}
        onClick={() => void logout()}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-esi-border bg-white px-3 py-2 text-sm font-semibold text-esi-blue transition-colors hover:bg-esi-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut size={16} aria-hidden />
        {t(busy ? 'auth.loggingOut' : 'auth.logout')}
      </button>
      {error && (
        <p role="alert" className="w-full max-w-xs text-xs text-esi-blue">
          {t('auth.logoutFailed')}
        </p>
      )}
    </div>
  )
}
