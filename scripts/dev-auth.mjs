/** Private, loopback-only PHP/MySQL development runtime. Never reads production credentials. */
import { randomBytes, randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { access, mkdir, open, readFile, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
const defaultPrivateRoot = path.join(repositoryRoot, '.esi-admin', 'dev')
const phpQuote = (value) => `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
const token = () => randomBytes(32).toString('base64url')
const exists = (file) =>
  access(file).then(
    () => true,
    () => false,
  )

export function getDevRuntimePaths(privateRoot = defaultPrivateRoot) {
  privateRoot = path.resolve(privateRoot)
  return {
    privateRoot,
    php: process.env.ESI_PHP_BINARY || path.join(defaultPrivateRoot, 'tools', 'php', 'php.exe'),
    phpIni: path.join(privateRoot, 'php.ini'),
    mariaRoot: path.join(defaultPrivateRoot, 'tools', 'mariadb-11.4.13-winx64'),
    data: path.join(privateRoot, 'mysql-data'),
    secrets: path.join(privateRoot, 'dev-secrets.json'),
    credentials: path.join(privateRoot, 'dev-admin-credentials.txt'),
    config: path.join(privateRoot, 'config.php'),
    bootstrapConfig: path.join(privateRoot, 'bootstrap-config.php'),
    bridge: path.join(privateRoot, 'bridge.json'),
    dbPort: 13307,
  }
}

function run(
  binary,
  args,
  { env = process.env, input, cwd = repositoryRoot, timeout = 60000 } = {},
) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, {
      cwd,
      env,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (data) => {
      stdout += data
    })
    child.stderr.on('data', (data) => {
      stderr += data
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr })
      else
        reject(
          new Error(
            `Development runtime command failed (${path.basename(binary)}, exit ${code}). ${stderr.replace(/[A-Za-z0-9_-]{43}/g, '[redacted]').slice(0, 500)}`,
          ),
        )
    })
    child.stdin.end(input)
  })
}

const listening = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port })
    const done = (value) => {
      socket.destroy()
      resolve(value)
    }
    socket.setTimeout(500, () => done(false))
    socket.once('connect', () => done(true))
    socket.once('error', () => done(false))
  })

const availablePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
  })

async function waitForPort(port, child) {
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(`Local service stopped before becoming ready (exit ${child.exitCode})`)
    if (await listening(port)) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Local service did not become ready on 127.0.0.1:${port}`)
}

async function spawnLogged(binary, args, logFile, env = process.env) {
  const log = await open(logFile, 'a', 0o600)
  const child = spawn(binary, args, {
    cwd: repositoryRoot,
    env,
    windowsHide: true,
    stdio: ['ignore', log.fd, log.fd],
  })
  // Register before yielding: spawn can fire while the log descriptor is closing.
  const started = new Promise((resolve, reject) => {
    child.once('spawn', resolve)
    child.once('error', reject)
  })
  try {
    await started
  } finally {
    await log.close()
  }
  return child
}

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

async function stopDatabase(child, paths) {
  if (!child || child.exitCode !== null) return
  try {
    await run(
      path.join(paths.mariaRoot, 'bin', 'mariadb-admin.exe'),
      [
        `--defaults-extra-file=${path.join(paths.privateRoot, 'mysql-root-client.ini')}`,
        'shutdown',
      ],
      { timeout: 5000 },
    )
  } catch {
    // Startup can fail before the root client file is written; stop only our child.
  }
  await stopChild(child)
}

function configuration(paths, secrets, { origins, privateDirectory, rootUser = false }) {
  return {
    environment: 'development',
    dsn: `mysql:host=127.0.0.1;port=${paths.dbPort};dbname=esi_dev;charset=utf8mb4`,
    username: rootUser ? 'root' : 'esi_dev_app',
    password: rootUser ? secrets.rootPassword : secrets.dbPassword,
    allowed_origins: origins,
    internal_key: secrets.internalKey,
    cookie_name: 'esi_admin_dev_session',
    cookie_secure: false,
    private_directory: privateDirectory,
    session_ttl: 28800,
    idle_timeout: 1800,
  }
}

function phpConfiguration(config) {
  return `<?php\n// Private DEV configuration. Never upload this file.\nreturn [\n${Object.entries(
    config,
  )
    .map(([key, value]) => {
      const literal = Array.isArray(value)
        ? `[${value.map(phpQuote).join(', ')}]`
        : typeof value === 'boolean'
          ? String(value)
          : typeof value === 'number'
            ? String(value)
            : phpQuote(value)
      return `    ${phpQuote(key)} => ${literal},`
    })
    .join('\n')}\n];\n`
}

