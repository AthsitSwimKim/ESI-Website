/** Explicit Chaiyo connection profile. Local UI only; never initializes remote storage. */
import { randomBytes, randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { access, mkdir, open, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDevRuntimePaths } from './dev-auth.mjs'

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
export const CHAIYO_TARGET = Object.freeze({
  version: 1,
  host: 'mysql-5.5.chaiyohosting.com',
  port: 3306,
  database: 'esithcom_website',
  username: 'esi_webapp',
})

export class ChaiyoConnectionError extends Error {
  constructor(code, details = {}) {
    super(code)
    this.name = 'ChaiyoConnectionError'
    this.code = code
    this.details = details
  }
}

const exists = (file) =>
  access(file).then(
    () => true,
    () => false,
  )
const phpQuote = (value) => `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`

export function parseMysqlGreeting(packet) {
  if (!Buffer.isBuffer(packet) || packet.length < 5)
    throw new ChaiyoConnectionError('MYSQL_GREETING_INVALID')
  const length = packet.readUIntLE(0, 3)
  if (length > 65535 || length < 1 || packet.length < length + 4 || packet[3] !== 0)
    throw new ChaiyoConnectionError('MYSQL_GREETING_INVALID')
  const payload = packet.subarray(4, length + 4)
  if (payload[0] !== 10) throw new ChaiyoConnectionError('MYSQL_PROTOCOL_UNSUPPORTED')
  const versionEnd = payload.indexOf(0, 1)
  const capabilityOffset = versionEnd + 14
  if (versionEnd < 2 || payload.length < capabilityOffset + 2)
    throw new ChaiyoConnectionError('MYSQL_GREETING_INVALID')
  const lower = payload.readUInt16LE(capabilityOffset)
  const upper =
    payload.length >= capabilityOffset + 7 ? payload.readUInt16LE(capabilityOffset + 5) : 0
  return {
    protocol: 10,
    serverVersion: payload
      .subarray(1, versionEnd)
      .toString('ascii')
      .replace(/[^\x20-\x7e]/g, '?')
      .slice(0, 100),
    tlsAdvertised: (lower & 0x0800) !== 0,
    capabilities: ((upper << 16) | lower) >>> 0,
  }
}

/** Reads only the public server greeting. It never writes an auth/SSL/user packet. */
export function inspectMysqlTls({ host, port, timeoutMs = 5000 }) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port })
    let buffer = Buffer.alloc(0)
    let settled = false
    const finish = (error, result) => {
      if (settled) return
      settled = true
      socket.destroy()
      if (error) reject(error)
      else resolve(result)
    }
    socket.setTimeout(timeoutMs, () => finish(new ChaiyoConnectionError('MYSQL_GREETING_TIMEOUT')))
    socket.once('error', () => finish(new ChaiyoConnectionError('MYSQL_UNREACHABLE')))
    socket.once('end', () => finish(new ChaiyoConnectionError('MYSQL_GREETING_INCOMPLETE')))
    socket.on('data', (data) => {
      buffer = Buffer.concat([buffer, data])
      if (buffer.length > 65539) return finish(new ChaiyoConnectionError('MYSQL_GREETING_INVALID'))
      if (buffer.length < 4) return
      const length = buffer.readUIntLE(0, 3)
      if (length > 65535) return finish(new ChaiyoConnectionError('MYSQL_GREETING_INVALID'))
      if (buffer.length < length + 4) return
      try {
        finish(null, parseMysqlGreeting(buffer))
      } catch (error) {
        finish(error)
      }
    })
  })
}

function profilePaths(root) {
  const directory = path.join(root, '.esi-admin', 'chaiyo')
  return {
    directory,
    connection: path.join(directory, 'connection.json'),
    config: path.join(directory, 'config.php'),
    privateDirectory: path.join(directory, 'private'),
    bridge: path.join(root, '.esi-admin', 'dev', 'bridge.json'),
  }
}

