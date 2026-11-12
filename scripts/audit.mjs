/**
 * Site-wide QA sweep (PLAN Phase 8). Drives the system Chrome over every route and reports:
 *   - accessibility violations (axe-core, WCAG 2 A/AA)
 *   - SEO head tags (title, description, canonical, OG image)
 *   - horizontal overflow at 375 / 768 / 1024 / 1440
 *   - images without alt / width / height, and broken image or link targets
 *   - console and page errors
 *
 *   npm run audit                 (starts an isolated local server and project copy)
 *   BASE_URL=http://localhost:4173 npm run audit   (against a production preview)
 *
 * Exits non-zero when anything fails, so it can gate a release.
 */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'

import { chromium } from 'playwright'
import { createServer } from 'vite'
import { startDevAuth } from './dev-auth.mjs'

const require = createRequire(import.meta.url)
const axePath = require.resolve('axe-core/axe.min.js')
const axeSource = require('node:fs').readFileSync(axePath, 'utf8')

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
let auditRoot
let auditServer
let authRuntime
let baseUrl = process.env.BASE_URL
if (!baseUrl) {
  const parent = path.join(repositoryRoot, '.esi-admin')
  await mkdir(parent, { recursive: true })
  auditRoot = await mkdtemp(path.join(parent, 'audit-'))
  for (const entry of [
    'src',
    'public',
    'server',
    'shared',
    'vite.config.ts',
    'package.json',
    'database',
    'index.html',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'tsconfig.test.json',
  ]) {
    await cp(path.join(repositoryRoot, entry), path.join(auditRoot, entry), { recursive: true })
  }
  auditServer = await createServer({
    root: auditRoot,
    clearScreen: false,
    server: { host: 'localhost', port: 0, fs: { allow: [auditRoot, repositoryRoot] } },
  })
  await auditServer.listen()
  baseUrl = auditServer.resolvedUrls.local[0].replace(/\/$/, '')
  try {
    authRuntime = await startDevAuth({
      root: auditRoot,
      privateRoot: path.join(auditRoot, '.esi-admin/dev'),
      origins: [baseUrl],
      port: 0,
      writeBridge: true,
    })
  } catch (error) {
    await auditServer.close()
    throw error
  }
  console.log(
    'Audit uses an isolated project copy; saved projects and photos in your working site are not changed.',
  )
}
const widths = [375, 768, 1024, 1440]
const routes = [
  '/',
  '/about',
  '/solutions',
  '/solutions/industrial-network',
  '/solutions/cctv-security',
  '/solutions/access-control',
  '/solutions/communication',
  '/solutions/paga',
  '/solutions/radio',
  '/solutions/video-wall',
  '/industries',
  '/projects',
  '/projects?category=cctv',
  '/projects?page=3',
  '/projects/map-ta-phut-tank-terminal-cctv',
  '/projects/klongluang-utilities-spp-systems',
  '/contact',
  '/admin-portal-update',
  '/admin-portal-update/login',
  '/admin-portal-update/audit-logs',
  '/admin-portal-update/projects/new',
  '/admin-portal-update/preview/missing',
  '/this-route-does-not-exist',
]

const problems = []
const note = (route, kind, detail) => problems.push({ route, kind, detail })

async function loginContext(context) {
  const anonymous = await (await context.request.get(baseUrl + '/api/admin/auth/session')).json()
  const response = await context.request.post(baseUrl + '/api/admin/auth/login', {
    headers: { Origin: baseUrl, 'X-ESI-CSRF': anonymous.csrfToken },
    data: { username: authRuntime.username, password: authRuntime.password },
  })
  if (!response.ok() || !(await response.json()).authenticated)
    throw new Error('Audit development login failed')
}

