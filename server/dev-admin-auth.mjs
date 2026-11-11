import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { flushAdminAudit } from './admin-audit.mjs'

const loopbackAddresses = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])
const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
const authRoutes = new Map([
  ['/api/admin/auth/session', 'GET'],
  ['/api/admin/auth/login', 'POST'],
  ['/api/admin/auth/logout', 'POST'],
  ['/api/admin/audit-logs', 'GET'],
])

export class AdminAuthError extends Error {
  constructor(code, status = 503) {
    super(code)
    this.code = code
    this.status = status
  }
}

function sendJson(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.end(JSON.stringify(body))
}

function assertLocalRequest(request) {
  let host
  try {
    host = new URL(`http://${request.headers.host ?? ''}`)
  } catch {
    throw new AdminAuthError('FORBIDDEN', 403)
  }
  if (!loopbackAddresses.has(request.socket.remoteAddress) || !loopbackHosts.has(host.hostname))
    throw new AdminAuthError('LOCAL_ONLY', 403)
  if (request.headers.origin) {
    let origin
    try {
      origin = new URL(request.headers.origin)
    } catch {
      throw new AdminAuthError('FORBIDDEN', 403)
    }
    if (!['http:', 'https:'].includes(origin.protocol) || origin.host !== host.host)
      throw new AdminAuthError('FORBIDDEN', 403)
  }
}

async function readBridge(root) {
  try {
    const config = JSON.parse(await readFile(path.join(root, '.esi-admin/dev/bridge.json'), 'utf8'))
    const endpoint = new URL(config.endpoint)
    if (
      endpoint.protocol !== 'http:' ||
      !loopbackHosts.has(endpoint.hostname) ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash ||
      endpoint.pathname !== '/' ||
      typeof config.internalKey !== 'string' ||
      config.internalKey.length < 32
    )
      throw new Error('Invalid local auth configuration')
    const profile = config.profile ?? 'local'
    if (!['local', 'chaiyo'].includes(profile)) throw new Error('Invalid profile')
    return { endpoint, internalKey: config.internalKey, profile }
  } catch {
    throw new AdminAuthError('AUTH_UNAVAILABLE')
  }
}

async function phpRequest(config, pathname, options) {
  let response
  try {
    response = await fetch(new URL(pathname, config.endpoint), {
      ...options,
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    })
    if (!response.headers.get('content-type')?.includes('application/json'))
      throw new Error('Not an auth response')
    const body = await response.json()
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new Error('Invalid auth response')
    return { response, body }
  } catch {
    throw new AdminAuthError('AUTH_UNAVAILABLE')
  }
}

/** Always check PHP's live session/user record; client flags and headers grant no access. */
export async function authorizeAdminRequest(root, request) {
  assertLocalRequest(request)
  const config = await readBridge(root)
  const { response, body } = await phpRequest(config, '/api/admin/auth/authorize', {
    headers: {
      'X-ESI-Internal-Key': config.internalKey,
      'X-ESI-Request-Method': request.method ?? 'GET',
      ...(request.headers.origin ? { 'X-ESI-Request-Origin': request.headers.origin } : {}),
      'X-ESI-CSRF': request.headers['x-esi-csrf'] ?? '',
      Cookie: request.headers.cookie ?? '',
    },
  })
  if (!response.ok)
    throw new AdminAuthError(
      typeof body.error === 'string' ? body.error : 'AUTH_REQUIRED',
      [401, 403, 429].includes(response.status) ? response.status : 503,
    )
  if (body.authenticated !== true || !body.user || !['admin', 'editor'].includes(body.user.role))
    throw new AdminAuthError('AUTH_REQUIRED', 401)
  return { ...body.user, auditScope: auditScope(config) }
}

function auditScope(config) {
  return config.profile === 'chaiyo' ? 'chaiyo:esithcom_website' : `local:${config.endpoint.href}`
}

