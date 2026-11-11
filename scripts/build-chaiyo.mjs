/** Produce a complete, credential-free Chaiyo deployment, with private PHP outside httpdocs. */
import { cp, mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const staging = path.join(root, '.esi-admin/packages/chaiyo')
// This fixed, generated staging path contains no user data or credentials.
if (path.dirname(staging) !== path.join(root, '.esi-admin/packages'))
  throw new Error('Invalid staging path')
await rm(staging, { recursive: true, force: true })
const web = path.join(staging, 'httpdocs')
const privateRoot = path.join(staging, '.esi-admin-production')
await mkdir(privateRoot, { recursive: true })
await cp(path.join(root, 'dist'), web, { recursive: true })
await cp(path.join(root, 'server/php/src'), path.join(privateRoot, 'src'), { recursive: true })
await cp(
  path.join(root, 'server/php/production/config.example.php'),
  path.join(privateRoot, 'config.example.php'),
)
await mkdir(path.join(web, 'api'), { recursive: true })
await cp(path.join(root, 'server/php/production/index.php'), path.join(web, 'api/index.php'))
await cp(path.join(root, 'server/visitor-count.php'), path.join(web, 'visitor-count.php'))
await writeFile(path.join(privateRoot, '.htaccess'), 'Require all denied\n')
await mkdir(path.join(web, 'images/uploads'), { recursive: true })
await writeFile(
  path.join(web, 'images/uploads/.htaccess'),
  `Options -Indexes -ExecCGI
<FilesMatch "(?i)\\.(php[0-9]?|phtml|phar|cgi|pl|py|sh|shtml|htaccess|tmp)$">
  Require all denied
</FilesMatch>
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
</IfModule>
`,
)
const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' })
let projects, nextId, siteUrl
try {
  const data = await server.ssrLoadModule('/src/data/projects.ts')
  const { isProject } = await server.ssrLoadModule('/src/lib/admin.ts')
  const { company } = await server.ssrLoadModule('/src/data/company.ts')
  projects = data.projects
  if (!projects.every(isProject)) throw new Error('Invalid project seed')
  const content = JSON.parse(
    await readFile(path.join(root, 'src/data/projectContent.json'), 'utf8'),
  )
  nextId =
    Math.max(
      0,
      ...data.projectReferences.map((p) => p.id),
      ...projects.map((p) => p.id),
      ...content.removedIds,
    ) + 1
  siteUrl = company.siteUrl
} finally {
  await server.close()
}
// Do not publish images that belong only to a developer's private drafts.
const usedUploads = new Set(
  projects.flatMap((project) => [project.image, ...(project.gallery ?? [])]),
)
const uploads = path.join(web, 'images/uploads')
for (const entry of await readdir(uploads, { withFileTypes: true })) {
  if (
    entry.isFile() &&
    entry.name !== '.htaccess' &&
    !usedUploads.has('/images/uploads/' + entry.name)
  )
    await rm(path.join(uploads, entry.name))
}
const sitemap = await readFile(path.join(web, 'sitemap.xml'), 'utf8')
const sitemapBase = sitemap.replace(
  /\s*<url>\s*<loc>[^<]*\/projects\/[^<]+<\/loc>[\s\S]*?<\/url>/g,
  '',
)
await writeFile(
  path.join(privateRoot, 'seed.json'),
  JSON.stringify({ version: 1, projects, nextId, siteUrl, sitemapBase }, null, 2) + '\n',
)
const rewrite = await readFile(path.join(web, '.htaccess'), 'utf8')
await writeFile(
  path.join(web, '.htaccess'),
  rewrite.replace(
    '  RewriteBase /',
    `  RewriteBase /
  RewriteRule (^|/)\\. - [F,END]
  RewriteRule ^api(?:/|$) api/index.php [END,QSA]
  RewriteRule ^sitemap\\.xml$ api/index.php [END,QSA]`,
  ),
)
await writeFile(
  path.join(web, '.user.ini'),
  'display_errors=Off\nexpose_php=Off\npost_max_size=20M\nmemory_limit=128M\n',
)
await cp(path.join(root, 'database/chaiyo-production.md'), path.join(staging, 'READ-ME-FIRST.md'))
const zip = path.join(root, 'ESI-Chaiyo-Hosting.zip')
const temporary = path.join(root, '.esi-admin/packages/ESI-Chaiyo-Hosting.tmp.zip')
const quote = (s) => "'" + s.replaceAll("'", "''") + "'"
const script = `$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path -LiteralPath ${quote(temporary)}) { Remove-Item -LiteralPath ${quote(temporary)} }
$esiStage = [System.IO.Path]::GetFullPath(${quote(staging)}).TrimEnd([char]92, [char]47)
$esiArchive = [System.IO.Compression.ZipFile]::Open(${quote(temporary)}, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($esiFile in Get-ChildItem -LiteralPath $esiStage -Recurse -Force -File) {
    $esiEntry = $esiFile.FullName.Substring($esiStage.Length + 1).Replace([char]92, [char]47)
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($esiArchive, $esiFile.FullName, $esiEntry, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $esiArchive.Dispose() }
Move-Item -LiteralPath ${quote(temporary)} -Destination ${quote(zip)} -Force`
const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
  windowsHide: true,
  encoding: 'utf8',
})
if (result.status !== 0) throw new Error('ZIP creation failed: ' + result.stderr)
console.log(
  `Complete Chaiyo package: ${projects.length} published projects, PHP API, private application, no credentials.`,
)
console.log(zip)
