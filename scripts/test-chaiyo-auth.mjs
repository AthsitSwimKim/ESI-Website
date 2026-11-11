import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  CHAIYO_TARGET,
  checkChaiyoConnection,
  createChaiyoProbeProgram,
  inspectMysqlTls,
  parseMysqlGreeting,
  prepareChaiyoProfile,
  sanitizedChaiyoProbeError,
  startChaiyoAuth,
} from './chaiyo-auth.mjs'
import { getDevRuntimePaths } from './dev-auth.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const privateParent = path.resolve(root, '.esi-admin')

function greeting({ ssl = false, protocol = 10 } = {}) {
  const version = Buffer.from('5.5.44-test\0')
  const payload = Buffer.alloc(1 + version.length + 4 + 8 + 1 + 2 + 1 + 2 + 2 + 1 + 10)
  payload[0] = protocol
  version.copy(payload, 1)
  const lowerOffset = version.length + 14
  payload.writeUInt16LE(0x0200 | (ssl ? 0x0800 : 0), lowerOffset)
  payload[lowerOffset + 2] = 45
  const header = Buffer.alloc(4)
  header.writeUIntLE(payload.length, 0, 3)
  return Buffer.concat([header, payload])
}

async function fixture() {
  await mkdir(privateParent, { recursive: true })
  return mkdtemp(path.join(privateParent, 'chaiyo-check-test-'))
}

async function cleanup(directory) {
  const resolved = path.resolve(directory)
  if (!resolved.startsWith(privateParent + path.sep))
    throw new Error('Unsafe fixture cleanup target')
  await rm(resolved, { recursive: true, force: true })
}

const tlsGreeting = async () => ({ tlsAdvertised: true, serverVersion: 'test' })

test('generated PHP probe compiles before receiving any credentials', () => {
  const result = spawnSync(getDevRuntimePaths().php, ['-n', '-l'], {
    input: '<?php\n' + createChaiyoProbeProgram(root),
    windowsHide: true,
  })
  assert.equal(result.status, 0)
})

test('connection diagnostics preserve only stable stage, class and numeric driver metadata', () => {
  const error = sanitizedChaiyoProbeError(
    {
      stage: 'database-connect',
      exceptionClass: 'PDOException',
      exceptionCode: 0,
      sqlState: '28000',
      driverCode: 1045,
      message: 'must-not-be-exposed',
      password: 'fixture-secret',
    },
    1,
  )
  assert.equal(error.code, 'CHAIYO_AUTH_DENIED')
  assert.deepEqual(error.details, {
    stage: 'database-connect',
    exceptionClass: 'PDOException',
    exceptionCode: 0,
    sqlState: '28000',
    driverCode: 1045,
    exitCode: 1,
  })
  for (const [driverCode, code] of [
    [1130, 'CHAIYO_HOST_BLOCKED'],
    [1044, 'CHAIYO_DATABASE_DENIED'],
    [1049, 'CHAIYO_DATABASE_MISSING'],
    [1146, 'CHAIYO_SCHEMA_MISSING'],
  ])
    assert.equal(sanitizedChaiyoProbeError({ driverCode }).code, code)
  const missing = sanitizedChaiyoProbeError(
    { stage: 'unsafe-stage-value', sqlState: 'secret', exceptionClass: 'invalid class / secret' },
    255,
  )
  assert.deepEqual(missing.details, { stage: 'php-start', exitCode: 255 })
})

test('MySQL greeting parser detects CLIENT_SSL and rejects invalid packets', () => {
  assert.equal(parseMysqlGreeting(greeting()).tlsAdvertised, false)
  assert.equal(parseMysqlGreeting(greeting({ ssl: true })).tlsAdvertised, true)
  assert.equal(parseMysqlGreeting(greeting()).serverVersion, '5.5.44-test')
  assert.throws(() => parseMysqlGreeting(Buffer.from([0, 0, 0, 0])), {
    code: 'MYSQL_GREETING_INVALID',
  })
  assert.throws(() => parseMysqlGreeting(greeting({ protocol: 9 })), {
    code: 'MYSQL_PROTOCOL_UNSUPPORTED',
  })
})

