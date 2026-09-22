/**
 * Visual QA helper — full-page screenshots of the running dev/preview server using the system
 * Chrome/Edge (Playwright package only; no browser download).
 *
 *   node scripts/screenshot.mjs [path=/] [widths=1440,1024,768,375] [outDir=./screenshots]
 *
 * Example: node scripts/screenshot.mjs /solutions 1440,375
 * Set BASE_URL to override http://localhost:5173.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import { chromium } from 'playwright'

const [routePath = '/', widthsArg = '1440,1024,768,375', outDir = './screenshots'] =
  process.argv.slice(2)
const baseUrl = process.env.BASE_URL ?? 'http://localhost:5173'
const widths = widthsArg.split(',').map(Number)

await mkdir(outDir, { recursive: true })

const browser = await launch()
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
  await page.goto(baseUrl + routePath, { waitUntil: 'networkidle' })
  // Scroll through the page so viewport-triggered reveals have fired, then return to top.
  await page.evaluate(async () => {
    await document.fonts.ready
    const step = 300
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 200))
    }
    await new Promise((r) => setTimeout(r, 800))
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(1500)
  const name =
    (routePath === '/' ? 'home' : routePath.replace(/^\//, '').replace(/[/?=]/g, '-')) +
    `-${width}.png`
  const file = path.join(outDir, name)
  await page.screenshot({ path: file, fullPage: true })
  console.log(`saved ${file}`)
  await page.close()
}
await browser.close()

async function launch() {
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await chromium.launch({ channel })
    } catch {
      /* try the next channel */
    }
  }
  throw new Error(
    'No system Chrome/Edge found. Install one or run: npx playwright install chromium',
  )
}