export async function prepareChaiyoProfile({ root = repositoryRoot } = {}) {
  const paths = profilePaths(root)
  await mkdir(paths.directory, { recursive: true })
  if (!(await exists(paths.connection))) {
    await writeFile(
      paths.connection,
      JSON.stringify(
        { ...CHAIYO_TARGET, transport: 'legacy', password: '', tlsCaFile: '' },
        null,
        2,
      ) + '\n',
      { flag: 'wx', mode: 0o600 },
    )
  }
  return { connectionFile: paths.connection }
}

async function readConnection(paths, greeting) {
  let connection
  try {
    connection = JSON.parse(await readFile(paths.connection, 'utf8'))
  } catch {
    throw new ChaiyoConnectionError('CHAIYO_PROFILE_REQUIRED')
  }
  if (
    !connection ||
    Object.entries(CHAIYO_TARGET).some(([key, value]) => connection[key] !== value)
  )
    throw new ChaiyoConnectionError('CHAIYO_TARGET_INVALID')
  if (!['legacy', 'tls'].includes(connection.transport))
    throw new ChaiyoConnectionError('CHAIYO_TRANSPORT_REQUIRED')
  if (connection.transport === 'tls' && !greeting.tlsAdvertised)
    throw new ChaiyoConnectionError('SERVER_TLS_UNAVAILABLE', {
      host: CHAIYO_TARGET.host,
      port: CHAIYO_TARGET.port,
      serverVersion: greeting.serverVersion,
      credentialsSent: false,
    })
  if (
    connection.transport === 'tls' &&
    (typeof connection.tlsCaFile !== 'string' ||
      !path.isAbsolute(connection.tlsCaFile) ||
      !(await exists(connection.tlsCaFile)))
  )
    throw new ChaiyoConnectionError('CHAIYO_CA_REQUIRED')
  if (
    typeof connection.password !== 'string' ||
    connection.password.length < 1 ||
    connection.password.length > 1024
  )
    throw new ChaiyoConnectionError('CHAIYO_PASSWORD_REQUIRED', {
      credentialsSent: false,
      transport: connection.transport,
      serverVersion: greeting.serverVersion,
    })
  return connection
}

function phpConfiguration(connection, paths, internalKey, origins) {
  return {
    environment: 'development',
    database_target: 'chaiyo',
    database_transport: connection.transport,
    dsn: `mysql:host=${connection.host};port=${connection.port};dbname=${connection.database};charset=utf8mb4`,
    username: connection.username,
    password: connection.password,
    database_tls_ca: connection.tlsCaFile || '',
    database_tls_verify_server_cert: true,
    allowed_origins: origins,
    internal_key: internalKey,
    cookie_name: 'esi_admin_chaiyo_session',
    cookie_secure: false,
    private_directory: paths.privateDirectory,
    session_ttl: 28800,
    idle_timeout: 1800,
  }
}

function phpArguments(php) {
  return [
    '-n',
    '-d',
    `extension_dir=${path.join(path.dirname(php), 'ext')}`,
    '-d',
    'extension=pdo_mysql',
    '-d',
    'extension=openssl',
    '-d',
    'display_errors=0',
    '-d',
    'log_errors=0',
  ]
}

