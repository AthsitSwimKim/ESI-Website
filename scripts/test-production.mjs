/** Exercise the EXTRACTED release ZIP against disposable local SQL, never Chaiyo. */
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { randomUUID, createHash, randomBytes } from 'node:crypto'
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import { chromium } from 'playwright'
import { startDevAuth } from './dev-auth.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const directory = path.join(root, '.esi-admin/production-tests', randomUUID())
const extracted = path.join(directory, 'extracted')
await mkdir(directory, { recursive: true })
function command(binary, args) {
  const result = spawnSync(binary, args, { windowsHide: true, encoding: 'utf8' })
  if (result.status !== 0) throw new Error('Test command failed: ' + result.stderr?.slice(0, 300))
  return result.stdout
}
let runtime, php, proxy, browser
let checks = 0
const check = (condition, message) => {
  assert.ok(condition, message)
  ++checks
}
const port = async () => {
  const server = net.createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const result = server.address().port
  await new Promise((resolve) => server.close(resolve))
  return result
}
const web = path.join(extracted, 'httpdocs')
const privateRoot = path.join(extracted, '.esi-admin-production')
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
const files = async (folder) => {
  const result = []
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const filename = path.join(folder, entry.name)
    if (entry.isDirectory()) result.push(...(await files(filename)))
    else result.push(filename)
  }
  return result
}
try {
  // Inspect RAW central/local entry names: Windows extractors silently accept invalid backslashes.
  const zipBytes = await readFile(path.join(root, 'ESI-Chaiyo-Hosting.zip'))
  const end = zipBytes.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  check(end >= zipBytes.length - 65557 && end >= 0, 'ZIP has an end-of-central-directory record')
  const entries = zipBytes.readUInt16LE(end + 10)
  let offset = zipBytes.readUInt32LE(end + 16)
  for (let i = 0; i < entries; ++i) {
    check(zipBytes.readUInt32LE(offset) === 0x02014b50, 'valid central entry header')
    const length = zipBytes.readUInt16LE(offset + 28)
    const name = zipBytes.subarray(offset + 46, offset + 46 + length).toString('utf8')
    check(
      !name.includes('\\') && !name.startsWith('/') && !name.split('/').includes('..'),
      'ZIP entry uses safe forward-slash path: ' + name,
    )
    const local = zipBytes.readUInt32LE(offset + 42)
    check(
      zipBytes.readUInt32LE(local) === 0x04034b50 &&
        zipBytes
          .subarray(local + 30, local + 30 + zipBytes.readUInt16LE(local + 26))
          .toString('utf8') === name,
      'local header matches portable entry name',
    )
    offset += 46 + length + zipBytes.readUInt16LE(offset + 30) + zipBytes.readUInt16LE(offset + 32)
  }
  // Use Info-ZIP unzip, the same extractor family as Plesk, and require exit 0 with no warnings.
  const unpack = spawnSync(
    'C:/Program Files/Git/usr/bin/unzip.exe',
    ['-q', path.join(root, 'ESI-Chaiyo-Hosting.zip'), '-d', extracted],
    { windowsHide: true, encoding: 'utf8' },
  )
  check(
    unpack.status === 0 && unpack.stderr.trim() === '',
    'Info-ZIP extracts the release without warnings',
  )
  check(
    !(await files(extracted)).some((f) =>
      /(?:config\.php|state\.json|connection\.json|credentials)/.test(path.relative(extracted, f)),
    ),
    'release ZIP contains no live config, state or credentials',
  )
  // Verify every extracted entry against the prepared staging artifact.
  for (const filename of await files(extracted)) {
    const relative = path.relative(extracted, filename)
    check(
      hash(await readFile(filename)) ===
        hash(await readFile(path.join(root, '.esi-admin/packages/chaiyo', relative))),
      'ZIP entry matches staged file: ' + relative,
    )
  }
  for (const filename of await files(path.join(privateRoot, 'src'))) {
    check(
      hash(await readFile(filename)) ===
        hash(await readFile(path.join(root, 'server/php/src', path.basename(filename)))),
      'packaged PHP matches current source',
    )
  }
  const phpPort = await port(),
    httpsPort = await port()
  const origin = `https://localhost:${httpsPort}`
  runtime = await startDevAuth({
    privateRoot: path.join(directory, 'runtime'),
    port: 0,
    origins: [origin],
    writeBridge: false,
  })
  const originalConfig = await readFile(runtime.configFile, 'utf8')
  // The extracted code runs in production mode with Secure cookies and the local isolated DB.
  const configuration = originalConfig
    .replace("'environment' => 'development'", "'environment' => 'production'")
    .replace("'cookie_secure' => false", "'cookie_secure' => true")
    .replace(/'private_directory' => '[^']*'/, "'private_directory' => __DIR__ . '/data'")
  await writeFile(path.join(privateRoot, 'config.php'), configuration)
  const cert = path.join(directory, 'cert.pem'),
    key = path.join(directory, 'key.pem')
  command('C:/Program Files/Git/usr/bin/openssl.exe', [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-keyout',
    key,
    '-out',
    cert,
    '-days',
    '1',
    '-subj',
    '/CN=localhost',
    '-addext',
    'subjectAltName=DNS:localhost,IP:127.0.0.1',
  ])
  const testToken = randomBytes(32).toString('hex')
  const phpQuote = (s) => "'" + s.replaceAll('\\', '\\\\').replaceAll("'", "\\'") + "'"
  // Test-only router models Apache rewriting. It is OUTSIDE the extracted deployable ZIP.
  const router = path.join(directory, 'router.php')
  await writeFile(
    router,
    `<?php
if (($_SERVER['HTTP_X_ESI_TEST_HTTPS'] ?? '') === '${testToken}') $_SERVER['HTTPS'] = 'on';
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('~(^|/)\\.|\\.(tmp|ini)$~', rawurldecode($path))) { http_response_code(403); exit; }
if (str_starts_with($path, '/api/') || $path === '/sitemap.xml') require ${phpQuote(path.join(web, 'api/index.php'))};
if (is_file($_SERVER['DOCUMENT_ROOT'] . $path)) return false;
readfile($_SERVER['DOCUMENT_ROOT'] . '/index.html');
`,
  )
  for (const filename of (await files(privateRoot)).filter((f) => f.endsWith('.php'))) {
    command(runtime.php, ['-c', runtime.phpIni, '-l', filename])
    checks++
  }
  php = spawn(
    runtime.php,
    ['-c', runtime.phpIni, '-S', `127.0.0.1:${phpPort}`, '-t', web, router],
    { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] },
  )
  let phpErrors = ''
  php.stderr.on('data', (data) => {
    phpErrors += data
  })
  await new Promise((resolve, reject) => {
    const deadline = Date.now() + 10000
    const poll = () => {
      const socket = net.connect(phpPort, '127.0.0.1')
      socket.once('connect', () => {
        socket.destroy()
        resolve()
      })
      socket.once('error', () => {
        if (Date.now() > deadline) reject(new Error('PHP test server did not start'))
        else setTimeout(poll, 100)
      })
    }
    poll()
  })
  proxy = https.createServer(
    { key: await readFile(key), cert: await readFile(cert) },
    (request, response) => {
      const upstream = http.request(
        {
          host: '127.0.0.1',
          port: phpPort,
          path: request.url,
          method: request.method,
          headers: { ...request.headers, 'x-esi-test-https': testToken },
        },
        (res) => {
          response.writeHead(res.statusCode, res.headers)
          res.pipe(response)
        },
      )
      upstream.on('error', () => {
        response.writeHead(502)
        response.end()
      })
      request.pipe(upstream)
    },
  )
  await new Promise((resolve) => proxy.listen(httpsPort, '127.0.0.1', resolve))
  class Client {
    cookies = new Map()
    csrf = null
    async request(
      route,
      {
        body,
        headers = {},
        method = body === undefined ? 'GET' : 'POST',
        csrf = true,
        cookies = true,
        raw = false,
      } = {},
    ) {
      const bytes = body === undefined ? undefined : JSON.stringify(body)
      const response = await new Promise((resolve, reject) => {
        const request = https.request(
          origin + route,
          {
            family: 4,
            rejectUnauthorized: false,
            method,
            headers: {
              Origin: origin,
              ...(cookies
                ? { Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ') }
                : {}),
              ...(bytes
                ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bytes) }
                : {}),
              ...(csrf && this.csrf ? { 'X-ESI-CSRF': this.csrf } : {}),
              'X-ESI-Admin': '1',
              ...headers,
            },
          },
          (res) => {
            const chunks = []
            res.on('data', (chunk) => chunks.push(chunk))
            res.on('end', () =>
              resolve({
                status: res.statusCode,
                headers: res.headers,
                bytes: Buffer.concat(chunks),
              }),
            )
          },
        )
        request.on('error', reject)
        request.end(bytes)
      })
      for (const cookie of response.headers['set-cookie'] ?? []) {
        const [pair] = cookie.split(';'),
          equal = pair.indexOf('=')
        const name = pair.slice(0, equal),
          value = pair.slice(equal + 1)
        if (!value) this.cookies.delete(name)
        else this.cookies.set(name, value)
      }
      if (!raw) {
        check(
          response.headers['content-type']?.includes('application/json'),
          'API responds JSON for ' + route,
        )
        check(response.headers['cache-control']?.includes('no-store'), 'API responses never cached')
        response.data = JSON.parse(response.bytes)
        if (response.data.csrfToken) this.csrf = response.data.csrfToken
      }
      return response
    }
  }
  const anonymous = new Client(),
    client = new Client()
  const seed = JSON.parse(await readFile(path.join(privateRoot, 'seed.json'), 'utf8'))
  const publicImages = new Set(
    seed.projects.flatMap((project) => [project.image, ...(project.gallery ?? [])]),
  )
  for (const filename of await files(path.join(web, 'images/uploads'))) {
    check(
      path.basename(filename) === '.htaccess' ||
        publicImages.has('/images/uploads/' + path.basename(filename)),
      'ZIP excludes private draft uploads',
    )
  }
  check(
    (await anonymous.request('/api/admin/projects')).status === 401,
    'unauthenticated projects denied',
  )
  check(
    (await anonymous.request('/api/admin/audit-logs')).status === 401,
    'unauthenticated audit denied',
  )
  check(
    (await anonymous.request('/api/admin/auth/authorize')).status === 404,
    'Dev authorization bridge absent',
  )
  check(
    (await anonymous.request('/api/admin/audit-events')).status === 404,
    'Dev ingest bridge absent',
  )
  const plain = await fetch(`http://127.0.0.1:${phpPort}/api/admin/auth/session`)
  check(plain.status === 403, 'production denies plain HTTP')
  const initial = await anonymous.request('/api/projects')
  check(initial.data.projects.length === seed.projects.length, 'public feed serves packaged seeds')
  check(
    !initial.bytes.toString().includes('csrfToken'),
    'public feed contains no authentication material',
  )
  await client.request('/api/admin/auth/session')
  const login = await client.request('/api/admin/auth/login', {
    body: { username: runtime.username, password: runtime.password },
  })
  check(
    login.status === 200 && login.data.authenticated,
    'login works from extracted production API',
  )
  check(
    login.headers['set-cookie'].some(
      (cookie) =>
        /secure/i.test(cookie) && /httponly/i.test(cookie) && /samesite=strict/i.test(cookie),
    ),
    'production Secure HttpOnly SameSite cookie',
  )
  check(
    !(
      await client.request('/api/admin/projects', {
        headers: { Origin: 'https://attacker.invalid' },
      })
    ).status
      .toString()
      .startsWith('2'),
    'foreign Origin denied',
  )
  const workspace = (await client.request('/api/admin/projects')).data
  const project = {
    ...seed.projects[0],
    id: workspace.nextId,
    slug: 'isolated-production-test',
    title: 'Production package test',
    featured: false,
    gallery: [],
  }
  const mutation = { project, revision: workspace.revision, isNew: true }
  check(
    (await client.request('/api/admin/projects/save', { body: mutation, csrf: false })).status ===
      403,
    'write requires CSRF',
  )
  let result = await client.request('/api/admin/projects/save', { body: mutation })
  check(result.status === 200 && result.data.draftIds.includes(project.id), 'save draft works')
  check(
    !(await anonymous.request('/api/projects')).data.projects.some((p) => p.id === project.id),
    'draft excluded from public feed',
  )
  // An unavailable audit table must not lose a successfully saved project or its event.
  // This helper touches only the disposable local database initialized above.
  const sqlHelper = path.join(directory, 'audit-outage.php')
  await writeFile(
    sqlHelper,
    `<?php
$config = require ${phpQuote(path.join(directory, 'runtime/bootstrap-config.php'))};
$pdo = new PDO($config['dsn'], $config['username'], $config['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
if ($argv[1] === 'pause') $pdo->exec('RENAME TABLE admin_events TO admin_events_test_paused');
if ($argv[1] === 'restore') $pdo->exec('RENAME TABLE admin_events_test_paused TO admin_events');
`,
  )
  command(runtime.php, ['-c', runtime.phpIni, sqlHelper, 'pause'])
  let pendingEvent
  try {
    result = await client.request('/api/admin/projects/save', {
      body: {
        project: { ...project, description: 'Updated while audit delivery was unavailable' },
        revision: result.data.revision,
      },
    })
    check(result.status === 200, 'draft update survives temporary SQL audit outage')
    const queued = JSON.parse(
      await readFile(path.join(privateRoot, 'data/projects/state.json'), 'utf8'),
    )
    check(
      queued.outbox.length === 1 && queued.outbox[0].action === 'save_draft',
      'event persisted durably while SQL unavailable',
    )
    pendingEvent = queued.outbox[0]
  } finally {
    command(runtime.php, ['-c', runtime.phpIni, sqlHelper, 'restore'])
  }
  const recoveredAudit = (await client.request('/api/admin/audit-logs')).data
  check(
    recoveredAudit.items.some(
      (item) => item.action === 'save_draft' && item.details.projectId === project.id,
    ),
    'pending event delivered after SQL recovery',
  )
  const replayState = JSON.parse(
    await readFile(path.join(privateRoot, 'data/projects/state.json'), 'utf8'),
  )
  replayState.outbox.push(pendingEvent)
  await writeFile(path.join(privateRoot, 'data/projects/state.json'), JSON.stringify(replayState))
  const replayAudit = (await client.request('/api/admin/audit-logs')).data
  check(
    replayAudit.total === recoveredAudit.total,
    'retry after acknowledged delivery never duplicates SQL audit records',
  )
  check(
    (await client.request('/api/admin/projects/save', { body: mutation })).status === 409,
    'stale revision cannot overwrite work',
  )
  check(
    (
      await client.request('/api/admin/projects/publish', {
        body: {
          project: { ...project, image: '/images/../../config.php' },
          revision: result.data.revision,
        },
      })
    ).status === 400,
    'path traversal image rejected',
  )
  check(
    (
      await client.request('/api/admin/projects/publish', {
        body: {
          project: { ...project, image: 'data:image/png;base64,PD9waHAgZWNobyAxOw==' },
          revision: result.data.revision,
        },
      })
    ).status === 400,
    'script disguised as image rejected',
  )
  // Valid tiny PNG exercises storage from bytes, hashed name and real image verification.
  const png =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8ioAAAAASUVORK5CYII='
  result = await client.request('/api/admin/projects/publish', {
    body: {
      project: { ...project, image: 'data:image/png;base64,' + png },
      revision: result.data.revision,
    },
  })
  check(
    result.status === 200 &&
      result.data.publishedIds.includes(project.id) &&
      !result.data.draftIds.includes(project.id),
    'publish removes draft and exposes public record',
  )
  const published = result.data.project
  check(
    /^\/images\/uploads\/[a-f0-9]{64}\.png$/.test(published.image),
    'image stored using content hash',
  )
  const image = await anonymous.request(published.image, { raw: true })
  check(
    image.status === 200 && hash(image.bytes) === hash(Buffer.from(png, 'base64')),
    'published image served from extracted web root',
  )
  check(
    (await anonymous.request('/api/projects')).data.projects.some((p) => p.slug === project.slug),
    'public feed reflects publish without rebuilding',
  )
  const sitemap = await anonymous.request('/sitemap.xml', { raw: true })
  check(
    sitemap.bytes.toString().includes('/projects/' + project.slug),
    'sitemap includes new publication',
  )
  const audit = (await client.request('/api/admin/audit-logs')).data
  for (const action of ['login', 'save_draft', 'publish', 'upload'])
    check(
      audit.items.some((item) => item.action === action),
      'SQL audit contains ' + action,
    )
  check(
    audit.items.some((item) => item.result === 'failure' && item.details.reason === 'CONFLICT'),
    'failed mutation recorded in SQL audit',
  )
  const stored = JSON.parse(
    await readFile(path.join(privateRoot, 'data/projects/state.json'), 'utf8'),
  )
  check(stored.outbox.length === 0, 'durable outbox acknowledged by SQL')
  check(
    !JSON.stringify(stored).includes(runtime.password),
    'project state contains no login password',
  )
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(origin + '/projects/' + project.slug)
  await page.getByRole('heading', { name: project.title, exact: true }).waitFor()
  check(true, 'production React resolves dynamically published detail on direct navigation')
  await page.goto(origin + '/admin/login')
  await page.getByLabel('Username', { exact: true }).fill(runtime.username)
  await page.getByLabel('Password', { exact: true }).fill(runtime.password)
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await page.waitForURL('**/admin', { timeout: 15000 })
  check(true, 'browser logs in with Secure cookies against actual extracted production assets')
  await page.goto(origin + '/admin/audit-logs')
  await page.getByRole('heading', { name: /audit/i }).first().waitFor()
  await mkdir(path.join(root, 'screenshots/production'), { recursive: true })
  await page.screenshot({
    path: path.join(root, 'screenshots/production/audit-log.png'),
    fullPage: true,
  })
  check(errors.length === 0, 'no browser page errors')
  await browser.close()
  browser = null
  result = await client.request('/api/admin/projects/unpublish', {
    body: { id: project.id, revision: result.data.revision },
  })
  check(
    result.status === 200 && result.data.draftIds.includes(project.id),
    'unpublish preserves editable draft',
  )
  check(
    !(await anonymous.request('/api/projects')).data.projects.some((p) => p.id === project.id),
    'unpublished record removed from public feed',
  )
  check(
    !(await anonymous.request('/sitemap.xml', { raw: true })).bytes
      .toString()
      .includes('/projects/' + project.slug),
    'unpublished record removed from sitemap',
  )
  result = await client.request('/api/admin/projects/remove', {
    body: { id: project.id, revision: result.data.revision },
  })
  check(
    result.status === 200 && !result.data.projects.some((p) => p.id === project.id),
    'delete removes draft',
  )
  const savedCookies = new Map(client.cookies)
  check(
    (await client.request('/api/admin/auth/logout', { body: {} })).status === 200,
    'logout succeeds',
  )
  client.cookies = savedCookies
  check(
    (await client.request('/api/admin/projects')).status === 401,
    'logout revokes session server-side',
  )
  check(!phpErrors.includes('Fatal error'), 'no PHP fatal errors')
  console.log(`Extracted production ZIP: ${checks} checks passed; isolated SQL only.`)
} finally {
  await browser?.close()
  await new Promise((resolve) => (proxy ? proxy.close(resolve) : resolve()))
  if (php) {
    const stopped = new Promise((resolve) => php.once('close', resolve))
    php.kill()
    await stopped
  }
  await runtime?.stop()
}
