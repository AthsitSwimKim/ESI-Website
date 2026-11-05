import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Download,
  Eye,
  FilePenLine,
  FolderOpen,
  Image,
  Plus,
  Send,
  Save,
  Search,
  Trash2,
} from 'lucide-react'
import {
  Link,
  useBlocker,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import logo from '@/assets/logo/esi-logo.png'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { AdminImageUpload } from '@/components/ui/AdminImageUpload'
import { AdminGalleryUpload } from '@/components/ui/AdminGalleryUpload'
import { AdminSaveDialog } from '@/components/ui/AdminSaveDialog'
import { LangSwitch } from '@/components/ui/LangSwitch'
import { ProjectPagination } from '@/components/ui/Pagination'
import { Reveal } from '@/components/ui/Reveal'
import { Seo } from '@/components/ui/Seo'
import {
  adminListFields,
  adminLongFields,
  adminTextFields,
  createProjectDraft,
  createExampleProject,
} from '@/data/admin'
import { industries } from '@/data/industries'
import { useT } from '@/i18n'
import { downloadProjectDrafts, hasDuplicateSlug, isProject } from '@/lib/admin'
import { clampPage } from '@/lib/pagination'
import {
  projectApi,
  projectApiMessage,
  ProjectApiError,
  type ProjectWorkspace,
} from '@/lib/projectApi'
import { cn } from '@/lib/utils'
import { PROJECT_CATEGORIES, type Project } from '@/types'

const fieldClass =
  'mt-2 w-full min-w-0 rounded-sm border border-esi-border bg-white px-3 py-2.5 text-sm text-esi-text transition-colors focus:border-esi-blue'
const buttonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-esi-border bg-white px-4 py-2 text-sm font-semibold text-esi-blue transition-colors hover:bg-esi-light disabled:cursor-not-allowed disabled:opacity-50'
const projectsPerPage = 12

export function AdminPage() {
  const { t, l, lang } = useT()
  const navigate = useNavigate()
  const { pathname, state, key: locationKey } = useLocation()
  const navigationType = useNavigationType()
  const { projectId } = useParams()
  const [params, setParams] = useSearchParams()
  const editing = projectId !== undefined
  const sample = projectId === 'new' && params.has('sample')
  const loadKey = sample ? `${pathname}?sample` : pathname
  const searchParam = params.get('q') ?? ''
  const [search, setSearch] = useState(searchParam)
  const [previousLocationKey, setPreviousLocationKey] = useState(locationKey)
  if (previousLocationKey !== locationKey) {
    setPreviousLocationKey(locationKey)
    if (navigationType === 'POP') setSearch(searchParam)
  }
  const listParams = new URLSearchParams(params)
  listParams.delete('sample')
  if (search) listParams.set('q', search)
  else listParams.delete('q')
  const listSearch = listParams.toString()
  const listLocation = { pathname: '/admin', search: listSearch }
  const [workspace, setWorkspace] = useState<ProjectWorkspace>({
    revision: 0,
    nextId: 1,
    projects: [],
    draftIds: [],
    publishedIds: [],
  })
  const [loadedKey, setLoadedKey] = useState<string>()
  const savedRoute = useRef<string | null>(null)
  const allowNavigation = useRef(false)
  const [saving, setSaving] = useState(false)
  const [websiteViews, setWebsiteViews] = useState<number | null | undefined>(undefined)
  const items = workspace.projects
  const [selected, setSelected] = useState<Project>(() => createProjectDraft([]))
  const [baseline, setBaseline] = useState(() => JSON.stringify(selected))
  const catalogTitle = useRef<HTMLHeadingElement>(null)
  const [message, setMessage] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const saveTrigger = useRef<HTMLElement | null>(null)
  const primarySave = useRef<HTMLButtonElement>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const uploading = imageUploading || galleryUploading
  const isNew = projectId === 'new'
  const loaded = loadedKey === loadKey || (isNew && loadedKey === `/admin/projects/${selected.id}`)
  const busy = uploading || saving || !loaded
  const dirty = JSON.stringify(selected) !== baseline
  const missing =
    loaded && editing && !isNew && !items.some((item) => String(item.id) === projectId)
  const filtered = items.filter((item) =>
    [item.title, item.titleTh, item.client].some((text) =>
      text?.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    ),
  )
  const totalPages = Math.ceil(filtered.length / projectsPerPage)
  const page = clampPage(params.get('page'), totalPages)
  const firstProject = (page - 1) * projectsPerPage
  const visibleProjects = filtered.slice(firstProject, firstProject + projectsPerPage)

  function focusHeading(heading: HTMLHeadingElement | null) {
    heading?.focus({ preventScroll: true })
    heading?.scrollIntoView({ block: 'start' })
  }

  useEffect(() => {
    if (savedRoute.current === loadKey) {
      savedRoute.current = null
      return
    }
    let active = true
    projectApi
      .load()
      .then((data) => {
        if (!active) return
        const item = structuredClone(
          sample
            ? createExampleProject(data.projects)
            : (data.projects.find((p) => String(p.id) === projectId) ??
                createProjectDraft(data.projects)),
        )
        setWorkspace(data)
        setSelected(item)
        setBaseline(JSON.stringify(item))
        setLoadedKey(loadKey)
        setMessage('')
      })
      .catch((error) => {
        if (active) setMessage(projectApiMessage(error))
      })
    return () => {
      active = false
    }
  }, [loadKey, projectId, sample])

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    if (!import.meta.env.DEV || editing) return
    const controller = new AbortController()
    const refresh = async () => {
      try {
        const response = await fetch('/api/admin/traffic', { signal: controller.signal })
        if (!response.ok) throw new Error('Traffic count unavailable')
        const { views } = await response.json()
        if (!Number.isSafeInteger(views) || views < 0) throw new Error('Invalid traffic count')
        if (!controller.signal.aborted) setWebsiteViews(views)
      } catch {
        if (!controller.signal.aborted) setWebsiteViews(null)
      }
    }
    void refresh()
    window.addEventListener('focus', refresh)
    return () => {
      controller.abort()
      window.removeEventListener('focus', refresh)
    }
  }, [editing])

  useEffect(() => {
    if (!editing || (!dirty && !uploading && !saving)) return
    const handleUnload = (event: BeforeUnloadEvent) => {
      if (allowNavigation.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [editing, dirty, uploading, saving])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      editing &&
      !allowNavigation.current &&
      (dirty || uploading || saving) &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search),
  )
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (!uploading && !saving && window.confirm(t('admin.discard'))) blocker.proceed()
    else blocker.reset()
  }, [blocker, saving, t, uploading])

  function update<K extends keyof Project>(key: K, value: Project[K]) {
    setSelected((current) => ({ ...current, [key]: value }))
    setMessage('')
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    if (!isProject(selected)) {
      setMessage('invalid')
      return
    }
    if (hasDuplicateSlug(selected, items)) {
      setMessage('duplicate')
      return
    }
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const intent = submitter?.getAttribute('value')
    setSaving(true)
    setMessage('')
    try {
      const result = await projectApi.save(
        selected,
        workspace.revision,
        isNew,
        intent === 'publish',
      )
      setWorkspace(result)
      setSelected(result.project)
      setBaseline(JSON.stringify(result.project))
      setMessage('saved')
      if (intent === 'publish') {
        allowNavigation.current = true
        const publicPath = `/projects/${result.project.slug}`
        if (isNew) window.location.replace(publicPath)
        else window.location.assign(publicPath)
      } else if (intent === 'preview') {
        allowNavigation.current = true
        void navigate(
          { pathname: `/admin/preview/${result.project.id}`, search: listSearch },
          { replace: isNew },
        )
        allowNavigation.current = false
      } else {
        saveTrigger.current = submitter
        setSaveOpen(true)
        if (isNew) {
          const editPath = `/admin/projects/${result.project.id}`
          savedRoute.current = editPath
          setLoadedKey(editPath)
          allowNavigation.current = true
          void navigate({ pathname: editPath, search: listSearch }, { replace: true })
          allowNavigation.current = false
        }
      }
    } catch (error) {
      setMessage(projectApiMessage(error))
      if (error instanceof ProjectApiError && error.code === 'CONFLICT') {
        try {
          setWorkspace(await projectApi.get())
        } catch {
          /* keep open edits */
        }
      }
    } finally {
      setSaving(false)
    }
  }

  async function remove(unpublish = false) {
    if (busy) return
    setSaving(true)
    try {
      const result = await projectApi.remove(selected.id, workspace.revision, unpublish)
      setWorkspace(result)
      setDeleteOpen(false)
      if (unpublish) {
        const draft = result.projects.find((project) => project.id === selected.id)!
        setSelected(draft)
        setBaseline(JSON.stringify(draft))
        setMessage('unpublished')
      } else {
        allowNavigation.current = true
        void navigate(listLocation, { replace: true, state: { projectDeleted: true } })
        allowNavigation.current = false
      }
    } catch (error) {
      setMessage(projectApiMessage(error))
      if (error instanceof ProjectApiError && error.code === 'CONFLICT') {
        try {
          setWorkspace(await projectApi.get())
        } catch {
          /* keep open edits */
        }
      }
    } finally {
      setSaving(false)
    }
  }

  const title = lang === 'th' ? selected.titleTh || selected.title : selected.title
  const description =
    lang === 'th' ? selected.descriptionTh || selected.description : selected.description

  if (!loaded || missing)
    return (
      <div className="min-h-screen bg-esi-light p-6 md:p-12">
        <Seo
          title={`${t('admin.title')} | ESI`}
          path={pathname}
          description={t('admin.pageDescription')}
        />
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <main className="mx-auto max-w-2xl border border-esi-border bg-white p-6">
          <h1 className="display-title text-2xl text-esi-blue">{t('admin.title')}</h1>
          <p className="mt-4 text-sm text-esi-muted" role="status">
            {missing
              ? t('admin.projectMissing')
              : message
                ? t(`admin.${message}` as 'admin.backendUnavailable')
                : t('a11y.loading')}
          </p>
          {missing ? (
            <Link to={listLocation} className={cn(buttonClass, 'mt-5')}>
              {t('admin.backToProjectList')}
            </Link>
          ) : (
            message && (
              <button
                type="button"
                className={cn(buttonClass, 'mt-5')}
                onClick={() => window.location.reload()}
              >
                {t('admin.retry')}
              </button>
            )
          )}
        </main>
      </div>
    )

  return (
    <div className="min-h-screen bg-esi-light">
      <Seo
        title={`${t('admin.title')} | ESI`}
        description={t('admin.pageDescription')}
        path={pathname}
      />
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:block focus:bg-white focus:p-3"
      >
        {t('a11y.skipToContent')}
      </a>
      <header className="border-b border-esi-border bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <div className="flex items-center gap-5">
            <img src={logo} alt="ESI" width="140" height="48" className="h-auto w-24 sm:w-32" />
            <span className="hidden border-l border-esi-border pl-5 text-sm font-medium text-esi-muted sm:block">
              {t('admin.workspace')}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <LangSwitch />
            <Link
              to={editing ? listLocation : '/projects'}
              className="inline-flex items-center gap-2 text-sm font-semibold text-esi-blue"
            >
              <ArrowLeft size={16} aria-hidden />
              {t(editing ? 'admin.backToProjectList' : 'admin.back')}
            </Link>
          </div>
        </div>
      </header>

      <main id="admin-main" className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8 lg:py-10">
        {!editing ? (
          <>
            <Reveal>
              <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <h1 className="display-title text-3xl text-esi-blue">{t('admin.title')}</h1>
                  <div className="mt-3 h-[3px] w-10 bg-esi-blue" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    className={buttonClass}
                    to={{
                      pathname: '/admin/projects/new',
                      search: new URLSearchParams([...listParams, ['sample', '1']]).toString(),
                    }}
                  >
                    {t('admin.loadExample')}
                  </Link>
                  <button
                    type="button"
                    className={buttonClass}
                    title={t('admin.exportNote')}
                    disabled={dirty || busy}
                    onClick={() => downloadProjectDrafts(items)}
                  >
                    <Download size={17} aria-hidden />
                    {t('admin.export')}
                  </button>
                  <Link
                    className={cn(
                      buttonClass,
                      'border-esi-blue! bg-esi-blue! text-white! hover:bg-esi-secondary!',
                    )}
                    to={{ pathname: '/admin/projects/new', search: listSearch }}
                  >
                    <Plus size={18} aria-hidden />
                    {t('admin.new')}
                  </Link>
                </div>
              </div>
              <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4 rounded-sm border border-esi-border bg-white px-5 py-4">
                  <Eye size={23} className="shrink-0 text-esi-blue" aria-hidden />
                  <div>
                    <p className="text-xs text-esi-muted">{t('admin.websiteViews')}</p>
                    <p className="text-2xl font-semibold text-esi-navy tabular-nums">
                      {typeof websiteViews === 'number' ? websiteViews.toLocaleString(lang) : '—'}
                    </p>
                    <p className="text-xs text-esi-muted">
                      {t(websiteViews === null ? 'admin.viewsUnavailable' : 'admin.viewsHelp')}
                    </p>
                  </div>
                </div>
                {[
                  { label: 'total', count: items.length, icon: FolderOpen },
                  {
                    label: 'featuredCount',
                    count: items.filter((item) => item.featured).length,
                    icon: FilePenLine,
                  },
                  {
                    label: 'imageCount',
                    count: new Set(items.map((item) => item.image)).size,
                    icon: Image,
                  },
                ].map(({ label, count, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 rounded-sm border border-esi-border bg-white px-5 py-4"
                  >
                    <Icon size={23} className="text-esi-blue" aria-hidden />
                    <div>
                      <p className="text-xs text-esi-muted">
                        {t(`admin.${label}` as 'admin.total')}
                      </p>
                      <p className="text-2xl font-semibold text-esi-navy tabular-nums">{count}</p>
                    </div>
                  </div>
                ))}
              </div>
              <aside className="mb-7 border-l-[3px] border-esi-blue bg-white px-5 py-4 text-sm text-esi-muted">
                <p>
                  <span className="font-semibold text-esi-blue">{t('admin.workspace')}</span> ·{' '}
                  {t('admin.notice')}
                </p>
                <p className="mt-1 text-xs">{t('admin.access')}</p>
              </aside>
            </Reveal>

            {state?.projectDeleted === true && (
              <p
                role="status"
                className="mb-6 border border-esi-border bg-white p-4 text-sm text-esi-blue"
              >
                {t('admin.deleted')}
              </p>
            )}
            <section className="min-w-0" aria-labelledby="admin-projects">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h2
                  id="admin-projects"
                  ref={catalogTitle}
                  tabIndex={-1}
                  className="scroll-mt-6 display-title text-xl text-esi-blue"
                >
                  {t('admin.projects')}{' '}
                  <span className="ml-1 text-sm text-esi-muted">({filtered.length})</span>
                  <span aria-hidden className="mt-2 block h-[3px] w-10 bg-esi-blue" />
                </h2>
                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={16}
                    className="pointer-events-none absolute top-3.5 left-3 text-esi-muted"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      const value = event.target.value
                      setSearch(value)
                      const next = new URLSearchParams(listParams)
                      if (value) next.set('q', value)
                      else next.delete('q')
                      next.delete('page')
                      setParams(next, { replace: true })
                    }}
                    aria-label={t('admin.search')}
                    placeholder={t('admin.search')}
                    className={cn(fieldClass, 'mt-0! pl-9!')}
                  />
                </div>
              </div>
              {visibleProjects.length > 0 ? (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleProjects.map((item) => (
                    <li key={item.id}>
                      <ProjectCard
                        project={item}
                        variant="vertical"
                        to={{ pathname: `/admin/projects/${item.id}`, search: listSearch }}
                        editor={{
                          label: t('admin.edit'),
                          status: t(
                            workspace.draftIds.includes(item.id)
                              ? 'admin.draftStatus'
                              : 'admin.publishedStatus',
                          ),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-sm border border-esi-border bg-white p-5 text-sm text-esi-muted">
                  {t('admin.empty')}
                </p>
              )}
              <ProjectPagination
                page={page}
                total={filtered.length}
                perPage={projectsPerPage}
                onChange={(nextPage) => {
                  const next = new URLSearchParams(listParams)
                  if (nextPage === 1) next.delete('page')
                  else next.set('page', String(nextPage))
                  setParams(next)
                  focusHeading(catalogTitle.current)
                }}
              />
            </section>
          </>
        ) : (
          <div className="mx-auto max-w-[1200px] min-w-0">
            <form
              onSubmit={save}
              aria-labelledby="admin-editor-title"
              className="rounded-sm border border-esi-border bg-white"
            >
              <fieldset disabled={busy} className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-esi-border px-5 py-5 sm:px-7">
                  <div>
                    <h1 id="admin-editor-title" className="display-title text-2xl text-esi-blue">
                      {t(isNew ? 'admin.newTitle' : 'admin.edit')}
                    </h1>
                    <span aria-hidden className="mt-2 block h-[3px] w-10 bg-esi-blue" />
                    {title && <p className="mt-3 font-semibold text-esi-navy">{title}</p>}
                    <p className="mt-1 text-xs text-esi-muted">
                      {t(dirty ? 'admin.unsaved' : 'admin.unchanged')}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-esi-blue">
                      {t(
                        isNew
                          ? 'admin.newTitle'
                          : workspace.draftIds.includes(selected.id)
                            ? 'admin.draftStatus'
                            : 'admin.publishedStatus',
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      name="intent"
                      value="preview"
                      disabled={busy}
                      className={buttonClass}
                    >
                      <Eye size={17} aria-hidden />
                      {t('admin.previewPage')}
                    </button>
                    <button
                      type="submit"
                      ref={primarySave}
                      disabled={busy}
                      className={cn(
                        buttonClass,
                        'border-esi-blue! bg-esi-blue! text-white! hover:bg-esi-secondary!',
                      )}
                    >
                      <Save size={17} aria-hidden />
                      {t('admin.save')}
                    </button>
                    <button
                      type="submit"
                      name="intent"
                      value="publish"
                      disabled={busy}
                      className={cn(
                        buttonClass,
                        'border-esi-navy! bg-esi-navy! text-white! hover:bg-esi-blue!',
                      )}
                    >
                      <Send size={17} aria-hidden />
                      {t('admin.publish')}
                    </button>
                    {workspace.publishedIds.includes(selected.id) && (
                      <button
                        type="button"
                        disabled={busy}
                        className={buttonClass}
                        onClick={() => remove(true)}
                      >
                        {t('admin.unpublish')}
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-7 p-5 sm:p-7">
                  <div role="status" aria-live="polite">
                    {message && (
                      <p className="border border-esi-border bg-esi-light p-3 text-sm text-esi-blue">
                        {t(`admin.${message}` as 'admin.saved')}
                        {message === 'saved' && (
                          <Link
                            to={`/admin/preview/${selected.id}`}
                            className="ml-2 inline-block font-semibold underline underline-offset-4"
                          >
                            {t('admin.previewDraft')}
                          </Link>
                        )}
                      </p>
                    )}
                  </div>
                  <fieldset>
                    <legend className="mb-4 font-semibold text-esi-navy">
                      {t('admin.details')}
                    </legend>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {adminTextFields.map((field) => (
                        <label
                          key={field.key}
                          className="min-w-0 text-sm font-medium text-esi-navy"
                        >
                          {t(`admin.${field.label}`)}
                          {'required' in field && ' *'}
                          <input
                            required={'required' in field}
                            value={selected[field.key] ?? ''}
                            onChange={(event) => update(field.key, event.target.value)}
                            pattern={field.key === 'slug' ? '[a-z0-9]+(-[a-z0-9]+)*' : undefined}
                            aria-describedby={field.key === 'slug' ? 'slug-help' : undefined}
                            className={fieldClass}
                          />
                          {field.key === 'slug' && (
                            <span
                              id="slug-help"
                              className="mt-2 block text-xs leading-relaxed font-normal text-esi-muted"
                            >
                              {t('admin.slugHelp')}
                            </span>
                          )}
                        </label>
                      ))}
                      <label className="text-sm font-medium text-esi-navy">
                        {t('admin.industry')}
                        <select
                          value={selected.industry}
                          onChange={(event) =>
                            update('industry', event.target.value as Project['industry'])
                          }
                          className={fieldClass}
                        >
                          {industries.map((industry) => (
                            <option key={industry.slug} value={industry.slug}>
                              {l(industry.name)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm font-medium text-esi-navy">
                        {t('admin.year')}
                        <input
                          type="number"
                          min="1900"
                          max="2100"
                          value={selected.year ?? ''}
                          onChange={(event) =>
                            update(
                              'year',
                              event.target.value ? Number(event.target.value) : undefined,
                            )
                          }
                          className={fieldClass}
                        />
                      </label>
                      {adminLongFields.map((field) => (
                        <label key={field.key} className="text-sm font-medium text-esi-navy">
                          {t(`admin.${field.label}`)}
                          {'required' in field && ' *'}
                          <textarea
                            required={'required' in field}
                            rows={4}
                            value={selected[field.key] ?? ''}
                            onChange={(event) => update(field.key, event.target.value)}
                            className={fieldClass}
                          />
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="border-t border-esi-border pt-5">
                    <legend className="px-0 font-semibold text-esi-navy">
                      {t('admin.categories')} *
                    </legend>
                    <div className="flex flex-wrap gap-3">
                      {PROJECT_CATEGORIES.map((category) => (
                        <label
                          key={category}
                          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border border-esi-border px-3 py-2 text-sm text-esi-navy"
                        >
                          <input
                            type="checkbox"
                            checked={selected.categories.includes(category)}
                            onChange={(event) =>
                              update(
                                'categories',
                                event.target.checked
                                  ? [...selected.categories, category]
                                  : selected.categories.filter((value) => value !== category),
                              )
                            }
                            className="size-4 accent-esi-blue"
                          />
                          {t(`categories.${category}`)}
                        </label>
                      ))}
                    </div>
                    <label className="mt-4 flex items-center gap-2 text-sm text-esi-navy">
                      <input
                        type="checkbox"
                        checked={selected.featured ?? false}
                        onChange={(event) => update('featured', event.target.checked)}
                        className="size-4 accent-esi-blue"
                      />
                      {t('admin.featured')}
                    </label>
                  </fieldset>

                  <div className="grid gap-5 border-t border-esi-border pt-5 sm:grid-cols-2">
                    <AdminImageUpload
                      key={selected.id}
                      image={selected.image}
                      onBusyChange={setImageUploading}
                      disabled={uploading}
                      onChange={(image) => {
                        setSelected((current) => ({ ...current, image, imageKind: 'photo' }))
                        setMessage('')
                      }}
                    />
                    <label className="text-sm font-medium text-esi-navy">
                      {t('admin.imageKind')}
                      <select
                        value={selected.imageKind ?? 'photo'}
                        onChange={(event) =>
                          update('imageKind', event.target.value as Project['imageKind'])
                        }
                        className={fieldClass}
                      >
                        <option value="photo">{t('admin.photo')}</option>
                        <option value="illustration">{t('admin.illustration')}</option>
                      </select>
                    </label>
                  </div>

                  <section
                    aria-labelledby="admin-preview-title"
                    className="border border-esi-border bg-esi-light p-4 sm:p-5"
                  >
                    <h3
                      id="admin-preview-title"
                      className="mb-4 text-sm font-semibold text-esi-blue"
                    >
                      {t('admin.preview')}
                    </h3>
                    {title && selected.image && description ? (
                      <article className="max-w-lg overflow-hidden rounded-sm border border-esi-border bg-white">
                        <div className="relative">
                          <img
                            src={selected.image}
                            alt={title}
                            width="600"
                            height="400"
                            className="aspect-[3/2] w-full object-cover"
                          />
                          {selected.imageKind === 'illustration' && (
                            <span className="absolute bottom-3 left-3 rounded-sm bg-esi-navy px-2 py-1 text-xs font-semibold text-white">
                              {t('projects.illustrativeImage')}
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="mb-3 flex flex-wrap gap-2">
                            {selected.categories.map((category) => (
                              <span
                                key={category}
                                className="rounded-sm bg-esi-light px-2 py-1 text-xs font-semibold text-esi-blue"
                              >
                                {t(`categories.${category}`)}
                              </span>
                            ))}
                          </div>
                          <h4 className="text-lg leading-relaxed font-semibold text-esi-blue">
                            {title}
                          </h4>
                          <p className="mt-2 text-sm text-esi-muted">{selected.client}</p>
                          <p className="mt-3 text-sm leading-relaxed text-esi-muted">
                            {description}
                          </p>
                        </div>
                      </article>
                    ) : (
                      <p className="text-sm text-esi-muted">{t('admin.noPreview')}</p>
                    )}
                  </section>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {adminListFields.map((field) => (
                      <label key={field.key} className="text-sm font-medium text-esi-navy">
                        {t(`admin.${field.label}`)}
                        <textarea
                          rows={4}
                          value={(selected[field.key] ?? []).join('\n')}
                          onChange={(event) =>
                            update(
                              field.key,
                              event.target.value === '' ? [] : event.target.value.split('\n'),
                            )
                          }
                          className={fieldClass}
                        />
                        <span className="mt-1 block text-xs font-normal text-esi-muted">
                          {t('admin.listHelp')}
                        </span>
                      </label>
                    ))}
                  </div>
                  <AdminGalleryUpload
                    key={`gallery-${selected.id}`}
                    images={selected.gallery ?? []}
                    onChange={(images) => update('gallery', images)}
                    onBusyChange={setGalleryUploading}
                    disabled={uploading}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-esi-border pt-5">
                    <button
                      type="button"
                      disabled={isNew || busy}
                      className={buttonClass}
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 size={16} aria-hidden />
                      {t('admin.delete')}
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className={cn(
                        buttonClass,
                        'border-esi-blue! bg-esi-blue! text-white! hover:bg-esi-secondary!',
                      )}
                    >
                      <Save size={17} aria-hidden />
                      {t('admin.save')}
                    </button>
                  </div>
                  {deleteOpen && (
                    <div
                      className="border border-esi-border bg-esi-light p-4"
                      role="group"
                      aria-label={t('admin.confirmDelete')}
                    >
                      <p className="mb-3 text-sm font-medium text-esi-navy">
                        {t('admin.confirmDelete')}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button type="button" className={buttonClass} onClick={() => remove()}>
                          {t('admin.delete')}
                        </button>
                        <button
                          type="button"
                          className={buttonClass}
                          onClick={() => setDeleteOpen(false)}
                        >
                          {t('admin.cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </fieldset>
            </form>
          </div>
        )}
      </main>
      <AdminSaveDialog
        open={saveOpen}
        onClose={() => {
          setSaveOpen(false)
          const trigger = saveTrigger.current?.isConnected
            ? saveTrigger.current
            : primarySave.current
          trigger?.focus()
        }}
      />
    </div>
  )
}
