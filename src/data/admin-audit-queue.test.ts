import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createProjectAuditEvents,
  enqueueAdminAudit,
  flushAdminAudit,
} from '../../server/admin-audit.mjs'
import { createProjectRepository } from '../../server/project-admin.mjs'
import { projectReferences } from '@/data/projects'
import { isProject } from '@/lib/admin'

const roots: string[] = []
const actor = { actorId: 1, scope: 'local:http://127.0.0.1:8787/' }
async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'esi-audit-queue-'))
  roots.push(root)
  return root
}
afterEach(async () => {
  for (const root of roots.splice(0)) {
    expect(path.dirname(root)).toBe(path.resolve(tmpdir()))
    expect(path.basename(root)).toMatch(/^esi-audit-queue-/)
    await rm(root, { recursive: true, force: true })
  }
})
describe('durable audit delivery', () => {
  it('retains a failed delivery and replays its stable ID only into its original profile', async () => {
    const root = await fixture()
    const [event] = createProjectAuditEvents(actor, 'save_draft', 'success', {
      projectId: 91,
      title: 'Audit test',
      password: 'must-not-be-saved',
      token: 'private-token',
    })
    await enqueueAdminAudit(root, event)
    await expect(
      flushAdminAudit(root, actor.scope, async () => {
        throw new Error('offline')
      }),
    ).rejects.toThrow('offline')
    const file = path.join(root, '.esi-admin/audit-outbox', event.eventId + '.json')
    const contents = await readFile(file, 'utf8')
    expect(contents).not.toContain('must-not-be-saved')
    expect(contents).not.toContain('private-token')
    let called = false
    expect(
      await flushAdminAudit(root, 'chaiyo:esithcom_website', async () => {
        called = true
        return true
      }),
    ).toBe(0)
    expect(called).toBe(false)
    expect(
      await flushAdminAudit(root, actor.scope, async (payload) => {
        expect(payload.eventId).toBe(event.eventId)
        expect(payload).not.toHaveProperty('scope')
        return true
      }),
    ).toBe(1)
    expect(await readdir(path.dirname(file))).toEqual([])
  })
  it('does not remove an event until the server acknowledges it', async () => {
    const root = await fixture()
    const [event] = createProjectAuditEvents(actor, 'delete', 'failure', { reason: 'CONFLICT' })
    await enqueueAdminAudit(root, event)
    expect(await flushAdminAudit(root, actor.scope, async () => false)).toBe(0)
    expect(await readdir(path.join(root, '.esi-admin/audit-outbox'))).toEqual([
      event.eventId + '.json',
    ])
  })
  it('keeps a successful file-backed project change and its audit event recoverable across restart', async () => {
    const root = await fixture()
    const options = { root, references: projectReferences, validateProject: isProject }
    const original = projectReferences[0]
    for (const image of new Set([original.image, ...(original.gallery ?? [])])) {
      const destination = path.join(root, 'public', image)
      await mkdir(path.dirname(destination), { recursive: true })
      await copyFile(path.join(import.meta.dirname, '../../public', image), destination)
    }
    const store = createProjectRepository(options)
    const saved = await store.save(
      { ...original, title: 'Audit persistence test' },
      0,
      false,
      false,
      actor,
    )
    const files = await readdir(path.join(root, '.esi-admin/audit-outbox'))
    expect(files).toHaveLength(1)
    const event = JSON.parse(
      await readFile(path.join(root, '.esi-admin/audit-outbox', files[0]), 'utf8'),
    )
    const workspace = JSON.parse(
      await readFile(path.join(root, '.esi-admin/workspace.json'), 'utf8'),
    )
    // Simulate a crash after project commit but before the journal is removed.
    await writeFile(
      path.join(root, '.esi-admin/transaction.json'),
      JSON.stringify({
        workspace,
        content: { version: 1, revision: 0, records: [], removedIds: [] },
        auditEvents: [event],
      }),
    )
    const reopened = await createProjectRepository(options).get()
    expect(reopened.revision).toBe(saved.revision)
    expect(reopened.projects.find((p) => p.id === original.id)?.title).toBe(
      'Audit persistence test',
    )
    expect(await readdir(path.join(root, '.esi-admin/audit-outbox'))).toEqual(files)
  })
  it('creates a separate upload event while dropping unapproved metadata', () => {
    const events = createProjectAuditEvents(actor, 'publish', 'success', {
      projectId: 12,
      uploadCount: 2,
      image: 'data:image/png;base64,secret',
    })
    expect(events.map((e) => e.action)).toEqual(['publish', 'upload'])
    expect(JSON.stringify(events)).not.toContain('base64')
    expect(events[0].eventId).not.toBe(events[1].eventId)
    expect(createProjectAuditEvents(undefined, 'save_draft', 'success')).toEqual([])
  })
  it('does not starve this profile when another profile has more than a batch pending', async () => {
    const root = await fixture()
    const [event] = createProjectAuditEvents(actor, 'save_draft', 'success')
    for (let i = 0; i < 101; i++) {
      const id = `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`
      await enqueueAdminAudit(root, { ...event, eventId: id, scope: 'other-profile' })
    }
    await enqueueAdminAudit(root, event)
    expect(
      await flushAdminAudit(root, actor.scope, async (payload) => {
        expect(payload.eventId).toBe(event.eventId)
        return true
      }),
    ).toBe(1)
  })
  it('preserves a corrupt file for repair but still delivers valid events', async () => {
    const root = await fixture()
    const [event, corrupt] = createProjectAuditEvents(actor, 'publish', 'success', {
      uploadCount: 1,
    })
    await enqueueAdminAudit(root, corrupt)
    const file = path.join(root, '.esi-admin/audit-outbox', corrupt.eventId + '.json')
    await writeFile(file, '{broken')
    await enqueueAdminAudit(root, event)
    let delivered = false
    await expect(
      flushAdminAudit(root, actor.scope, async () => {
        delivered = true
        return true
      }),
    ).rejects.toThrow('AUDIT_QUEUE_CORRUPT')
    expect(delivered).toBe(true)
    expect(await readFile(file, 'utf8')).toBe('{broken')
  })
})