export function createChaiyoProbeProgram(root) {
  return `$stage='bootstrap';
try {
  require ${phpQuote(path.join(root, 'server/php/src/Config.php'))};
  require ${phpQuote(path.join(root, 'server/php/src/Store.php'))};
  $stage='decode-config';
  $config=json_decode(stream_get_contents(STDIN),true,512,JSON_THROW_ON_ERROR);
  if ($config['database_transport']==='tls') {
    $stage='tls-preflight';
    if (!function_exists('Esi\\Admin\\preflightChaiyoTls')) throw new RuntimeException('TLS preflight unavailable');
    \\Esi\\Admin\\preflightChaiyoTls($config);
  }
  $stage='database-connect';
  $pdo=\\Esi\\Admin\\connectDatabase($config);
  $stage='database-metadata';
  $metadata=$pdo->query('SELECT DATABASE() AS database_name, VERSION() AS server_version')->fetch();
  $stage='tls-status';
  $cipher=$pdo->query("SHOW SESSION STATUS LIKE 'Ssl_cipher'")->fetch();
  $version=$pdo->query("SHOW SESSION STATUS LIKE 'Ssl_version'")->fetch();
  $encrypted=!empty($cipher['Value']);
  $verified=$config['database_transport']==='tls' && $encrypted && in_array($version['Value'] ?? '',['TLSv1.2','TLSv1.3'],true);
  if ($config['database_transport']==='tls' && !$verified) throw new RuntimeException('TLS not verified');
  $stage='admin-count';
  $admins=(int)$pdo->query("SELECT COUNT(*) FROM admin_users WHERE role='admin' AND is_active=1")->fetchColumn();
  $stage='expected-database';
  if (($metadata['database_name'] ?? '')!=='esithcom_website' || $admins<1) throw new RuntimeException('Expected database/admin missing');
  $stage='response';
  echo json_encode(['database'=>$metadata['database_name'],'serverVersion'=>$metadata['server_version'],'tlsVersion'=>$version['Value'],'cipher'=>$cipher['Value'],'activeAdminCount'=>$admins,'transport'=>$config['database_transport'],'encrypted'=>$encrypted,'tlsVerified'=>$verified],JSON_THROW_ON_ERROR);
} catch (Throwable $error) {
  $diagnostic=['error'=>'CHAIYO_DATABASE_CHECK_FAILED','stage'=>$stage,'exceptionClass'=>get_class($error),'exceptionCode'=>is_int($error->getCode())?$error->getCode():0];
  if ($error instanceof PDOException) {
    $state=(string)($error->errorInfo[0] ?? $error->getCode());
    if (preg_match('/^[A-Z0-9]{5}$/D',$state)) $diagnostic['sqlState']=$state;
    $number=$error->errorInfo[1] ?? null;
    if (is_int($number) || (is_string($number) && preg_match('/^[0-9]+$/D',$number))) $diagnostic['driverCode']=(int)$number;
  }
  echo json_encode($diagnostic,JSON_THROW_ON_ERROR); exit(1);
}`
}

export function sanitizedChaiyoProbeError(value, exitCode = null) {
  const details = {}
  const stages = new Set([
    'bootstrap',
    'decode-config',
    'tls-preflight',
    'database-connect',
    'database-metadata',
    'tls-status',
    'admin-count',
    'expected-database',
    'response',
  ])
  details.stage = stages.has(value?.stage) ? value.stage : 'php-start'
  if (
    typeof value?.exceptionClass === 'string' &&
    /^[A-Za-z_\\][A-Za-z0-9_\\]{0,127}$/.test(value.exceptionClass)
  )
    details.exceptionClass = value.exceptionClass
  if (Number.isInteger(value?.exceptionCode)) details.exceptionCode = value.exceptionCode
  if (typeof value?.sqlState === 'string' && /^[A-Z0-9]{5}$/.test(value.sqlState))
    details.sqlState = value.sqlState
  if (Number.isInteger(value?.driverCode) && value.driverCode > 0 && value.driverCode <= 65535)
    details.driverCode = value.driverCode
  if (Number.isInteger(exitCode)) details.exitCode = exitCode
  const codes = {
    1045: 'CHAIYO_AUTH_DENIED',
    1130: 'CHAIYO_HOST_BLOCKED',
    1044: 'CHAIYO_DATABASE_DENIED',
    1049: 'CHAIYO_DATABASE_MISSING',
    1146: 'CHAIYO_SCHEMA_MISSING',
    1054: 'CHAIYO_SCHEMA_MISMATCH',
    2002: 'CHAIYO_MYSQL_UNREACHABLE',
    2003: 'CHAIYO_MYSQL_UNREACHABLE',
  }
  return new ChaiyoConnectionError(
    codes[details.driverCode] || 'CHAIYO_DATABASE_CHECK_FAILED',
    details,
  )
}

