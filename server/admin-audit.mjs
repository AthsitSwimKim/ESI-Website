import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const actions = new Set(['save_draft', 'publish', 'unpublish', 'delete', 'upload'])
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/
const pending = new Map()
const directory = (root) => path.join(root, '.esi-admin', 'audit-outbox')

/** Public metadata only: this queue never stores cookies, credentials or image data. */
export function createProjectAuditEvents(context, action, result, details = {}) {
  if (!context) return []
  if (
    !Number.isSafeInteger(context.actorId) ||
    context.actorId < 1 ||
    typeof context.scope !== 'string' ||
    !actions.has(action) ||
    !['success', 'failure'].includes(result)
  )
    throw new Error('AUDIT_EVENT_INVALID')
  const safe = {}
  if (
    Number.isSafeInteger(details.projectId) &&
    details.projectId > 0 &&
    details.projectId <= 4294967295
  )
    safe.projectId = details.projectId
  if (typeof details.title === 'string')
    safe.title = Array.from(details.title).slice(0, 200).join('')
  if (typeof details.created === 'boolean') safe.created = details.created
  if (
    Number.isSafeInteger(details.uploadCount) &&
    details.uploadCount > 0 &&
    details.uploadCount <= 11
  )
    safe.uploadCount = details.uploadCount
  if (
    Number.isSafeInteger(details.migratedCount) &&
    details.migratedCount >= 0 &&
    details.migratedCount <= 10000
  )
    safe.migratedCount = details.migratedCount
  if (typeof details.reason === 'string' && /^[A-Z_]{1,64}$/.test(details.reason))
    safe.reason = details.reason
  const create = (eventAction, eventDetails) => ({
    eventId: randomUUID(),
    actorId: context.actorId,
    scope: context.scope,
    action: eventAction,
    result,
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    details: eventDetails,
  })
  const events = [create(action, safe)]
  if (result === 'success' && action !== 'upload' && safe.uploadCount)
    events.push(
      create('upload', {
        projectId: safe.projectId,
        title: safe.title,
        uploadCount: safe.uploadCount,
      }),
    )
  return events
}

export async function enqueueAdminAudit(root, event) {
  if (
    !uuid.test(event?.eventId) ||
    !actions.has(event.action) ||
    !Number.isSafeInteger(event.actorId) ||
    event.actorId < 1 ||
    !['success', 'failure'].includes(event.result) ||
    typeof event.scope !== 'string' ||
    !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(event.createdAt) ||
    !event.details ||
    typeof event.details !== 'object'
  )
    throw new Error('AUDIT_EVENT_INVALID')
  const dir = directory(root)
  await mkdir(dir, { recursive: true })
  const file = path.join(dir, event.eventId + '.json')
  const temporary = file + '.' + randomUUID() + '.tmp'
  try {
    await writeFile(temporary, JSON.stringify(event) + '\n', { flag: 'wx', mode: 0o600 })
    await rename(temporary, file)
  } finally {
    await unlink(temporary).catch(() => {})
  }
}

/** Acknowledged delivery only. Profile changes never replay an event into another database. */
export function flushAdminAudit(root, scope, deliver) {
  const key = path.resolve(root)
  if (pending.has(key)) return pending.get(key)
  const work = (async () => {
    let files
    try {
      files = await readdir(directory(root))
    } catch (error) {
      if (error.code === 'ENOENT') return 0
      throw error
    }
    let delivered = 0
    let corrupt = false
    for (const name of files
      .filter((f) => uuid.test(f.replace(/\.json$/, '')) && f.endsWith('.json'))
      .sort()) {
      const file = path.join(directory(root), name)
      let event
      try {
        event = JSON.parse(await readFile(file, 'utf8'))
        if (
          event.eventId + '.json' !== name ||
          typeof event.scope !== 'string' ||
          !Number.isSafeInteger(event.actorId) ||
          event.actorId < 1 ||
          !actions.has(event.action) ||
          !['success', 'failure'].includes(event.result) ||
          !event.details ||
          typeof event.details !== 'object'
        )
          throw new Error('AUDIT_QUEUE_CORRUPT')
      } catch (error) {
        if (error.code !== 'ENOENT') corrupt = true
        continue
      }
      if (event.scope !== scope) continue
      const { scope: _scope, ...payload } = event
      const accepted = await deliver(payload)
      if (!accepted) break
      await unlink(file).catch((error) => {
        if (error.code !== 'ENOENT') throw error
      })
      delivered++
      if (delivered >= 100) break
    }
    if (corrupt) throw new Error('AUDIT_QUEUE_CORRUPT')
    return delivered
  })().finally(() => pending.delete(key))
  pending.set(key, work)
  return work
}
