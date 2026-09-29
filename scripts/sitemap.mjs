/**
 * Generates public/sitemap.xml and public/robots.txt from the site's own data, so adding a
 * project or service in src/data keeps the sitemap correct.
 *
 *   npm run sitemap        (also runs automatically as part of `npm run build`)
 *
 * The site URL comes from src/data/company.ts — update it there before deploying.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(path.join(root, p), 'utf8')

/** Pull values out of the data files with a regex — no bundler needed for a build script. */
const slugsIn = (file) => [...read(file).matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1])
const siteUrl = (read('src/data/company.ts').match(/siteUrl: '([^']+)'/) ?? [])[1]
if (!siteUrl) throw new Error('siteUrl not found in src/data/company.ts')

const today = new Date().toISOString().slice(0, 10)
const pages = [
  { loc: '/', priority: '1.0', changefreq: 'monthly' },
  { loc: '/about', priority: '0.8', changefreq: 'yearly' },
  { loc: '/solutions', priority: '0.9', changefreq: 'monthly' },
  ...slugsIn('src/data/services.ts').map((slug) => ({
    loc: `/solutions/${slug}`,
    priority: '0.8',
    changefreq: 'yearly',
  })),
  { loc: '/industries', priority: '0.7', changefreq: 'yearly' },
  { loc: '/projects', priority: '0.9', changefreq: 'monthly' },
  ...slugsIn('src/data/projects.ts').map((slug) => ({
    loc: `/projects/${slug}`,
    priority: '0.6',
    changefreq: 'yearly',
  })),
  { loc: '/contact', priority: '0.8', changefreq: 'yearly' },
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${siteUrl}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const robots = `# ${siteUrl}
User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

writeFileSync(path.join(root, 'public/sitemap.xml'), xml)
writeFileSync(path.join(root, 'public/robots.txt'), robots)
console.log(`sitemap.xml: ${pages.length} urls · robots.txt → ${siteUrl}`)