async function lintPhpProbe(php, code, root) {
  return new Promise((resolve, reject) => {
    const child = spawn(php, [...phpArguments(php), '-l'], {
      cwd: root,
      windowsHide: true,
      stdio: ['pipe', 'ignore', 'ignore'],
      timeout: 10000,
    })
    child.once('error', () =>
      reject(new ChaiyoConnectionError('PHP_RUNTIME_REQUIRED', { stage: 'php-lint' })),
    )
    child.once('close', (status) =>
      status === 0
        ? resolve()
        : reject(
            new ChaiyoConnectionError('CHAIYO_PHP_PROBE_INVALID', {
              stage: 'php-lint',
              exitCode: status,
            }),
          ),
    )
    child.stdin.end('<?php\n' + code)
  })
}

async function verifiedPhpProbe({ root, config }) {
  const php = getDevRuntimePaths().php
  if (!(await exists(php))) throw new ChaiyoConnectionError('PHP_RUNTIME_REQUIRED')
  const code = createChaiyoProbeProgram(root)
  await lintPhpProbe(php, code, root)
  return new Promise((resolve, reject) => {
    const child = spawn(php, [...phpArguments(php), '-r', code], {
      cwd: root,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 20000,
    })
    let output = ''
    child.stdout.on('data', (data) => {
      output += data
      if (output.length > 8192) child.kill()
    })
    child.once('error', () => reject(sanitizedChaiyoProbeError(null)))
    child.once('close', (status) => {
      try {
        const result = JSON.parse(output)
        if (status !== 0 || result.error) return reject(sanitizedChaiyoProbeError(result, status))
        if (
          !['legacy', 'tls'].includes(result.transport) ||
          result.transport !== config.database_transport ||
          typeof result.encrypted !== 'boolean' ||
          (result.transport === 'tls' &&
            (result.tlsVerified !== true || result.encrypted !== true)) ||
          result.database !== CHAIYO_TARGET.database ||
          !(result.activeAdminCount > 0)
        )
          throw new Error('Unexpected probe response')
        resolve(result)
      } catch {
        reject(sanitizedChaiyoProbeError(null, status))
      }
    })
    child.stdin.end(JSON.stringify(config))
  })
}

export async function checkChaiyoConnection({
  root = repositoryRoot,
  inspectServer = inspectMysqlTls,
  probe = verifiedPhpProbe,
  origins = ['http://localhost:5173'],
} = {}) {
  const greeting = await inspectServer(CHAIYO_TARGET)
  const paths = profilePaths(root)
  const connection = await readConnection(paths, greeting)
  const internalKey = randomBytes(32).toString('base64url')
  const config = phpConfiguration(connection, paths, internalKey, origins)
  const metadata = await probe({ root, config })
  if (
    metadata?.transport !== config.database_transport ||
    typeof metadata.encrypted !== 'boolean' ||
    (metadata.transport === 'tls' &&
      (metadata.tlsVerified !== true || metadata.encrypted !== true)) ||
    metadata.database !== CHAIYO_TARGET.database ||
    !(metadata.activeAdminCount > 0)
  )
    throw new ChaiyoConnectionError('CHAIYO_DATABASE_CHECK_FAILED')
  return { metadata, config, paths }
}

async function atomicWrite(file, contents) {
  await mkdir(path.dirname(file), { recursive: true })
  const temporary = `${file}.${randomUUID()}.tmp`
  await writeFile(temporary, contents, { flag: 'wx', mode: 0o600 })
  try {
    await rename(temporary, file)
  } catch (error) {
    await unlink(temporary).catch(() => {})
    throw error
  }
}

const portOpen = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port })
    const done = (result) => {
      socket.destroy()
      resolve(result)
    }
    socket.once('connect', () => done(true))
    socket.once('error', () => done(false))
    socket.setTimeout(500, () => done(false))
  })

async function stopChild(child) {
  if (!child || child.exitCode !== null) return
  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 5000)
    child.once('close', () => {
      clearTimeout(timeout)
      resolve()
    })
    child.kill()
  })
}

