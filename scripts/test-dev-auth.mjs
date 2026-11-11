/** Real PHP/PDO/MySQL authentication checks in a disposable, loopback-only DEV database. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { startDevAuth } from './dev-auth.mjs'
import { runAuditHttpChecks } from '../server/php/tests/audit-http.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const testRoot = path.resolve(root, '.esi-admin/dev/auth-tests')
const privateRoot = path.resolve(testRoot, randomUUID())
const origin = 'http://localhost:5173'
const sha256 = (value) => createHash('sha256').update(value).digest('hex')
let checks = 0
let runtime

const check = (condition, message) => {
  assert.ok(condition, message)
  checks++
}

function php(binary, ini, filename, args = [], extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, ['-c', ini, filename, ...args], {
      cwd: root,
      env: { ...process.env, ...extraEnv },
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (data) => {
      stdout += data
    })
    child.stderr.on('data', (data) => {
      stderr += data
    })
    child.once('error', reject)
    child.once('close', (code) => {
      if (code === 0) resolve(stdout.trim())
      else reject(new Error(`PHP auth test failed (exit ${code}): ${stderr.slice(0, 300)}`))
    })
  })
}

class Client {
  cookies = new Map()
  csrf = null

  cookieHeader() {
    return [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; ')
  }

  async request(
    route,
    { method = 'GET', body, headers = {}, originHeader = origin, includeCsrf = true } = {},
  ) {
    const requestHeaders = { Cookie: this.cookieHeader(), ...headers }
    if (originHeader !== null) requestHeaders.Origin = originHeader
    if (body !== undefined) requestHeaders['Content-Type'] = 'application/json'
    if (includeCsrf && this.csrf) requestHeaders['X-ESI-CSRF'] = this.csrf
    const response = await fetch(runtime.endpoint + route, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    })
    const setCookies = response.headers.getSetCookie()
    for (const cookie of setCookies) {
      const pair = cookie.split(';', 1)[0]
      const equals = pair.indexOf('=')
      const name = pair.slice(0, equals)
      const value = pair.slice(equals + 1)
      const expires = /;\s*expires=([^;]+)/i.exec(cookie)?.[1]
      const maxAge = /;\s*max-age=(-?\d+)/i.exec(cookie)?.[1]
      if (
        value === '' ||
        (expires && Date.parse(expires) <= Date.now()) ||
        (maxAge && Number(maxAge) <= 0)
      )
        this.cookies.delete(name)
      else this.cookies.set(name, value)
    }
    check(
      response.headers.get('cache-control')?.includes('no-store'),
      'all authentication responses use no-store',
    )
    check(response.headers.get('x-powered-by') === null, 'PHP version header is removed')
    const result = await response.json()
    if (result.csrfToken) this.csrf = result.csrfToken
    return { response, result, setCookies }
  }

  async session() {
    return this.request('/api/admin/auth/session')
  }
  async login(password = runtime.password, username = runtime.username, options = {}) {
    return this.request('/api/admin/auth/login', {
      method: 'POST',
      body: { username, password },
      ...options,
    })
  }
  async authorize(method = 'GET', options = {}) {
    return this.request('/api/admin/auth/authorize', {
      ...options,
      headers: {
        'X-ESI-Internal-Key': runtime.internalKey,
        'X-ESI-Request-Method': method,
        'X-ESI-Request-Origin': origin,
        ...options.headers,
      },
    })
  }
}

async function mutate(action, client, extraEnv = {}) {
  const token = client?.cookies.get('esi_admin_dev_session')
  const result = await php(
    runtime.php,
    runtime.phpIni,
    path.join(root, 'server/php/tests/dev-state.php'),
    [action],
    {
      ESI_ADMIN_CONFIG: runtime.configFile,
      ESI_AUTH_TEST: '1',
      ESI_TEST_SESSION_HASH: token ? sha256(token) : '',
      ESI_TEST_CSRF_HASH: client?.csrf ? sha256(client.csrf) : '',
      ...extraEnv,
    },
  )
  return JSON.parse(result)
}

try {
  runtime = await startDevAuth({
    root,
    privateRoot,
    origins: [origin],
    port: 0,
    writeBridge: false,
  })
  const unitOutput = await php(
    runtime.php,
    runtime.phpIni,
    path.join(root, 'server/php/tests/auth-service.php'),
  )
  console.log(unitOutput)

  const client = new Client()
  const anonymous = await client.session()
  check(
    anonymous.response.status === 200 &&
      anonymous.result.authenticated === false &&
      anonymous.result.user === null,
    'anonymous session is explicit',
  )
  check(/^[A-Za-z0-9_-]{43}$/.test(client.csrf), 'anonymous CSRF supplied')
  check(
    anonymous.setCookies.some(
      (cookie) =>
        cookie.includes('_csrf=') && /HttpOnly/i.test(cookie) && /SameSite=Strict/i.test(cookie),
    ),
    'anonymous CSRF cookie is HttpOnly and SameSite Strict',
  )
  check(
    (await client.login(runtime.password, runtime.username, { includeCsrf: false })).response
      .status === 403,
    'missing CSRF rejected',
  )
  check(
    (
      await client.login(runtime.password, runtime.username, {
        headers: { 'X-ESI-CSRF': 'wrong' },
        includeCsrf: false,
      })
    ).response.status === 403,
    'invalid CSRF rejected',
  )
  check(
    (
      await client.login(runtime.password, runtime.username, {
        originHeader: 'https://evil.example',
      })
    ).response.status === 403,
    'cross-origin login rejected',
  )
  check(
    (await client.login(runtime.password, runtime.username, { originHeader: null })).response
      .status === 403,
    'missing Origin rejected',
  )
  const wrong = await client.login('wrong-test-password')
  const unknown = await client.login(runtime.password, 'unknown_dev_user')
  check(
    wrong.response.status === 401 && unknown.response.status === 401,
    'wrong/unknown credentials rejected',
  )
  check(
    JSON.stringify(wrong.result) === JSON.stringify(unknown.result),
    'unknown account and wrong password share generic error',
  )
  const beforeLoginCsrf = client.csrf
  const login = await client.login()
  check(
    login.response.status === 200 &&
      login.result.authenticated === true &&
      login.result.user.username === runtime.username,
    'correct password authenticates through PHP PDO',
  )
  check(
    !('token' in login.result) &&
      !('password_hash' in login.result.user) &&
      !('password' in login.result.user),
    'credentials and bearer token are not JSON fields',
  )
  check(client.csrf !== beforeLoginCsrf, 'login rotates CSRF token')
  const sessionCookie = login.setCookies.find((cookie) =>
    cookie.startsWith('esi_admin_dev_session='),
  )
  check(
    sessionCookie &&
      /HttpOnly/i.test(sessionCookie) &&
      /SameSite=Strict/i.test(sessionCookie) &&
      /path=\/api\/admin/i.test(sessionCookie),
    'session cookie has correct security/path flags',
  )
  check(
    !/;\s*secure(?:;|$)/i.test(sessionCookie),
    'HTTP cookie exception is limited to local development configuration',
  )
  check(
    (await mutate('session-storage', client)).matching_sessions === 1,
    'database stores matching SHA-256 bearer/CSRF hashes only',
  )
  check(
    (await client.session()).result.authenticated === true,
    'cookie restores authenticated session',
  )
  check(
    (await client.request('/api/admin/auth/authorize')).response.status === 403,
    'public call cannot use internal authorization endpoint',
  )
  check(
    (
      await client.request('/api/admin/auth/authorize', {
        headers: { 'X-ESI-Internal-Key': 'wrong' },
      })
    ).response.status === 403,
    'wrong internal key rejected',
  )
  check(
    (await client.authorize()).response.status === 200,
    'server-side authorization accepts authenticated cookie',
  )
  check(
    (await client.authorize('POST')).response.status === 200,
    'authorized mutation requires valid CSRF and origin',
  )
  check(
    (await client.authorize('POST', { includeCsrf: false })).response.status === 403,
    'server-side mutations reject missing CSRF',
  )
  check(
    (
      await client.authorize('POST', {
        headers: {
          'X-ESI-Internal-Key': runtime.internalKey,
          'X-ESI-Request-Method': 'POST',
          'X-ESI-Request-Origin': 'https://evil.example',
        },
      })
    ).response.status === 403,
    'server-side mutations reject original cross-origin request',
  )

  await runAuditHttpChecks({ runtime, Client, client, check, mutate })

  const old = new Client()
  old.cookies = new Map(client.cookies)
  old.csrf = client.csrf
  const oldToken = client.cookies.get('esi_admin_dev_session')
  check((await client.login()).response.status === 200, 'reauthentication succeeds')
  check(
    client.cookies.get('esi_admin_dev_session') !== oldToken,
    'reauthentication rotates bearer token',
  )
  check(
    (await old.authorize()).response.status === 401,
    'old bearer token cannot be replayed after rotation',
  )
  check(
    (
      await client.request('/api/admin/auth/logout', {
        method: 'POST',
        body: {},
        originHeader: 'https://evil.example',
      })
    ).response.status === 403,
    'cross-origin logout rejected',
  )
  const loggedOutToken = client.cookies.get('esi_admin_dev_session')
  const logout = await client.request('/api/admin/auth/logout', { method: 'POST', body: {} })
  check(
    logout.response.status === 200 &&
      logout.result.authenticated === false &&
      logout.result.user === null,
    'logout returns anonymous state and fresh CSRF',
  )
  check(!client.cookies.has('esi_admin_dev_session'), 'logout clears bearer cookie')
  const replay = new Client()
  replay.cookies.set('esi_admin_dev_session', loggedOutToken)
  check(
    (await replay.authorize()).response.status === 401,
    'logout revokes stored session against replay',
  )

  check((await client.login()).response.status === 200, 'login after logout succeeds')
  const disabledToken = client.cookies.get('esi_admin_dev_session')
  check(
    (await mutate('disable-user')).updated === 1,
    'test user disabled directly in isolated database',
  )
  check(
    (await client.session()).result.authenticated === false,
    'disabled account cannot retain session',
  )
  check(
    (await mutate('enable-user')).updated === 1,
    'test user re-enabled for remaining isolated tests',
  )
  replay.cookies.set('esi_admin_dev_session', disabledToken)
  check(
    (await replay.authorize()).response.status === 401,
    'session revoked by disable remains invalid after re-enable',
  )

  check((await client.login()).response.status === 200, 'login before idle-expiry test succeeds')
  check(
    (await mutate('idle-session', client)).updated === 1,
    'session aged past idle threshold in isolated database',
  )
  check(
    (await client.session()).result.authenticated === false,
    'idle session expires through actual HTTP/PDO path',
  )
  check(
    (await client.login()).response.status === 200,
    'login before absolute-expiry test succeeds',
  )
  check(
    (await mutate('expire-session', client)).updated === 1,
    'session absolute expiry set in isolated database',
  )
  check(
    (await client.session()).result.authenticated === false,
    'absolute session expiration enforced through HTTP/PDO',
  )

  for (let index = 0; index < 5; index++)
    check(
      (await client.login('wrong-rate-test')).response.status === 401,
      'failed login below threshold has generic error',
    )
  const limited = await client.login('wrong-rate-test')
  check(
    limited.response.status === 429 &&
      limited.result.error === 'RATE_LIMITED' &&
      Number(limited.response.headers.get('retry-after')) > 0,
    'sixth failed attempt is persistently rate limited',
  )
  check(
    (await client.request('/api/admin/auth/login')).response.status === 405,
    'login rejects GET',
  )
  check(
    (await client.request('/src/Config.php')).response.status === 404,
    'PHP sources are not served by the router',
  )
  console.log(`PHP/MySQL HTTP authentication checks passed: ${checks}`)
} finally {
  try {
    await runtime?.stop()
  } catch {
    console.error('Stopping the isolated authentication runtime failed.')
    process.exitCode = 1
  }
  const resolvedTestRoot = path.resolve(testRoot)
  const resolvedPrivateRoot = path.resolve(privateRoot)
  if (
    path.dirname(resolvedPrivateRoot) !== resolvedTestRoot ||
    !resolvedPrivateRoot.startsWith(resolvedTestRoot + path.sep)
  ) {
    console.error('Refusing to remove a test path outside the isolated auth-tests directory.')
    process.exitCode = 1
  } else {
    try {
      await rm(resolvedPrivateRoot, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 250,
      })
    } catch (error) {
      // Preserve the real test failure if a Windows process briefly retains a file lock.
      console.error(`Isolated auth-test cleanup deferred (${error.code || 'UNKNOWN'}).`)
      process.exitCode = 1
    }
  }
}
