import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { createProjectRepository } from '../../server/project-admin.mjs'
import { applyProjectContent } from '../../shared/project-content.mjs'
import { createTestProject } from '@/test/fixtures/admin-project'
import { projectReferences } from '@/data/projects'
import { isProject } from '@/lib/admin'

const directories: string[] = []
const sourceRoot = path.resolve(import.meta.dirname, '../..')
const read = async (root: string, file: string) =>
  JSON.parse(await readFile(path.join(root, file), 'utf8'))

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'esi-project-store-'))
  directories.push(root)
  await mkdir(path.join(root, 'public/images/projects'), { recursive: true })
  for (const name of [
    'map-ta-phut-tank-terminal-cctv.webp',
    'long-son-petrochemical-network.webp',
  ]) {
    await copyFile(
      path.join(sourceRoot, 'public/images/projects', name),
      path.join(root, 'public/images/projects', name),
    )
  }
  const options = { root, references: projectReferences, validateProject: isProject }
  return {
    root,
    store: createProjectRepository(options),
    reopen: () => createProjectRepository(options),
    project: createTestProject(projectReferences),
  }
}

afterEach(async () => {
  for (const directory of directories.splice(0)) {
    expect(path.dirname(path.resolve(directory))).toBe(path.resolve(tmpdir()))
    expect(path.basename(directory)).toMatch(/^esi-project-store-/)
    await rm(directory, { recursive: true, force: true })
  }
})