test('capability inspection handles split packets and sends zero application bytes', async () => {
  const server = net.createServer()
  let clientBytes = 0
  const sockets = new Set()
  server.on('connection', (socket) => {
    sockets.add(socket)
    socket.on('data', (data) => {
      clientBytes += data.length
    })
    socket.once('close', () => sockets.delete(socket))
    const packet = greeting()
    socket.write(packet.subarray(0, 3))
    setTimeout(() => socket.end(packet.subarray(3)), 10)
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  try {
    const result = await inspectMysqlTls({ host: '127.0.0.1', port: server.address().port })
    assert.equal(result.tlsAdvertised, false)
    assert.equal(clientBytes, 0)
  } finally {
    for (const socket of sockets) socket.destroy()
    await new Promise((resolve) => server.close(resolve))
  }
})

test('an explicit TLS profile never falls back to legacy or calls PHP on a non-TLS server', async () => {
  const directory = await fixture()
  let called = false
  try {
    const { connectionFile } = await prepareChaiyoProfile({ root: directory })
    await writeFile(
      connectionFile,
      JSON.stringify({ ...CHAIYO_TARGET, transport: 'tls', password: '', tlsCaFile: '' }),
    )
    await assert.rejects(
      checkChaiyoConnection({
        root: directory,
        inspectServer: async () => ({ tlsAdvertised: false, serverVersion: '5.5.44' }),
        probe: async () => {
          called = true
          throw new Error('Must never authenticate')
        },
      }),
      {
        code: 'SERVER_TLS_UNAVAILABLE',
        details: {
          host: CHAIYO_TARGET.host,
          port: 3306,
          serverVersion: '5.5.44',
          credentialsSent: false,
        },
      },
    )
    assert.equal(called, false)
    await assert.rejects(readFile(path.join(directory, '.esi-admin/chaiyo/config.php')), {
      code: 'ENOENT',
    })
  } finally {
    await cleanup(directory)
  }
})

test('prepare writes a blank template and never overwrites an existing profile', async () => {
  const directory = await fixture()
  try {
    const { connectionFile } = await prepareChaiyoProfile({ root: directory })
    const connection = JSON.parse(await readFile(connectionFile, 'utf8'))
    assert.deepEqual(connection, {
      ...CHAIYO_TARGET,
      transport: 'legacy',
      password: '',
      tlsCaFile: '',
    })
    connection.password = 'fixture-only-password'
    await writeFile(connectionFile, JSON.stringify(connection))
    await prepareChaiyoProfile({ root: directory })
    assert.equal(
      JSON.parse(await readFile(connectionFile, 'utf8')).password,
      'fixture-only-password',
    )
  } finally {
    await cleanup(directory)
  }
})

test('missing explicit transport, CA/password or unverified TLS metadata cannot activate a profile', async () => {
  const directory = await fixture()
  try {
    const { connectionFile } = await prepareChaiyoProfile({ root: directory })
    await writeFile(
      connectionFile,
      JSON.stringify({ ...CHAIYO_TARGET, password: '', tlsCaFile: '' }),
    )
    await assert.rejects(checkChaiyoConnection({ root: directory, inspectServer: tlsGreeting }), {
      code: 'CHAIYO_TRANSPORT_REQUIRED',
    })
    await writeFile(
      connectionFile,
      JSON.stringify({ ...CHAIYO_TARGET, transport: 'tls', password: '', tlsCaFile: '' }),
    )
    await assert.rejects(checkChaiyoConnection({ root: directory, inspectServer: tlsGreeting }), {
      code: 'CHAIYO_CA_REQUIRED',
    })
    const ca = path.join(directory, 'fixture-ca.pem')
    await writeFile(ca, 'fixture only')
    await writeFile(
      connectionFile,
      JSON.stringify({ ...CHAIYO_TARGET, transport: 'tls', password: '', tlsCaFile: ca }),
    )
    await assert.rejects(checkChaiyoConnection({ root: directory, inspectServer: tlsGreeting }), {
      code: 'CHAIYO_PASSWORD_REQUIRED',
    })
    await writeFile(
      connectionFile,
      JSON.stringify({
        ...CHAIYO_TARGET,
        transport: 'tls',
        password: 'fixture-only-password',
        tlsCaFile: ca,
      }),
    )
    await assert.rejects(
      checkChaiyoConnection({
        root: directory,
        inspectServer: tlsGreeting,
        probe: async () => ({ tlsVerified: false }),
      }),
      { code: 'CHAIYO_DATABASE_CHECK_FAILED' },
    )
    await assert.rejects(readFile(path.join(directory, '.esi-admin/chaiyo/config.php')), {
      code: 'ENOENT',
    })
  } finally {
    await cleanup(directory)
  }
})

test('explicit legacy profile accepts a standard server but requires password before any authentication', async () => {
  const directory = await fixture()
  let probeCalls = 0
  const standardServer = async () => ({ tlsAdvertised: false, serverVersion: '5.5.44-test' })
  try {
    const { connectionFile } = await prepareChaiyoProfile({ root: directory })
    await assert.rejects(
      checkChaiyoConnection({
        root: directory,
        inspectServer: standardServer,
        probe: async () => {
          probeCalls++
          throw new Error('Missing password must not authenticate')
        },
      }),
      { code: 'CHAIYO_PASSWORD_REQUIRED' },
    )
    assert.equal(probeCalls, 0)
    await writeFile(
      connectionFile,
      JSON.stringify({
        ...CHAIYO_TARGET,
        transport: 'legacy',
        password: 'fixture-only-password',
        tlsCaFile: '',
      }),
    )
    const result = await checkChaiyoConnection({
      root: directory,
      inspectServer: standardServer,
      probe: async ({ config }) => {
        probeCalls++
        assert.equal(config.database_transport, 'legacy')
        assert.equal(config.cookie_name, 'esi_admin_chaiyo_session')
        return {
          database: CHAIYO_TARGET.database,
          transport: 'legacy',
          encrypted: false,
          tlsVerified: false,
          activeAdminCount: 1,
        }
      },
    })
    assert.equal(result.metadata.encrypted, false)
    assert.equal(result.metadata.tlsVerified, false)
    assert.equal(probeCalls, 1)
    await assert.rejects(readFile(path.join(directory, '.esi-admin/chaiyo/config.php')), {
      code: 'ENOENT',
    })
  } finally {
    await cleanup(directory)
  }
})

test('failed start preserves the existing local bridge byte-for-byte', async () => {
  const directory = await fixture()
  const bridgeFile = path.join(directory, '.esi-admin/dev/bridge.json')
  const bridge = JSON.stringify({
    profile: 'local',
    endpoint: 'http://127.0.0.1:8787',
    internalKey: 'fixture-only-internal-key',
  })
  try {
    await mkdir(path.dirname(bridgeFile), { recursive: true })
    await writeFile(bridgeFile, bridge)
    await prepareChaiyoProfile({ root: directory })
    await assert.rejects(
      startChaiyoAuth({
        root: directory,
        inspectServer: async () => ({ tlsAdvertised: false, serverVersion: 'test' }),
      }),
      { code: 'CHAIYO_PASSWORD_REQUIRED' },
    )
    assert.equal(await readFile(bridgeFile, 'utf8'), bridge)
  } finally {
    await cleanup(directory)
  }
})