export async function prepareDevAuth({
  privateRoot = defaultPrivateRoot,
  origins = ['http://localhost:5173'],
  port = 8787,
  writeBridge = true,
} = {}) {
  const paths = getDevRuntimePaths(privateRoot)
  await mkdir(paths.privateRoot, { recursive: true })
  await mkdir(path.join(paths.privateRoot, 'private'), { recursive: true })
  let secrets
  try {
    secrets = JSON.parse(await readFile(paths.secrets, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    secrets = {
      version: 1,
      environment: 'development',
      dbPort: path.resolve(privateRoot) === defaultPrivateRoot ? 13307 : await availablePort(),
      rootPassword: token(),
      dbPassword: token(),
      internalKey: token(),
      username: 'esi_dev_admin',
      password: token(),
    }
    await writeFile(paths.secrets, JSON.stringify(secrets, null, 2) + '\n', {
      flag: 'wx',
      mode: 0o600,
    })
  }
  if (
    secrets.version !== 1 ||
    secrets.environment !== 'development' ||
    !['rootPassword', 'dbPassword', 'internalKey', 'password'].every((key) =>
      /^[A-Za-z0-9_-]{43}$/.test(secrets[key]),
    ) ||
    secrets.username !== 'esi_dev_admin' ||
    !Number.isInteger(secrets.dbPort)
  )
    throw new Error('Invalid private development credentials; refusing to overwrite them')
  paths.dbPort = secrets.dbPort

  const phpExtensionDir = path.join(path.dirname(paths.php), 'ext').replaceAll('\\', '/')
  await writeFile(
    paths.phpIni,
    [
      '[PHP]',
      `extension_dir = "${phpExtensionDir}"`,
      'extension=pdo_mysql',
      'date.timezone=UTC',
      'expose_php=Off',
      'display_errors=Off',
      'log_errors=On',
      `error_log="${path.join(paths.privateRoot, 'php-error.log').replaceAll('\\', '/')}"`,
      '',
    ].join('\n'),
    { mode: 0o600 },
  )
  const config = configuration(paths, secrets, {
    origins,
    privateDirectory: path.join(paths.privateRoot, 'private'),
  })
  await writeFile(paths.config, phpConfiguration(config), { mode: 0o600 })
  await writeFile(
    paths.bootstrapConfig,
    phpConfiguration({ ...config, username: 'root', password: secrets.rootPassword }),
    { mode: 0o600 },
  )
  await writeFile(
    paths.credentials,
    [
      'ESI DEV ONLY — separate from the Hosting Admin account',
      `Database: esi_dev on 127.0.0.1:${paths.dbPort}`,
      `Username: ${secrets.username}`,
      `Password: ${secrets.password}`,
      '',
      'Do not upload this file or reuse these credentials on Hosting.',
      '',
    ].join('\n'),
    { mode: 0o600 },
  )
  if (writeBridge)
    await writeFile(
      paths.bridge,
      JSON.stringify(
        { endpoint: `http://127.0.0.1:${port}`, internalKey: secrets.internalKey },
        null,
        2,
      ) + '\n',
      { mode: 0o600 },
    )
  return { paths, secrets, config }
}

async function ensureDatabase(paths, secrets, { root = repositoryRoot } = {}) {
  const installer = path.join(paths.mariaRoot, 'bin', 'mariadb-install-db.exe')
  const server = path.join(paths.mariaRoot, 'bin', 'mariadbd.exe')
  const client = path.join(paths.mariaRoot, 'bin', 'mariadb.exe')
  const init = path.join(root, 'server', 'php', 'bin', 'init-dev.php')
  if (!(await exists(init))) throw new Error('PHP development initializer has not been created yet')
  if (!(await exists(paths.php)) || !(await exists(server)))
    throw new Error(
      'Portable PHP/MariaDB tools are missing. See database/dev-auth.md for setup paths.',
    )
  if (!(await exists(path.join(paths.data, 'mysql')))) {
    await run(installer, [
      `--datadir=${paths.data}`,
      `--password=${secrets.rootPassword}`,
      `--port=${paths.dbPort}`,
      '--silent',
    ])
  }
  const serverConfig = path.join(paths.privateRoot, 'mariadb.ini')
  await writeFile(
    serverConfig,
    [
      '[mysqld]',
      `basedir="${paths.mariaRoot.replaceAll('\\', '/')}"`,
      `datadir="${paths.data.replaceAll('\\', '/')}"`,
      `port=${paths.dbPort}`,
      'bind-address=127.0.0.1',
      'skip-name-resolve',
      'character-set-server=utf8mb4',
      'collation-server=utf8mb4_unicode_ci',
      `log-error="${path.join(paths.privateRoot, 'mariadb-error.log').replaceAll('\\', '/')}"`,
      '',
    ].join('\n'),
    { mode: 0o600 },
  )
  let child
  try {
    if (!(await listening(paths.dbPort))) {
      child = await spawnLogged(
        server,
        [`--defaults-file=${serverConfig}`, '--console'],
        path.join(paths.privateRoot, 'mariadb-console.log'),
      )
      await waitForPort(paths.dbPort, child)
    }
    const clientConfig = path.join(paths.privateRoot, 'mysql-root-client.ini')
    await writeFile(
      clientConfig,
      [
        '[client]',
        'host=127.0.0.1',
        `port=${paths.dbPort}`,
        'protocol=tcp',
        'user=root',
        `password=${secrets.rootPassword}`,
        '',
      ].join('\n'),
      { mode: 0o600 },
    )
    // Root is used only for local setup; the HTTP API gets DML privileges on esi_dev only.
    await run(client, [`--defaults-extra-file=${clientConfig}`, '--batch'], {
      input: [
        'CREATE DATABASE IF NOT EXISTS esi_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
        `CREATE USER IF NOT EXISTS 'esi_dev_app'@'127.0.0.1' IDENTIFIED BY '${secrets.dbPassword}';`,
        "GRANT SELECT,INSERT,UPDATE,DELETE ON esi_dev.* TO 'esi_dev_app'@'127.0.0.1';",
      ].join('\n'),
    })
    const initialization = await run(paths.php, ['-c', paths.phpIni, init], {
      cwd: root,
      env: {
        ...process.env,
        ESI_ADMIN_CONFIG: paths.bootstrapConfig,
        ESI_DEV_ADMIN_USERNAME: secrets.username,
        ESI_DEV_ADMIN_PASSWORD: secrets.password,
      },
    })
    return { child, initialization: initialization.stdout }
  } catch (error) {
    await stopDatabase(child, paths)
    throw error
  }
}

export async function startDevAuth({
  root = repositoryRoot,
  privateRoot = defaultPrivateRoot,
  origins = ['http://localhost:5173'],
  port = 8787,
  writeBridge = port === 8787,
} = {}) {
  if (port === 0) port = await availablePort()
  if (await listening(port)) throw new Error(`PHP development port ${port} is already in use`)
  const prepared = await prepareDevAuth({ privateRoot, origins, port, writeBridge })
  const { paths, secrets } = prepared
  const db = await ensureDatabase(paths, secrets, { root })
  let phpChild
  try {
    const runDirectory = path.join(paths.privateRoot, 'runs', randomUUID())
    await mkdir(runDirectory, { recursive: true })
    const phpConfig = path.join(runDirectory, 'config.php')
    await writeFile(
      phpConfig,
      phpConfiguration(configuration(paths, secrets, { origins, privateDirectory: runDirectory })),
      { mode: 0o600 },
    )
    const publicRoot = path.join(root, 'server', 'php', 'public')
    phpChild = await spawnLogged(
      paths.php,
      [
        '-c',
        paths.phpIni,
        '-S',
        `127.0.0.1:${port}`,
        '-t',
        publicRoot,
        path.join(publicRoot, 'router.php'),
      ],
      path.join(runDirectory, 'php-server.log'),
      { ...process.env, ESI_ADMIN_CONFIG: phpConfig },
    )
    await waitForPort(port, phpChild)
    const endpoint = `http://127.0.0.1:${port}`
    if (writeBridge)
      await writeFile(
        paths.bridge,
        JSON.stringify({ endpoint, internalKey: secrets.internalKey }, null, 2) + '\n',
        { mode: 0o600 },
      )
    let stopped = false
    return {
      endpoint,
      internalKey: secrets.internalKey,
      username: secrets.username,
      password: secrets.password,
      credentialsFile: paths.credentials,
      php: paths.php,
      phpIni: paths.phpIni,
      configFile: phpConfig,
      dbPort: paths.dbPort,
      initialization: db.initialization,
      async stop() {
        if (stopped) return
        stopped = true
        await stopChild(phpChild)
        await stopDatabase(db.child, paths)
      },
    }
  } catch (error) {
    await stopChild(phpChild)
    await stopDatabase(db.child, paths)
    throw error
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] || 'start'
  try {
    if (command === 'prepare') {
      const { paths } = await prepareDevAuth()
      console.log(`Private DEV configuration prepared: ${paths.config}`)
      console.log(`DEV credentials: ${paths.credentials}`)
    } else if (command === 'start') {
      const runtime = await startDevAuth()
      console.log(`PHP development authentication: ${runtime.endpoint}`)
      console.log(`DEV credentials: ${runtime.credentialsFile}`)
      const stop = async () => {
        await runtime.stop()
        process.exit(0)
      }
      process.once('SIGINT', stop)
      process.once('SIGTERM', stop)
    } else throw new Error('Usage: node scripts/dev-auth.mjs [prepare|start]')
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
