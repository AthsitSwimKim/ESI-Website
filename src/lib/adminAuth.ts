export interface AdminUser {
  id: number
  username: string
  displayName: string
  role: 'admin' | 'editor'
}

export interface AdminSession {
  authenticated: boolean
  user: AdminUser | null
  csrfToken: string
}

export const adminAuthRequiredEvent = 'esi-admin-auth-required'

export class AdminAuthError extends Error {
  readonly code: string
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

let csrfToken = ''
let sessionRequest: Promise<AdminSession> | undefined

function hasUnsafeCharacters(value: string): boolean {
  return (
    value.includes('\\') ||
    [...value].some((character) => {
      const code = character.charCodeAt(0)
      return code < 32 || code === 127
    })
  )
}

export function isAdminLoginPath(pathname: string): boolean {
  try {
    return /^\/admin\/login\/?$/i.test(decodeURIComponent(pathname))
  } catch {
    return false
  }
}

/** Redirect only to this application's admin area, never to another origin or Login itself. */
export function safeAdminReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || hasUnsafeCharacters(value))
    return '/admin'
  try {
    const target = new URL(value, 'https://esi-admin.invalid')
    const pathname = decodeURIComponent(target.pathname)
    if (
      target.origin !== 'https://esi-admin.invalid' ||
      hasUnsafeCharacters(pathname) ||
      !(pathname === '/admin' || pathname.startsWith('/admin/')) ||
      /^\/admin\/login(?:\/|$)/i.test(pathname)
    )
      return '/admin'
    return target.pathname + target.search + target.hash
  } catch {
    return '/admin'
  }
}

export function adminLoginPath(returnTo: string, expired = false): string {
  const params = new URLSearchParams({ returnTo: safeAdminReturnTo(returnTo) })
  if (expired) params.set('expired', '1')
  return `/admin/login?${params}`
}

export function notifyAdminUnauthorized() {
  csrfToken = ''
  window.dispatchEvent(new Event(adminAuthRequiredEvent))
}

function isSession(value: unknown): value is AdminSession {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<AdminSession>
  if (typeof item.authenticated !== 'boolean' || typeof item.csrfToken !== 'string') return false
  if (!item.authenticated) return item.user === null
  const user = item.user
  return !!(
    user &&
    Number.isSafeInteger(user.id) &&
    user.id > 0 &&
    typeof user.username === 'string' &&
    typeof user.displayName === 'string' &&
    (user.role === 'admin' || user.role === 'editor')
  )
}

async function authRequest(path: string, body?: unknown): Promise<AdminSession> {
  let response: Response
  try {
    response = await fetch(`/api/admin/auth/${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(body === undefined
          ? {}
          : { 'Content-Type': 'application/json', 'X-ESI-CSRF': csrfToken }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new AdminAuthError('BACKEND_UNAVAILABLE')
  }
  if (!response.headers.get('content-type')?.includes('application/json'))
    throw new AdminAuthError('BACKEND_UNAVAILABLE')
  let result: unknown
  try {
    result = await response.json()
  } catch {
    throw new AdminAuthError('BACKEND_UNAVAILABLE')
  }
  if (!response.ok) {
    const code =
      result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
        ? result.error
        : 'BACKEND_UNAVAILABLE'
    if (code === 'AUTH_REQUIRED') notifyAdminUnauthorized()
    throw new AdminAuthError(code)
  }
  if (!isSession(result) || !result.csrfToken) throw new AdminAuthError('BACKEND_UNAVAILABLE')
  csrfToken = result.csrfToken
  return result
}

export const adminAuthApi = {
  session(): Promise<AdminSession> {
    sessionRequest ??= authRequest('session').finally(() => {
      sessionRequest = undefined
    })
    return sessionRequest
  },
  login: (username: string, password: string) => authRequest('login', { username, password }),
  logout: () => authRequest('logout', {}),
}

export async function requireAdminCsrfToken(): Promise<string> {
  if (!csrfToken) {
    const session = await adminAuthApi.session()
    if (!session.authenticated) {
      notifyAdminUnauthorized()
      throw new AdminAuthError('AUTH_REQUIRED')
    }
  }
  return csrfToken
}

export function adminAuthErrorKey(
  error: unknown,
): 'invalidCredentials' | 'rateLimited' | 'sessionExpired' | 'unavailable' {
  if (!(error instanceof AdminAuthError)) return 'unavailable'
  if (error.code === 'INVALID_CREDENTIALS') return 'invalidCredentials'
  if (error.code === 'RATE_LIMITED') return 'rateLimited'
  if (error.code === 'AUTH_REQUIRED' || error.code === 'CSRF_INVALID') return 'sessionExpired'
  return 'unavailable'
}
