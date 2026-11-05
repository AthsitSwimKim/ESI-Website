import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, realpath, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { applyProjectContent } from '../shared/project-content.mjs'

export class ProjectStoreError extends Error {
  constructor(code, status = 400) {
    super(code)
    this.code = code
    this.status = status
  }
}

const projectKeys = [
  'id',
  'slug',
  'title',
  'titleTh',
  'client',
  'categories',
  'industry',
  'location',
  'locationTh',
  'image',
  'description',
  'descriptionTh',
  'scope',
  'scopeTh',
  'gallery',
  'featured',
  'year',
  'partners',
  'partnersTh',
  'imageKind',
  'source',
]

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return structuredClone(fallback)
    throw new ProjectStoreError('STORE_CORRUPT', 500)
  }
}

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true })
  const temporary = `${file}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
    await rename(temporary, file)
  } finally {
    await unlink(temporary).catch(() => {})
  }
}

/** Durable local store. The journal completes interrupted writes on the next request/restart. */
export function createProjectRepository({ root, references, validateProject }) {
  root = path.resolve(root)
  const stateDir = path.join(root, '.esi-admin')
  const workspaceFile = path.join(stateDir, 'workspace.json')
  const publishedFile = path.join(root, 'src/data/projectContent.json')
  const journalFile = path.join(stateDir, 'transaction.json')
  const emptyContent = { version: 1, revision: 0, records: [], removedIds: [] }
  const emptyWorkspace = {
    version: 1,
    revision: 0,
    nextId: Math.max(0, ...references.map((p) => p.id)) + 1,
    drafts: [],
    migrations: [],
  }
  let pending = Promise.resolve()
  const exclusive = (work) => {
    const result = pending.then(work)
    pending = result.catch(() => {})
    return result
  }

  function validList(items) {
    return (
      Array.isArray(items) &&
      items.every(validateProject) &&
      new Set(items.map((p) => p.id)).size === items.length &&
      new Set(items.map((p) => p.slug)).size === items.length
    )
  }

  function validateState(workspace, content) {
    if (
      workspace?.version !== 1 ||
      !Number.isSafeInteger(workspace.revision) ||
      workspace.revision < 0 ||
      !Number.isSafeInteger(workspace.nextId) ||
      !validList(workspace.drafts) ||
      !Array.isArray(workspace.migrations) ||
      content?.version !== 1 ||
      !Number.isSafeInteger(content.revision) ||
      content.revision < 0 ||
      !validList(content.records) ||
      !Array.isArray(content.removedIds) ||
      !content.removedIds.every((id) => Number.isSafeInteger(id) && id > 0)
    )
      throw new ProjectStoreError('STORE_CORRUPT', 500)
  }

  async function load() {
    const journal = await readJson(journalFile, null)
    if (journal) {
      validateState(journal.workspace, journal.content)
      await writeJson(workspaceFile, journal.workspace)
      await writeJson(publishedFile, journal.content)
      await unlink(journalFile)
    }
    const workspace = await readJson(workspaceFile, emptyWorkspace)
    const content = await readJson(publishedFile, emptyContent)
    validateState(workspace, content)
    const published = applyProjectContent(references, content)
    workspace.nextId = Math.max(
      workspace.nextId,
      ...published.map((p) => p.id + 1),
      ...workspace.drafts.map((p) => p.id + 1),
      ...content.removedIds.map((id) => id + 1),
    )
    return { workspace, content, published }
  }

  function snapshot({ workspace, published }) {
    const draftIds = new Set(workspace.drafts.map((p) => p.id))
    return {
      revision: workspace.revision,
      nextId: workspace.nextId,
      projects: [...workspace.drafts, ...published.filter((p) => !draftIds.has(p.id))],
      draftIds: [...draftIds],
      publishedIds: published.map((p) => p.id),
    }
  }

  function expectRevision(state, revision) {
    if (revision !== state.workspace.revision) throw new ProjectStoreError('CONFLICT', 409)
  }

  function ensurePublished(projects) {
    if (new Set(projects.map((p) => p.slug)).size !== projects.length)
      throw new ProjectStoreError('DUPLICATE_SLUG', 409)
    const featured = projects.filter((p) => p.featured).length
    if (featured < 3 || featured > 6) throw new ProjectStoreError('FEATURED_LIMIT')
  }

  async function commit(before, workspace, content) {
    await mkdir(path.join(stateDir, 'backups'), { recursive: true })
    await writeJson(path.join(stateDir, 'backups', `${Date.now()}-${randomUUID()}.json`), {
      workspace: before.workspace,
      content: before.content,
    })
    const nextWorkspace = { ...workspace, revision: before.workspace.revision + 1 }
    const contentChanged = JSON.stringify(before.content) !== JSON.stringify(content)
    if (contentChanged) {
      content = { ...content, revision: before.content.revision + 1 }
      await writeJson(journalFile, { workspace: nextWorkspace, content })
      await writeJson(publishedFile, content)
      await writeJson(workspaceFile, nextWorkspace)
      await unlink(journalFile)
    } else await writeJson(workspaceFile, nextWorkspace)
    return snapshot({
      workspace: nextWorkspace,
      published: applyProjectContent(references, content),
    })
  }

  async function storeImage(source) {
    const publicDir = path.join(root, 'public')
    if (source.startsWith('data:')) {
      const match = /^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(source)
      if (!match) throw new ProjectStoreError('INVALID_IMAGE')
      const buffer = Buffer.from(match[2], 'base64')
      const valid =
        match[1] === 'webp'
          ? buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
          : match[1] === 'png'
            ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            : buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
      if (!valid || buffer.length > 600 * 1024) throw new ProjectStoreError('INVALID_IMAGE')
      const name = `${createHash('sha256').update(buffer).digest('hex')}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`
      const directory = path.join(publicDir, 'images/uploads')
      await mkdir(directory, { recursive: true })
      await writeFile(path.join(directory, name), buffer, { flag: 'wx' }).catch((error) => {
        if (error.code !== 'EEXIST') throw error
      })
      return `/images/uploads/${name}`
    }
    const file = path.resolve(publicDir, source.slice(1))
    if (!source.startsWith('/images/') || !file.startsWith(publicDir + path.sep))
      throw new ProjectStoreError('INVALID_IMAGE')
    let resolved
    try {
      resolved = await realpath(file)
    } catch {
      throw new ProjectStoreError('IMAGE_NOT_FOUND')
    }
    if (!resolved.startsWith(publicDir + path.sep)) throw new ProjectStoreError('INVALID_IMAGE')
    return source
  }

  async function materialize(input) {
    if (!validateProject(input) || (input.gallery?.length ?? 0) > 10)
      throw new ProjectStoreError('INVALID_PROJECT')
    const project = Object.fromEntries(
      projectKeys
        .filter((key) => input[key] !== undefined)
        .map((key) => [key, structuredClone(input[key])]),
    )
    project.image = await storeImage(project.image)
    if (project.gallery)
      project.gallery = await Promise.all([...new Set(project.gallery)].map(storeImage))
    for (const key of ['scope', 'scopeTh', 'partners', 'partnersTh'])
      if (project[key]) project[key] = project[key].map((s) => s.trim()).filter(Boolean)
    return project
  }

  async function save(input, revision, publish, isNew) {
    const state = await load()
    expectRevision(state, revision)
    const project = await materialize(input)
    const current = snapshot(state).projects
    const workspace = structuredClone(state.workspace)
    const content = structuredClone(state.content)
    if (isNew) project.id = workspace.nextId++
    else if (!current.some((p) => p.id === project.id))
      throw new ProjectStoreError('NOT_FOUND', 404)
    if (current.some((p) => p.id !== project.id && p.slug === project.slug))
      throw new ProjectStoreError('DUPLICATE_SLUG', 409)
    if (publish) {
      content.records = [project, ...content.records.filter((p) => p.id !== project.id)]
      content.removedIds = content.removedIds.filter((id) => id !== project.id)
      ensurePublished(applyProjectContent(references, content))
      workspace.drafts = workspace.drafts.filter((p) => p.id !== project.id)
    } else workspace.drafts = [project, ...workspace.drafts.filter((p) => p.id !== project.id)]
    const result = await commit(state, workspace, content)
    return { ...result, project }
  }

  return {
    get: () => exclusive(async () => snapshot(await load())),
    save: (project, revision, publish = false, isNew = false) =>
      exclusive(() => save(project, revision, publish, isNew)),
    remove: (id, revision, unpublish = false) =>
      exclusive(async () => {
        const state = await load()
        expectRevision(state, revision)
        if (!snapshot(state).projects.some((p) => p.id === id))
          throw new ProjectStoreError('NOT_FOUND', 404)
        const workspace = structuredClone(state.workspace)
        const content = structuredClone(state.content)
        if (!unpublish) workspace.drafts = workspace.drafts.filter((p) => p.id !== id)
        if (state.published.some((p) => p.id === id)) {
          content.records = content.records.filter((p) => p.id !== id)
          content.removedIds = [...new Set([...content.removedIds, id])]
          ensurePublished(applyProjectContent(references, content))
          if (unpublish && !workspace.drafts.some((p) => p.id === id))
            workspace.drafts.unshift(state.published.find((p) => p.id === id))
        }
        return commit(state, workspace, content)
      }),
    migrate: (legacy, revision) =>
      exclusive(async () => {
        const state = await load()
        expectRevision(state, revision)
        if (!validList(legacy)) throw new ProjectStoreError('INVALID_PROJECT')
        const hash = createHash('sha256').update(JSON.stringify(legacy)).digest('hex')
        if (state.workspace.migrations.includes(hash)) return snapshot(state)
        const workspace = structuredClone(state.workspace)
        const existing = snapshot(state).projects
        for (const input of legacy) {
          const reference = references.find((p) => p.id === input.id)
          if (reference && JSON.stringify(reference) === JSON.stringify(input)) continue
          if (reference) {
            if (workspace.drafts.some((p) => p.id === input.id)) continue
            const published = state.published.find((p) => p.id === input.id)
            if (!published || JSON.stringify(published) !== JSON.stringify(reference)) continue
          } else if (existing.some((p) => p.slug === input.slug)) continue
          const project = await materialize(input)
          if (!reference) project.id = workspace.nextId++
          if (
            workspace.drafts.some((p) => p.id !== project.id && p.slug === project.slug) ||
            state.published.some((p) => p.id !== project.id && p.slug === project.slug)
          )
            continue
          workspace.drafts.unshift(project)
        }
        workspace.migrations.push(hash)
        return commit(state, workspace, state.content)
      }),
  }
}

const isLoopback = (address) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address)

export function projectAdminPlugin() {
  return {
    name: 'esi-local-project-admin',
    apply: 'serve',
    config(config) {
      const root = path.resolve(config.root ?? process.cwd()).replaceAll('\\', '/')
      return {
        server: {
          watch: {
            ignored: [
              `${root}/.esi-admin/**`,
              `${root}/public/images/uploads/**`,
              `${root}/src/data/projectContent.json`,
            ],
          },
        },
      }
    },
    configureServer(server) {
      const trafficFile = path.join(server.config.root, '.esi-admin', 'traffic.json')
      let trafficWrites = Promise.resolve()
      const readTraffic = async () => {
        const count = await readJson(trafficFile, 0)
        if (!Number.isSafeInteger(count) || count < 0)
          throw new ProjectStoreError('STORE_CORRUPT', 500)
        return count
      }
      const refreshPublished = () => {
        server.moduleGraph.invalidateAll()
        server.ws.send({ type: 'custom', event: 'esi:projects-published' })
      }
      server.middlewares.use('/images/uploads', async (request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
        const match = /^\/([a-f0-9]{64})\.(webp|png|jpg)$/.exec(pathname)
        if (!match || !['GET', 'HEAD'].includes(request.method)) return next()
        try {
          const image = await readFile(
            path.join(server.config.root, 'public/images/uploads', pathname.slice(1)),
          )
          response.setHeader(
            'Content-Type',
            match[2] === 'jpg' ? 'image/jpeg' : `image/${match[2]}`,
          )
          response.setHeader('X-Content-Type-Options', 'nosniff')
          response.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
          response.end(request.method === 'HEAD' ? undefined : image)
        } catch {
          response.statusCode = 404
          response.end()
        }
      })
      let repository
      const getRepository = async () => {
        if (!repository)
          repository = Promise.all([
            server.ssrLoadModule('/src/data/projects.ts'),
            server.ssrLoadModule('/src/lib/admin.ts'),
          ]).then(([data, validation]) =>
            createProjectRepository({
              root: server.config.root,
              references: data.projectReferences,
              validateProject: validation.isProject,
            }),
          )
        return repository
      }
      server.middlewares.use('/api/admin', async (request, response) => {
        const send = (status, body) => {
          response.statusCode = status
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Cache-Control', 'no-store')
          response.end(JSON.stringify(body))
        }
        try {
          const host = new URL(`http://${request.headers.host ?? ''}`)
          if (
            !isLoopback(request.socket.remoteAddress) ||
            !['localhost', '127.0.0.1', '[::1]'].includes(host.hostname)
          )
            throw new ProjectStoreError('LOCAL_ONLY', 403)
          if (request.headers.origin && new URL(request.headers.origin).host !== host.host)
            throw new ProjectStoreError('FORBIDDEN', 403)
          const pathname = new URL(request.url ?? '/', host).pathname
          if (request.method === 'GET' && pathname === '/traffic') {
            await trafficWrites
            return send(200, { views: await readTraffic() })
          }
          if (request.method === 'GET' && pathname === '/projects')
            return send(200, await (await getRepository()).get())
          if (request.method !== 'POST') throw new ProjectStoreError('NOT_FOUND', 404)
          if (
            request.headers['x-esi-admin'] !== '1' ||
            !request.headers['content-type']?.startsWith('application/json')
          )
            throw new ProjectStoreError('FORBIDDEN', 403)
          if (pathname === '/traffic') {
            const write = trafficWrites.then(async () => {
              const views = (await readTraffic()) + 1
              await writeJson(trafficFile, views)
            })
            trafficWrites = write.catch(() => {})
            await write
            response.statusCode = 204
            return response.end()
          }
          const store = await getRepository()
          let length = 0
          const chunks = []
          for await (const chunk of request) {
            length += chunk.length
            if (length > 16 * 1024 * 1024) throw new ProjectStoreError('TOO_LARGE', 413)
            chunks.push(chunk)
          }
          let body
          try {
            body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          } catch {
            throw new ProjectStoreError('INVALID_PROJECT')
          }
          if (pathname === '/projects/save' || pathname === '/projects/publish') {
            const result = await store.save(
              body.project,
              body.revision,
              pathname.endsWith('/publish'),
              body.isNew === true,
            )
            if (pathname.endsWith('/publish')) refreshPublished()
            return send(200, result)
          }
          if (pathname === '/projects/remove' || pathname === '/projects/unpublish') {
            const result = await store.remove(
              body.id,
              body.revision,
              pathname.endsWith('/unpublish'),
            )
            refreshPublished()
            return send(200, result)
          }
          if (pathname === '/projects/migrate')
            return send(200, await store.migrate(body.projects, body.revision))
          throw new ProjectStoreError('NOT_FOUND', 404)
        } catch (error) {
          if (!(error instanceof ProjectStoreError))
            server.config.logger.error(`Project admin: ${error.message}`)
          send(error instanceof ProjectStoreError ? error.status : 500, {
            error: error instanceof ProjectStoreError ? error.code : 'SAVE_FAILED',
          })
        }
      })
    },
  }
}
