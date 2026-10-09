/**
 * Site-wide QA sweep (PLAN Phase 8). Drives the system Chrome over every route and reports:
 *   - accessibility violations (axe-core, WCAG 2 A/AA)
 *   - SEO head tags (title, description, canonical, OG image)
 *   - horizontal overflow at 375 / 768 / 1024 / 1440
 *   - images without alt / width / height, and broken image or link targets
 *   - console and page errors
 *
 *   npm run audit                 (dev server must be running)
 *   BASE_URL=http://localhost:4173 npm run audit   (against a production preview)
 *
 * Exits non-zero when anything fails, so it can gate a release.
 */
import { createRequire } from 'node:module'

import { chromium } from 'playwright'

const require = createRequire(import.meta.url)
const axePath = require.resolve('axe-core/axe.min.js')
const axeSource = require('node:fs').readFileSync(axePath, 'utf8')

const baseUrl = process.env.BASE_URL ?? 'http://localhost:5173'
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
  '/this-route-does-not-exist',
]

const problems = []
const note = (route, kind, detail) => problems.push({ route, kind, detail })

const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()

const consoleErrors = []
page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 200)))
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 200)))

const seoRows = []
for (const route of routes) {
  consoleErrors.length = 0
  await page.goto(baseUrl + route, { waitUntil: 'networkidle' })
  await page.waitForTimeout(350)

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

await browser.close()

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
