/** Prepare the owner's private config separately; this file is NEVER copied into the ZIP. */
import { randomBytes } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const directory = path.join(root, '.esi-admin/production')
const connection = JSON.parse(
  await readFile(path.join(root, '.esi-admin/chaiyo/connection.json'), 'utf8'),
)
if (
  connection.host !== 'mysql-5.5.chaiyohosting.com' ||
  connection.port !== 3306 ||
  connection.database !== 'esithcom_website' ||
  connection.username !== 'esi_webapp' ||
  connection.transport !== 'legacy' ||
  typeof connection.password !== 'string' ||
  !connection.password
)
  throw new Error('Approved private Chaiyo connection required')
await mkdir(directory, { recursive: true })
let key
try {
  key = JSON.parse(await readFile(path.join(directory, 'key.json'), 'utf8')).key
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}
if (!key) {
  key = randomBytes(32).toString('hex')
  await writeFile(path.join(directory, 'key.json'), JSON.stringify({ key }) + '\n', {
    mode: 0o600,
    flag: 'wx',
  })
}
if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('Invalid private production key')
const phpQuote = (s) => "'" + s.replaceAll('\\', '\\\\').replaceAll("'", "\\'") + "'"
let configuration = await readFile(
  path.join(root, 'server/php/production/config.example.php'),
  'utf8',
)
configuration = configuration.replace(
  "'password' => ''",
  () => "'password' => " + phpQuote(connection.password),
)
configuration = configuration.replace("'REPLACE_WITH_64_RANDOM_HEX_CHARACTERS'", phpQuote(key))
await writeFile(path.join(directory, 'config.php'), configuration, { mode: 0o600 })
console.log(
  'Private production config prepared separately (not in ZIP): .esi-admin/production/config.php',
)