async function logoutContext(context) {
  const current = await (await context.request.get(baseUrl + '/api/admin/auth/session')).json()
  if (!current.authenticated) return
  const response = await context.request.post(baseUrl + '/api/admin/auth/logout', {
    headers: { Origin: baseUrl, 'X-ESI-CSRF': current.csrfToken },
    data: {},
  })
  if (!response.ok()) throw new Error('Audit development logout failed')
}

const browser = await chromium.launch({ channel: 'chrome' })
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  // Keep UI checks deterministic and avoid querying production during the route sweep.
  let websiteVisitors = 123456
  const trafficMethods = []
  await context.route('**/api/admin/traffic', async (route) => {
    trafficMethods.push(route.request().method())
    await route.fulfill({ json: { views: websiteVisitors } })
  })
  if (auditServer) {
    // Real PHP/MySQL authentication, with private audit-only credentials.
    const anonymousProjects = await context.request.get(baseUrl + '/api/admin/projects')
    if (anonymousProjects.status() !== 401)
      note('/api/admin', 'security', 'anonymous clients could read project drafts')
    const anonymousAudit = await context.request.get(baseUrl + '/api/admin/audit-logs')
    if (anonymousAudit.status() !== 401)
      note('/api/admin/audit-logs', 'security', 'anonymous clients could read audit logs')
    const publicIngest = await context.request.post(baseUrl + '/api/admin/audit-events', {
      data: {},
    })
    if (publicIngest.status() !== 404)
      note('/api/admin/audit-events', 'security', 'internal audit ingestion was exposed')
    const forgedHeader = await context.request.post(baseUrl + '/api/admin/projects/save', {
      headers: { Origin: baseUrl, 'X-ESI-Admin': '1' },
      data: {},
    })
    if (forgedHeader.status() !== 401)
      note('/api/admin', 'security', 'the old admin header bypassed authentication')
    const internal = await context.request.get(baseUrl + '/api/admin/auth/authorize', {
      headers: { 'X-ESI-Internal-Key': 'forged-key' },
    })
    if (internal.status() !== 404)
      note('/api/admin', 'security', 'the internal authorization route is exposed')
    for (const privatePath of [
      '/.esi-admin/dev/dev-secrets.json',
      '/.esi-admin/dev/bridge.json',
      '/server/php/config.example.php',
      `/@fs/${auditRoot.replaceAll('\\', '/')}/.esi-admin/dev/dev-secrets.json`,
    ]) {
      const response = await context.request.get(baseUrl + privatePath)
      if (![403, 404].includes(response.status()))
        note(privatePath, 'security', 'private server files were accessible over HTTP')
    }
    await page.goto(baseUrl + '/admin-portal-update/projects/new', { waitUntil: 'networkidle' })
    await page.waitForURL('**/admin-portal-update/login?**')
    await page.getByLabel('Username', { exact: true }).fill(authRuntime.username)
    await page.getByLabel('Password', { exact: true }).fill('wrong-audit-password')
    await page.getByRole('button', { name: 'Log in', exact: true }).click()
    await page
      .getByRole('alert')
      .filter({ hasText: 'The username or password is incorrect.' })
      .waitFor()
    await page.getByLabel('Password', { exact: true }).fill(authRuntime.password)
    await page.getByRole('button', { name: 'Log in', exact: true }).click()
    await page.waitForURL('**/admin-portal-update/projects/new')
    const sessionCookie = (await context.cookies()).find(
      (cookie) => cookie.name === 'esi_admin_dev_session',
    )
    if (!sessionCookie?.httpOnly || sessionCookie.sameSite !== 'Strict')
      note(
        '/admin-portal-update/login',
        'security',
        'session cookie is missing HttpOnly or SameSite Strict',
      )
    const noCsrf = await context.request.post(baseUrl + '/api/admin/projects/save', {
      headers: { Origin: baseUrl, 'X-ESI-Admin': '1' },
      data: {},
    })
    if (noCsrf.status() !== 403)
      note('/api/admin', 'security', 'authenticated writes without CSRF were accepted')
    await page.getByRole('button', { name: 'Log out', exact: true }).click()
    await page.waitForURL('**/admin-portal-update/login?**')
    if ((await context.request.get(baseUrl + '/api/admin/projects')).status() !== 401)
      note('/admin-portal-update/login', 'security', 'logout left project access active')
    await loginContext(context)
    console.log(
      '✓ auth flow: real PHP/MySQL login, safe redirect, generic errors, HttpOnly cookie, CSRF, logout, private-file and API protection',
    )
    await page.goto(baseUrl + '/', { waitUntil: 'networkidle' })
    await page.locator('header a[href="/projects"]').filter({ visible: true }).click()
    await page.getByRole('button', { name: /CCTV/ }).click()
    await page.waitForURL('**/projects?category=cctv')
    await page.reload({ waitUntil: 'networkidle' })
    if (trafficMethods.length)
      note('/admin-portal-update', 'traffic', 'local public pages must not record website visits')
    await page.goto(baseUrl + '/admin-portal-update', { waitUntil: 'networkidle' })
    const viewsCard = page.getByText('Website visitors', { exact: true }).locator('..')
    await viewsCard.getByText('123,456', { exact: true }).waitFor()
    websiteVisitors++
    await page.evaluate(() => window.dispatchEvent(new Event('focus')))
    await viewsCard.getByText('123,457', { exact: true }).waitFor()
    if (trafficMethods.some((method) => method !== 'GET'))
      note('/admin-portal-update', 'traffic', 'the admin card must only read website visitors')
  }

  const consoleErrors = []
  page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 200)))
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 200)))

  const seoRows = []
  for (const route of routes) {
    consoleErrors.length = 0
    if (authRuntime && route === '/admin-portal-update/login') await logoutContext(context)
    await page.goto(baseUrl + route, { waitUntil: 'networkidle' })
    await page.locator('h1').waitFor({ timeout: 15000 })
    await page.waitForTimeout(1000)

    // --- SEO head -----------------------------------------------------------
    const head = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content ?? '',
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? '',
      ogTitle: document.querySelector('meta[property="og:title"]')?.content ?? '',
      ogImage: document.querySelector('meta[property="og:image"]')?.content ?? '',
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
      lang: document.documentElement.lang,
      duplicateDescriptions: document.querySelectorAll('meta[name="description"]').length,
    }))
    seoRows.push({ route, ...head })
    if (route.startsWith('/admin-portal-update')) {
      const robots = await page.locator('meta[name="robots"]').getAttribute('content')
      if (!robots?.includes('noindex')) note(route, 'seo', 'admin page is not marked noindex')
    }
    if (!head.title.includes('ESI')) note(route, 'seo', `title has no brand: "${head.title}"`)
    if (head.duplicateDescriptions > 1)
      note(route, 'seo', `${head.duplicateDescriptions} description tags`)
    if (head.description.length < 50 || head.description.length > 165)
      note(route, 'seo', `description length ${head.description.length}`)
    if (!head.canonical) note(route, 'seo', 'no canonical')
    if (!head.ogImage) note(route, 'seo', 'no og:image')
    if (head.h1.length !== 1) note(route, 'seo', `${head.h1.length} h1 elements`)

    // --- images -------------------------------------------------------------
    const imgIssues = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .map((img) => {
          const bad = []
          if (img.alt === null) bad.push('missing alt attribute')
          if (!img.getAttribute('width') || !img.getAttribute('height')) bad.push('no width/height')
          if (img.complete && img.naturalWidth === 0) bad.push('failed to load')
          return bad.length ? `${img.currentSrc || img.src}: ${bad.join(', ')}` : null
        })
        .filter(Boolean),
    )
    imgIssues.forEach((d) => note(route, 'image', d))

    // --- accessibility ------------------------------------------------------
    await page.evaluate(axeSource)
    const axe = await page.evaluate(
      async () =>
        // eslint-disable-next-line no-undef
        await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        }),
    )
    for (const v of axe.violations)
      note(
        route,
        `a11y/${v.impact}`,
        `${v.id}: ${v.help} (${v.nodes.length} node(s)) → ${v.nodes[0]?.target?.join(' ')}`,
      )

    // --- horizontal overflow at each width ----------------------------------
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(250)
      const overflow = await page.evaluate(() => {
        const docW = document.documentElement.clientWidth
        if (document.documentElement.scrollWidth <= docW + 1) return null
        const culprit = [...document.querySelectorAll('body *')].find((el) => {
          const r = el.getBoundingClientRect()
          return (
            r.width > 0 &&
            (r.right > docW + 1 || r.left < -1) &&
            getComputedStyle(el).position !== 'fixed'
          )
        })
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: docW,
          culprit: culprit
            ? culprit.tagName + '.' + [...culprit.classList].slice(0, 3).join('.')
            : 'unknown',
        }
      })
      if (overflow)
        note(
          route,
          'overflow',
          `${width}px: scrollWidth ${overflow.scrollWidth} > ${overflow.clientWidth} — ${overflow.culprit}`,
        )
    }
    await page.setViewportSize({ width: 1440, height: 900 })

    consoleErrors.forEach((e) => note(route, 'console', e))
    if (authRuntime && route === '/admin-portal-update/login') await loginContext(context)
  }

  // --- gallery uploads persist and remain optional (isolated audit context) ---
  if (auditServer) {
    await page.goto(baseUrl + '/admin-portal-update', { waitUntil: 'networkidle' })
    await page.getByRole('searchbox').fill('Long Son')
    await page.waitForURL((url) => url.searchParams.get('q') === 'Long Son')
    const projectLink = page.getByRole('link', { name: /^Edit project Long Son/ })
    await projectLink.focus()
    await page.keyboard.press('Enter')
    await page.waitForURL(
      (url) =>
        /^\/admin-portal-update\/projects\/\d+$/.test(url.pathname) &&
        url.searchParams.get('q') === 'Long Son',
    )
    await page.getByRole('heading', { level: 1, name: 'Edit project' }).waitFor()
    if (await page.getByRole('searchbox').count())
      note(
        '/admin-portal-update',
        'navigation',
        'project list still rendered beside the separate editor',
      )
    const editTitle = page.getByRole('textbox', { name: 'Title (EN) *', exact: true })
    if (!(await editTitle.inputValue()).startsWith('Long Son'))
      note('/admin-portal-update', 'navigation', 'project link did not load its own editor')
    await editTitle.fill('Unsaved navigation check')
    const backToList = page.getByRole('link', { name: 'Back to project list', exact: true })
    await Promise.all([
      page.waitForEvent('dialog').then((dialog) => dialog.dismiss()),
      backToList.click(),
    ])
    await editTitle.waitFor()
    if ((await editTitle.inputValue()) !== 'Unsaved navigation check')
      note('/admin-portal-update', 'navigation', 'cancelling navigation discarded unsaved work')
    await Promise.all([
      page.waitForEvent('dialog').then((dialog) => dialog.accept()),
      backToList.click(),
    ])
    await page.waitForURL(
      (url) => url.pathname === '/admin-portal-update/' && url.searchParams.get('q') === 'Long Son',
    )
    if ((await page.getByRole('searchbox').inputValue()) !== 'Long Son')
      note('/admin-portal-update', 'navigation', 'returning to the list lost the search filter')
    await page.getByRole('searchbox').clear()
    await page.waitForURL(
      (url) => url.pathname === '/admin-portal-update/' && !url.searchParams.has('q'),
    )
    await page.getByRole('link', { name: 'Add project', exact: true }).click()
    await page.waitForURL((url) => url.pathname === '/admin-portal-update/projects/new')
    if (await page.getByRole('textbox', { name: 'Title (EN) *', exact: true }).inputValue())
      note('/admin-portal-update', 'new project', 'new project form was not blank')
    await page.goto(baseUrl + '/admin-portal-update/projects/new?sample=1', {
      waitUntil: 'networkidle',
    })
    if (await page.getByRole('textbox', { name: 'Title (EN) *', exact: true }).inputValue())
      note('/admin-portal-update', 'new project', 'removed sample URL still filled the form')
    // Seed only the isolated audit workspace; there is no sample-fill feature in the app.
    const { createTestProject } = await auditServer.ssrLoadModule(
      '/src/test/fixtures/admin-project.ts',
    )
    const fixtureWorkspace = await (
      await context.request.get(baseUrl + '/api/admin/projects')
    ).json()
    const fixtureSession = await (
      await context.request.get(baseUrl + '/api/admin/auth/session')
    ).json()
    const fixtureResponse = await context.request.post(baseUrl + '/api/admin/projects/save', {
      headers: { Origin: baseUrl, 'X-ESI-Admin': '1', 'X-ESI-CSRF': fixtureSession.csrfToken },
      data: {
        project: createTestProject(fixtureWorkspace.projects),
        revision: fixtureWorkspace.revision,
        isNew: true,
      },
    })
    if (!fixtureResponse.ok()) throw new Error('Isolated audit fixture could not be saved')
    const fixture = await fixtureResponse.json()
    await page.goto(baseUrl + `/admin-portal-update/projects/${fixture.project.id}`, {
      waitUntil: 'networkidle',
    })
    const testTitle = `[QA] Local publishing ${Date.now()}`
    await page.getByRole('textbox', { name: 'Title (EN) *', exact: true }).fill(testTitle)
    const gallery = page.locator('section[aria-labelledby="admin-gallery-label"]')
    const galleryInput = gallery.locator('input[type="file"]')
    await galleryInput.setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    })
    await gallery.getByText('Choose a JPG, PNG or WebP image.', { exact: true }).waitFor()
    if ((await gallery.getByRole('img').count()) !== 2)
      note('/admin-portal-update', 'gallery', 'invalid file changed existing images')
    await galleryInput.setInputFiles([
      fileURLToPath(
        new URL('../public/images/projects/senior-aerospace-access-control.webp', import.meta.url),
      ),
      fileURLToPath(
        new URL('../public/images/projects/henkel-thailand-access-control.webp', import.meta.url),
      ),
    ])
    await gallery.getByRole('img').nth(3).waitFor()
    await page.getByRole('button', { name: 'Save draft', exact: true }).first().click()
    const saveDialog = page.getByRole('dialog', { name: 'Draft saved', exact: true })
    await saveDialog.waitFor()
    await page.waitForURL((url) => /^\/admin-portal-update\/projects\/\d+$/.test(url.pathname))
    await page.evaluate(axeSource)
    const saveDialogAxe = await page.evaluate(async () =>
      window.axe.run({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } }),
    )
    for (const issue of saveDialogAxe.violations)
      note('/admin-portal-update', 'save-dialog/a11y', `${issue.id}: ${issue.help}`)
    await mkdir(new URL('../screenshots/', import.meta.url), { recursive: true })
    await saveDialog.screenshot({
      path: fileURLToPath(new URL('../screenshots/admin-save-popup.png', import.meta.url)),
    })
    await saveDialog.getByRole('button', { name: 'OK', exact: true }).click()
    await saveDialog.waitFor({ state: 'hidden' })
    await page
      .getByRole('button', { name: 'Save draft', exact: true })
      .and(page.locator(':focus'))
      .waitFor()
    await page.getByRole('button', { name: 'Save draft', exact: true }).first().click()
    await saveDialog.waitFor()
    await page.keyboard.press('Escape')
    await saveDialog.waitFor({ state: 'hidden' })
    await page.getByText(/^Draft saved in the system/).waitFor()
    await page.reload({ waitUntil: 'networkidle' })
    await gallery.getByRole('img').nth(3).waitFor()
    if ((await gallery.getByRole('img').count()) !== 4)
      note('/admin-portal-update', 'gallery', 'uploaded images did not survive reload')
    await gallery.getByRole('button', { name: 'Remove photo 4', exact: true }).click()
    if ((await gallery.getByRole('img').count()) !== 3)
      note('/admin-portal-update', 'gallery', 'remove did not update thumbnails')
    await mkdir(new URL('../screenshots/', import.meta.url), { recursive: true })
    await gallery.screenshot({
      path: fileURLToPath(new URL('../screenshots/admin-gallery-upload.png', import.meta.url)),
    })
    await page.getByRole('button', { name: 'Save & preview', exact: true }).click()
    await page.waitForURL('**/admin-portal-update/preview/*')
    const renderedGallery = page.locator('section[aria-labelledby="project-gallery-title"]')
    await renderedGallery.getByRole('img').nth(2).waitFor()
    if ((await renderedGallery.getByRole('img').count()) !== 3)
      note('/admin-portal-update', 'gallery', 'preview did not render the saved photos')
    await page.getByRole('link', { name: 'Back to editor', exact: true }).click()
    await page.waitForURL((url) => /^\/admin-portal-update\/projects\/\d+$/.test(url.pathname))
    for (let count = 3; count > 0; count--)
      await gallery.getByRole('button', { name: 'Remove photo 1', exact: true }).click()
    await page.getByRole('button', { name: 'Save & preview', exact: true }).click()
    await page.waitForURL('**/admin-portal-update/preview/*')
    await page.locator('h1').filter({ hasText: testTitle }).waitFor()
    if ((await renderedGallery.count()) !== 0)
      note('/admin-portal-update', 'gallery', 'empty gallery should be hidden')
    console.log(
      '✓ gallery flow: invalid file, multi-upload, save/reload, removal, detail preview, optional empty gallery',
    )

    // Drafts are now durable API records, not browser storage. A fresh client sees the same record.
    const savedId = Number(new URL(page.url()).pathname.split('/').at(-1))
    const savedWorkspace = await (await context.request.get(baseUrl + '/api/admin/projects')).json()
    const savedProject = savedWorkspace.projects.find((project) => project.id === savedId)
    const freshContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const visitor = await freshContext.newPage()
    await visitor.goto(baseUrl + '/projects', { waitUntil: 'networkidle' })
    const publishedLink = visitor.locator(`a[href="/projects/${savedProject.slug}"]`)
    if (await publishedLink.count())
      note(
        '/admin-portal-update',
        'publishing',
        'an unpublished draft appeared on the normal Projects page',
      )
    await loginContext(freshContext)
    const crossBrowser = await (
      await freshContext.request.get(baseUrl + '/api/admin/projects')
    ).json()
    if (!crossBrowser.projects.some((project) => project.id === savedId))
      note('/admin-portal-update', 'persistence', 'fresh browser could not read the saved draft')

    // Restart the actual Vite/API server and verify the same on-disk record remains available.
    const savedPort = Number(new URL(baseUrl).port)
    await auditServer.close()
    auditServer = await createServer({
      root: auditRoot,
      clearScreen: false,
      server: {
        host: 'localhost',
        port: savedPort,
        strictPort: true,
        fs: { allow: [auditRoot, repositoryRoot] },
      },
    })
    await auditServer.listen()
    const restartedWorkspace = await (
      await freshContext.request.get(baseUrl + '/api/admin/projects')
    ).json()
    if (!restartedWorkspace.projects.some((project) => project.id === savedId))
      note('/admin-portal-update', 'persistence', 'draft was lost after server restart')
    await page.goto(baseUrl + `/admin-portal-update/projects/${savedId}`, {
      waitUntil: 'networkidle',
    })
    await page.getByRole('button', { name: 'Publish', exact: true }).click()
    await page.waitForURL(`**/projects/${savedProject.slug}`)
    await visitor.goto(baseUrl + '/projects', { waitUntil: 'networkidle' })
    await publishedLink.click()
    await visitor.waitForURL(`**/projects/${savedProject.slug}`)
    await visitor.locator('h1').filter({ hasText: savedProject.title }).waitFor()
    await visitor.screenshot({
      path: fileURLToPath(new URL('../screenshots/admin-published-project.png', import.meta.url)),
      fullPage: false,
    })

    // Updates to a published project do not leak from a draft; publishing makes them visible to a fresh browser.
    await page.goto(baseUrl + `/admin-portal-update/projects/${savedId}`, {
      waitUntil: 'networkidle',
    })
    const editedTitle = '[Sample] Updated and published project'
    await page.getByRole('textbox', { name: 'Title (EN) *', exact: true }).fill(editedTitle)
    await page.getByRole('button', { name: 'Save draft', exact: true }).first().click()
    await page
      .getByRole('dialog', { name: 'Draft saved', exact: true })
      .getByRole('button', { name: 'OK', exact: true })
      .click()
    await visitor.reload({ waitUntil: 'networkidle' })
    await visitor.locator('h1').filter({ hasText: savedProject.title }).waitFor()
    await page.getByRole('button', { name: 'Publish', exact: true }).click()
    await page.waitForURL(`**/projects/${savedProject.slug}`)
    await visitor.reload({ waitUntil: 'networkidle' })
    await visitor.locator('h1').filter({ hasText: editedTitle }).waitFor()

    // Unpublish returns the record to a draft. Republish and delete must change the normal site too.
    await page.goto(baseUrl + `/admin-portal-update/projects/${savedId}`, {
      waitUntil: 'networkidle',
    })
    await page.getByRole('button', { name: 'Unpublish', exact: true }).click()
    await page
      .getByText('Project unpublished. The saved draft remains available in the editor.', {
        exact: true,
      })
      .waitFor()
    await visitor.goto(baseUrl + '/projects', { waitUntil: 'networkidle' })
    if (await visitor.getByRole('link', { name: editedTitle, exact: true }).count())
      note('/admin-portal-update', 'publishing', 'unpublished project remained on the normal list')
    await page.getByRole('button', { name: 'Publish', exact: true }).click()
    await page.waitForURL(`**/projects/${savedProject.slug}`)
    await page.goto(baseUrl + `/admin-portal-update/projects/${savedId}`, {
      waitUntil: 'networkidle',
    })
    await page.getByRole('button', { name: 'Delete project', exact: true }).click()
    await page
      .getByRole('group', { name: 'Delete this project from the system and website?', exact: true })
      .getByRole('button', { name: 'Delete project', exact: true })
      .click()
    await page.getByText('Project deleted from the system and website.', { exact: true }).waitFor()
    await visitor.goto(baseUrl + '/projects', { waitUntil: 'networkidle' })
    if (await visitor.getByRole('link', { name: editedTitle, exact: true }).count())
      note('/admin-portal-update', 'publishing', 'deleted project remained on the normal list')

    const forbidden = await freshContext.request.post(baseUrl + '/api/admin/projects/save', {
      headers: { Origin: 'https://untrusted.example', 'X-ESI-Admin': '1' },
      data: {},
    })
    if (forbidden.status() !== 403)
      note('/api/admin', 'security', 'cross-origin write was not rejected')
    const withoutHeader = await freshContext.request.post(baseUrl + '/api/admin/projects/save', {
      data: {},
    })
    if (withoutHeader.status() !== 403)
      note('/api/admin', 'security', 'write without the admin header was not rejected')
    const auditResponse = await context.request.get(baseUrl + '/api/admin/audit-logs')
    if (!auditResponse.ok())
      note(
        '/admin-portal-update/audit-logs',
        'audit',
        'audit history could not be read after project changes',
      )
    else {
      const history = await auditResponse.json()
      for (const action of ['save_draft', 'publish', 'unpublish', 'delete', 'upload']) {
        const response = await context.request.get(
          baseUrl + `/api/admin/audit-logs?action=${action}`,
        )
        const result = await response.json()
        if (
          !response.ok() ||
          !result.items?.some((item) => item.action === action && item.result === 'success')
        )
          note('/admin-portal-update/audit-logs', 'audit', `${action} was not recorded`)
      }
      if (!history.items?.length || JSON.stringify(history).includes('password_hash'))
        note(
          '/admin-portal-update/audit-logs',
          'audit',
          'history was empty or exposed private fields',
        )
    }
    await page.goto(baseUrl + '/admin-portal-update/audit-logs', { waitUntil: 'networkidle' })
    await page.getByRole('heading', { level: 1 }).waitFor()
    if (!(await page.getByRole('table').count()))
      note('/admin-portal-update/audit-logs', 'audit', 'audit table did not render')
    console.log(
      '✓ audit history: real authentication and project events, action filters, private ingestion and anonymous protection',
    )
    await freshContext.close()
    console.log(
      '✓ management flow: durable drafts, fresh browser, server restart, publish, update, unpublish, delete and request-origin protection',
    )
  }

  // --- internal links resolve ------------------------------------------------
  await page.goto(baseUrl + '/', { waitUntil: 'networkidle' })
  const hrefs = await page.evaluate(() => [
    ...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href'))),
  ])
  for (const href of hrefs) {
    const r = await page.request.get(baseUrl + href)
    if (!r.ok()) note(href, 'link', `HTTP ${r.status()}`)
  }

  // --- language switching keeps revealed content visible --------------------
  const i18nRoute = '/projects/map-ta-phut-tank-terminal-cctv'
  await page.goto(baseUrl + i18nRoute, { waitUntil: 'networkidle' })
  const scopeList = page.locator('#project-scope-list')
  await scopeList.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)
  for (const lang of ['th', 'en']) {
    await page.locator(`button[lang="${lang}"]`).first().click()
    await page.waitForTimeout(150)
    const state = await scopeList.locator(':scope > li').evaluateAll((items) => ({
      count: items.length,
      hidden: items.filter((item) => {
        const style = getComputedStyle(item)
        return (
          style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.9
        )
      }).length,
      lang: document.documentElement.lang,
    }))
    if (state.lang !== lang)
      note(i18nRoute, 'i18n', `language switch expected ${lang}, got ${state.lang}`)
    if (state.count === 0 || state.hidden > 0)
      note(
        i18nRoute,
        'i18n',
        `${lang}: ${state.hidden}/${state.count} project scope item(s) hidden after switching`,
      )
  }

  console.log('\nSEO summary')
  console.table(
    seoRows.map((r) => ({
      route: r.route,
      title: r.title.slice(0, 52),
      descLen: r.description.length,
      h1: r.h1.length,
      canonical: !!r.canonical,
    })),
  )

  if (problems.length === 0) {
    console.log(
      `\n✓ audit clean — ${routes.length} routes × ${widths.length} widths, axe WCAG 2 A/AA\n`,
    )
  } else {
    console.log(`\n✗ ${problems.length} problem(s):\n`)
    for (const p of problems) console.log(`  [${p.kind}] ${p.route}\n      ${p.detail}`)
    process.exitCode = 1
  }
} finally {
  await browser.close()
  if (auditServer) await auditServer.close()
  if (authRuntime) await authRuntime.stop()
  if (auditRoot) {
    const expectedParent = path.resolve(repositoryRoot, '.esi-admin')
    if (
      path.dirname(path.resolve(auditRoot)) === expectedParent &&
      path.basename(auditRoot).startsWith('audit-')
    ) {
      await rm(auditRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
    } else {
      console.error('Refusing to clean up an unexpected audit directory')
      process.exitCode = 1
    }
  }
}
