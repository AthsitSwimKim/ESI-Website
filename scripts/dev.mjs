/** Start the loopback-only PHP auth service and Vite together. */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { getDevRuntimePaths, startDevAuth } from './dev-auth.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const origin = 'http://localhost:5173'
let auth
let server

async function existingAuth() {
  let bridge
  try {
    bridge = JSON.parse(await readFile(getDevRuntimePaths().bridge, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
  if ((bridge.profile ?? 'local') !== 'local')
    throw new Error(
      'Chaiyo profile is active. Plain npm run dev will not reuse a remote database profile; stop that profile first.',
    )
  const endpoint = new URL(bridge.endpoint)
  if (
    endpoint.protocol !== 'http:' ||
    !['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname) ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash ||
    endpoint.pathname !== '/' ||
    typeof bridge.internalKey !== 'string' ||
    bridge.internalKey.length < 32
  ) {
    throw new Error('Invalid private DEV auth bridge; refusing to use it')
  }
  try {
    const response = await fetch(new URL('/api/admin/auth/authorize', endpoint), {
      headers: {
        'X-ESI-Internal-Key': bridge.internalKey,
        'X-ESI-Request-Method': 'GET',
      },
      redirect: 'error',
      signal: AbortSignal.timeout(3000),
    })
    const result = await response.json()
    if (response.status !== 401 || result.error !== 'AUTH_REQUIRED')
      throw new Error('Existing auth endpoint did not pass its private-key check')
    return true
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') return false
    throw error
  }
}

async function stop() {
  await server?.close()
  await auth?.stop()
}

try {
  if (!(await existingAuth())) auth = await startDevAuth({ root, origins: [origin] })
  server = await createServer({ root, server: { host: 'localhost', port: 5173, strictPort: true } })
  await server.listen()
  server.printUrls()
  console.log(`Admin login: ${origin}/admin-portal-update/login`)
  console.log(`DEV credentials: ${getDevRuntimePaths().credentials}`)
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await stop()
      process.exit(0)
    })
  }
} catch (error) {
  await stop()
  console.error(error.message)
  process.exitCode = 1
}
