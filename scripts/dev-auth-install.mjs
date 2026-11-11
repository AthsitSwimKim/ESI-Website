/** Install portable official Windows runtimes inside the ignored workspace only. */
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { access, mkdir } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
const toolsRoot = path.join(repositoryRoot, '.esi-admin', 'dev', 'tools')
const packages = [
  {
    name: 'PHP 8.3.36-1 NTS x64',
    file: 'php-8.3.36-1.zip',
    url: 'https://downloads.php.net/~windows/releases/archives/php-8.3.36-1-nts-Win32-vs16-x64.zip',
    sha256: '1a097d52b7a68622cdc723073b61cc70caf79c941218ff65b2d8441dbc6b10d4',
    destination: path.join(toolsRoot, 'php'),
  },
  {
    name: 'MariaDB 11.4.13 x64',
    file: 'mariadb-11.4.13.zip',
    url: 'https://archive.mariadb.org/mariadb-11.4.13/winx64-packages/mariadb-11.4.13-winx64.zip',
    sha256: 'd62986d433eeebfde218560b276103831604a61e929e87f1a17f5aebd80257e2',
    destination: toolsRoot,
  },
]
const quote = (text) => `'${text.replaceAll("'", "''")}'`
const exists = (file) =>
  access(file).then(
    () => true,
    () => false,
  )

async function checksum(file) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}

async function install(pkg) {
  const zip = path.join(toolsRoot, pkg.file)
  if (!(await exists(zip))) {
    console.log(`Downloading official ${pkg.name} package...`)
    const response = await fetch(pkg.url, { signal: AbortSignal.timeout(120000) })
    if (!response.ok || !response.body)
      throw new Error(`Download failed for ${pkg.name}: HTTP ${response.status}`)
    await pipeline(Readable.fromWeb(response.body), createWriteStream(zip, { flags: 'wx' }))
  }
  if ((await checksum(zip)) !== pkg.sha256)
    throw new Error(`${pkg.name} SHA-256 does not match the publisher checksum; nothing executed`)
  await mkdir(pkg.destination, { recursive: true })
  const command = `Expand-Archive -LiteralPath ${quote(zip)} -DestinationPath ${quote(pkg.destination)} -Force`
  await new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], {
      windowsHide: true,
      stdio: 'inherit',
    })
    child.once('error', reject)
    child.once('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`Extraction failed for ${pkg.name}`)),
    )
  })
  console.log(`${pkg.name}: publisher SHA-256 verified and extracted`)
}

if (process.platform !== 'win32' || process.arch !== 'x64')
  throw new Error(
    'This portable setup targets Windows x64; use a local PHP/MySQL runtime on other platforms',
  )
await mkdir(toolsRoot, { recursive: true })
for (const pkg of packages) await install(pkg)
console.log(`Portable runtimes are ready in ${toolsRoot}`)