describe('persistent project management', () => {
  it('saves drafts on disk across repository restarts without publishing them', async () => {
    const { root, store, reopen, project } = await fixture()
    const result = await store.save(project, 0, false, true)
    expect(result.draftIds).toContain(result.project.id)
    expect(result.publishedIds).not.toContain(result.project.id)
    expect((await reopen().get()).projects).toEqual(result.projects)
    expect((await read(root, '.esi-admin/workspace.json')).drafts[0].title).toBe(project.title)
    await expect(access(path.join(root, 'src/data/projectContent.json'))).rejects.toThrow()
  })

  it('publishes into the shared site data, unpublishes back to a draft and deletes durably', async () => {
    const { root, store, reopen, project } = await fixture()
    const saved = await store.save(project, 0, false, true)
    const published = await store.save(saved.project, saved.revision, true)
    expect(published.draftIds).not.toContain(saved.project.id)
    const content = await read(root, 'src/data/projectContent.json')
    expect(applyProjectContent(projectReferences, content).map((item) => item.slug)).toContain(
      project.slug,
    )
    const hidden = await reopen().remove(saved.project.id, published.revision, true)
    expect(hidden.draftIds).toContain(saved.project.id)
    expect(hidden.publishedIds).not.toContain(saved.project.id)
    const restored = await store.save(
      hidden.projects.find((item) => item.id === saved.project.id)!,
      hidden.revision,
      true,
    )
    const removed = await store.remove(saved.project.id, restored.revision)
    expect((await reopen().get()).projects.some((item) => item.id === saved.project.id)).toBe(false)
    expect(removed.projects).toHaveLength(projectReferences.length)
  })

  it('keeps the published version unchanged while an edit is still a draft', async () => {
    const { root, store } = await fixture()
    const original = projectReferences[0]
    const changed = { ...original, title: 'Edited title in draft' }
    const saved = await store.save(changed, 0)
    expect(saved.projects.find((item) => item.id === original.id)?.title).toBe(changed.title)
    const published = await store.save(changed, saved.revision, true)
    expect(published.publishedIds).toContain(original.id)
    const content = await read(root, 'src/data/projectContent.json')
    expect(
      applyProjectContent(projectReferences, content).find((item) => item.id === original.id)
        ?.title,
    ).toBe(changed.title)
    expect(content.records[0].source).toBe(original.source)
  })

  it('writes uploaded cover and gallery images as real files and preserves their bytes', async () => {
    const { root, store, project } = await fixture()
    const bytes = await readFile(
      path.join(root, 'public/images/projects/long-son-petrochemical-network.webp'),
    )
    const image = `data:image/webp;base64,${bytes.toString('base64')}`
    const result = await store.save(
      { ...project, image, gallery: [image, project.image] },
      0,
      true,
      true,
    )
    expect(result.project.image).toMatch(/^\/images\/uploads\/[a-f0-9]{64}\.webp$/)
    expect(await readFile(path.join(root, 'public', result.project.image.slice(1)))).toEqual(bytes)
    expect(result.project.gallery?.[0]).toBe(result.project.image)
    expect(JSON.stringify(await read(root, 'src/data/projectContent.json'))).not.toContain(
      'data:image',
    )
  })

  it('rejects stale concurrent writes without losing the first saved project', async () => {
    const { store, project } = await fixture()
    const outcomes = await Promise.allSettled([
      store.save(project, 0, false, true),
      store.save({ ...project, slug: 'another-project' }, 0, false, true),
    ])
    expect(outcomes.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    const rejected = outcomes.find(
      (result) => result.status === 'rejected',
    ) as PromiseRejectedResult
    expect(rejected.reason.code).toBe('CONFLICT')
    expect((await store.get()).projects).toHaveLength(projectReferences.length + 1)
  })

  it('rejects duplicate slugs, missing files and disguised uploads without reporting success', async () => {
    const { store, project } = await fixture()
    await expect(
      store.save({ ...project, slug: projectReferences[0].slug }, 0, false, true),
    ).rejects.toMatchObject({ code: 'DUPLICATE_SLUG' })
    await expect(
      store.save({ ...project, image: '/images/projects/missing.webp' }, 0, false, true),
    ).rejects.toMatchObject({ code: 'IMAGE_NOT_FOUND' })
    await expect(
      store.save({ ...project, image: 'data:image/webp;base64,PHNjcmlwdD4=' }, 0, false, true),
    ).rejects.toMatchObject({ code: 'INVALID_IMAGE' })
    await expect(
      store.save({ ...project, image: '/images/../outside.webp' }, 0, false, true),
    ).rejects.toMatchObject({ code: 'INVALID_PROJECT' })
    expect((await store.get()).revision).toBe(0)
  })

  it('recovers an interrupted transaction and refuses to overwrite corrupt stored data', async () => {
    const { root, reopen, project } = await fixture()
    await mkdir(path.join(root, '.esi-admin'), { recursive: true })
    const workspace = {
      version: 1,
      revision: 1,
      nextId: project.id + 1,
      drafts: [project],
      migrations: [],
    }
    const content = { version: 1, revision: 0, records: [], removedIds: [] }
    await writeFile(
      path.join(root, '.esi-admin/transaction.json'),
      JSON.stringify({ workspace, content }),
    )
    expect((await reopen().get()).draftIds).toContain(project.id)
    await expect(access(path.join(root, '.esi-admin/transaction.json'))).rejects.toThrow()
    await writeFile(path.join(root, '.esi-admin/workspace.json'), '{broken')
    await expect(reopen().get()).rejects.toMatchObject({ code: 'STORE_CORRUPT' })
    expect(await readFile(path.join(root, '.esi-admin/workspace.json'), 'utf8')).toBe('{broken')
  })

  it('migrates changed legacy browser drafts once, preserving existing server edits', async () => {
    const { store, project } = await fixture()
    const legacy = [
      { ...projectReferences[0], title: 'Legacy edit' },
      ...projectReferences.slice(1),
      project,
    ]
    const migrated = await store.migrate(legacy, 0)
    expect(migrated.draftIds).toContain(projectReferences[0].id)
    expect(migrated.projects.find((item) => item.id === projectReferences[0].id)?.title).toBe(
      'Legacy edit',
    )
    expect(migrated.projects).toHaveLength(projectReferences.length + 1)
    const again = await store.migrate(legacy, migrated.revision)
    expect(again.revision).toBe(migrated.revision)
    expect(again.projects).toEqual(migrated.projects)
  })
})