export async function startChaiyoAuth({ root = repositoryRoot, port = 8788, ...options } = {}) {
  const { metadata, config, paths } = await checkChaiyoConnection({ root, ...options })
  if (await portOpen(port)) throw new ChaiyoConnectionError('CHAIYO_PHP_PORT_IN_USE')
  await mkdir(paths.privateDirectory, { recursive: true })
  const encoded = Buffer.from(JSON.stringify(config)).toString('base64')
  await atomicWrite(
    paths.config,
    `<?php\n// Private Chaiyo profile for localhost only.\nreturn json_decode(base64_decode('${encoded}'),true,512,JSON_THROW_ON_ERROR);\n`,
  )
  const php = getDevRuntimePaths().php
  const publicRoot = path.join(root, 'server/php/public')
  const log = await open(path.join(paths.directory, 'php-server.log'), 'a', 0o600)
  let child
  let previousBridge
  try {
    previousBridge = await readFile(paths.bridge).catch((error) => {
      if (error.code === 'ENOENT') return null
      throw error
    })
    child = spawn(
      php,
      [
        ...phpArguments(php),
        '-S',
        `127.0.0.1:${port}`,
        '-t',
        publicRoot,
        path.join(publicRoot, 'router.php'),
      ],
      {
        cwd: root,
        env: { ...process.env, ESI_ADMIN_CONFIG: paths.config },
        windowsHide: true,
        stdio: ['ignore', log.fd, log.fd],
      },
    )
    const started = new Promise((resolve, reject) => {
      child.once('spawn', resolve)
      child.once('error', reject)
    })
    await started
    await log.close()
    const deadline = Date.now() + 10000
    while (!(await portOpen(port))) {
      if (child.exitCode !== null || Date.now() > deadline)
        throw new ChaiyoConnectionError('CHAIYO_PHP_START_FAILED')
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    const endpoint = `http://127.0.0.1:${port}`
    const response = await fetch(endpoint + '/api/admin/auth/authorize', {
      headers: { 'X-ESI-Internal-Key': config.internal_key, 'X-ESI-Request-Method': 'GET' },
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    })
    const body = await response.json()
    if (response.status !== 401 || body.error !== 'AUTH_REQUIRED')
      throw new ChaiyoConnectionError('CHAIYO_PHP_START_FAILED')
    await atomicWrite(
      paths.bridge,
      JSON.stringify({ profile: 'chaiyo', endpoint, internalKey: config.internal_key }, null, 2) +
        '\n',
    )
    return {
      endpoint,
      metadata,
      async stop() {
        await stopChild(child)
        const current = JSON.parse(await readFile(paths.bridge, 'utf8').catch(() => 'null'))
        if (
          current?.profile === 'chaiyo' &&
          current.internalKey === config.internal_key &&
          current.endpoint === endpoint
        ) {
          if (previousBridge) await atomicWrite(paths.bridge, previousBridge)
          else await unlink(paths.bridge)
        }
      },
    }
  } catch (error) {
    await log.close().catch(() => {})
    await stopChild(child)
    throw error instanceof ChaiyoConnectionError
      ? error
      : new ChaiyoConnectionError('CHAIYO_PHP_START_FAILED')
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const command = process.argv[2] || 'check'
    if (command === 'prepare') console.log(JSON.stringify(await prepareChaiyoProfile()))
    else if (command === 'check')
      console.log(JSON.stringify((await checkChaiyoConnection()).metadata))
    else if (command === 'start') {
      const runtime = await startChaiyoAuth()
      console.log(
        `Chaiyo auth profile ready on ${runtime.endpoint}; existing localhost Vite can use it`,
      )
      for (const signal of ['SIGINT', 'SIGTERM'])
        process.once(signal, async () => {
          await runtime.stop()
          process.exit(0)
        })
    } else
      throw new ChaiyoConnectionError('Usage: node scripts/chaiyo-auth.mjs [prepare|check|start]')
  } catch (error) {
    console.error(
      JSON.stringify({
        error: error instanceof ChaiyoConnectionError ? error.code : 'CHAIYO_PROFILE_FAILED',
        ...(error instanceof ChaiyoConnectionError ? error.details : {}),
      }),
    )
    process.exitCode = 1
  }
}