export async function flushAdminAuditEvents(root) {
  const config = await readBridge(root)
  return flushAdminAudit(root, auditScope(config), async (event) => {
    const upstream = await phpRequest(config, '/api/admin/audit-events', {
      method: 'POST',
      headers: { 'X-ESI-Internal-Key': config.internalKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
    if (
      !upstream.response.ok ||
      upstream.body.accepted !== true ||
      upstream.body.eventId !== event.eventId
    )
      throw new AdminAuthError('AUDIT_UNAVAILABLE')
    return true
  })
}

function privateDevPath(url, root) {
  let pathname = url.split('?')[0]
  try {
    for (let index = 0; index < 3; index++) {
      const decoded = decodeURIComponent(pathname)
      if (decoded === pathname) break
      pathname = decoded
    }
  } catch {
    return true
  }
  pathname = pathname.replaceAll('\\', '/').toLowerCase()
  // An isolated audit project itself lives below .esi-admin. Match private
  // descendants of its root, rather than banning the audit root's ancestors.
  const normalizedRoot = path.resolve(root).replaceAll('\\', '/').toLowerCase()
  if (pathname.startsWith('/@fs/' + normalizedRoot + '/'))
    pathname = pathname.slice(5 + normalizedRoot.length)
  return (
    /(?:^|\/)\.(?:esi-admin|git)(?:\/|$)/.test(pathname) ||
    /(?:^|\/)\.env(?:\.|\/|$)/.test(pathname) ||
    /(?:^|\/)server\/php(?:\/|$)/.test(pathname)
  )
}

/** Dev-only proxy, and a guard against accidentally serving local credentials as Vite files. */
export function devAdminAuthPlugin() {
  return {
    name: 'esi-dev-admin-auth',
    apply: 'serve',
    config(config) {
      const root = path.resolve(config.root ?? process.cwd()).replaceAll('\\', '/')
      return {
        server: {
          fs: {
            deny: [
              '.env',
              '.env.*',
              '*.{crt,pem}',
              '**/.git/**',
              `${root}/.esi-admin/**`,
              `${root}/server/php/**`,
            ],
          },
        },
      }
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (privateDevPath(request.url ?? '/', server.config.root))
          return sendJson(response, 404, { error: 'NOT_FOUND' })
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
        if (pathname === '/api/admin/audit-events')
          return sendJson(response, 404, { error: 'NOT_FOUND' })
        const auditList = pathname === '/api/admin/audit-logs'
        if (!pathname.startsWith('/api/admin/auth') && !auditList) return next()
        try {
          assertLocalRequest(request)
          const method = authRoutes.get(pathname)
          if (!method) return sendJson(response, 404, { error: 'NOT_FOUND' })
          if (request.method !== method)
            return sendJson(response, 405, { error: 'METHOD_NOT_ALLOWED' })
          const config = await readBridge(server.config.root)
          if (auditList) {
            const actor = await authorizeAdminRequest(server.config.root, request)
            if (actor.role !== 'admin') throw new AdminAuthError('FORBIDDEN', 403)
            await flushAdminAuditEvents(server.config.root)
          }
          let body
          if (method === 'POST') {
            if (!request.headers['content-type']?.startsWith('application/json'))
              throw new AdminAuthError('INVALID_REQUEST', 400)
            const chunks = []
            let length = 0
            for await (const chunk of request) {
              length += chunk.length
              if (length > 8192) throw new AdminAuthError('TOO_LARGE', 413)
              chunks.push(chunk)
            }
            body = Buffer.concat(chunks)
          }
          const upstream = await phpRequest(
            config,
            pathname + (auditList ? new URL(request.url, 'http://localhost').search : ''),
            {
              method,
              headers: {
                'Content-Type': 'application/json',
                ...(request.headers.origin ? { Origin: request.headers.origin } : {}),
                Cookie: request.headers.cookie ?? '',
                'X-ESI-CSRF': request.headers['x-esi-csrf'] ?? '',
              },
              body,
            },
          )
          const cookies = upstream.response.headers.getSetCookie()
          if (cookies.length) response.setHeader('Set-Cookie', cookies)
          sendJson(response, upstream.response.status, upstream.body)
        } catch (error) {
          sendJson(response, error instanceof AdminAuthError ? error.status : 503, {
            error: error instanceof AdminAuthError ? error.code : 'AUTH_UNAVAILABLE',
          })
        }
      })
    },
  }
}
