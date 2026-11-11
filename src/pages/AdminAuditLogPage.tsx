import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleX,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import logo from '@/assets/logo/esi-logo.png'
import { AdminAccountMenu } from '@/components/admin/AdminAccountMenu'
import { LangSwitch } from '@/components/ui/LangSwitch'
import { Reveal } from '@/components/ui/Reveal'
import { Seo } from '@/components/ui/Seo'
import { auditActions, auditResults } from '@/data/admin-audit'
import { useT } from '@/i18n'
import {
  AdminAuditError,
  auditFilterParams,
  formatAuditTime,
  getAdminAuditLogs,
  parseAuditFilters,
  validateAuditDates,
  type AuditActor,
  type AuditDetails,
  type AuditEvent,
  type AuditFilterError,
  type AuditFilters,
  type AuditReason,
  type AuditResponse,
} from '@/lib/adminAudit'
import { pageItems } from '@/lib/pagination'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { cn } from '@/lib/utils'

const buttonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-esi-border bg-white px-4 py-2 text-sm font-semibold text-esi-blue transition-colors hover:bg-esi-light disabled:cursor-not-allowed disabled:opacity-50'
const fieldClass =
  'mt-2 min-h-11 w-full min-w-0 rounded-sm border border-esi-border bg-white px-3 py-2 text-sm text-esi-text transition-colors focus:border-esi-blue'

function AuditFiltersForm({
  initial,
  urlError,
  actors,
  onApply,
  onReset,
}: {
  initial: AuditFilters
  urlError: AuditFilterError | null
  actors: AuditActor[]
  onApply: (filters: AuditFilters) => void
  onReset: () => void
}) {
  const { t } = useT()
  const [draft, setDraft] = useState(initial)
  const [formError, setFormError] = useState<AuditFilterError | null>(null)
  const validationMessage = useRef<HTMLParagraphElement>(null)
  const error = formError || urlError
  const dateError = error === 'invalidDates' || error === 'invalidDateRange'
  const missingActor =
    draft.actorId &&
    draft.actorId !== 'none' &&
    !actors.some((actor) => String(actor.id) === draft.actorId)

  useEffect(() => {
    if (formError) validationMessage.current?.focus()
  }, [formError])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextError = validateAuditDates(draft.from, draft.to)
    setFormError(nextError)
    if (nextError) {
      validationMessage.current?.focus()
      return
    }
    onApply({ ...draft, page: 1 })
  }

  return (
    <section aria-label={t('audit.filtersTitle')}>
      <form
        noValidate
        onSubmit={submit}
        className="rounded-sm border border-esi-border bg-white p-5 sm:p-6"
      >
        <fieldset className="grid min-w-0 items-end gap-4 border-0 p-0 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.15fr_1fr_1fr_auto]">
          <legend className="sr-only">{t('audit.filtersTitle')}</legend>
          <div className="min-w-0">
            <label htmlFor="audit-action" className="text-[13px] font-semibold">
              {t('audit.action')}
            </label>
            <select
              id="audit-action"
              className={fieldClass}
              value={draft.action}
              onChange={(event) =>
                setDraft({ ...draft, action: event.target.value as AuditFilters['action'] })
              }
            >
              <option value="">{t('audit.all')}</option>
              {auditActions.map((action) => (
                <option key={action} value={action}>
                  {t(`audit.actions.${action}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="audit-result" className="text-[13px] font-semibold">
              {t('audit.result')}
            </label>
            <select
              id="audit-result"
              className={fieldClass}
              value={draft.result}
              onChange={(event) =>
                setDraft({ ...draft, result: event.target.value as AuditFilters['result'] })
              }
            >
              <option value="">{t('audit.all')}</option>
              {auditResults.map((result) => (
                <option key={result} value={result}>
                  {t(`audit.results.${result}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="audit-actor" className="text-[13px] font-semibold">
              {t('audit.actor')}
            </label>
            <select
              id="audit-actor"
              className={fieldClass}
              value={draft.actorId}
              onChange={(event) => setDraft({ ...draft, actorId: event.target.value })}
            >
              <option value="">{t('audit.all')}</option>
              <option value="none">{t('audit.unknownActor')}</option>
              {missingActor && (
                <option value={draft.actorId}>
                  {t('audit.accountNumber')} #{draft.actorId}
                </option>
              )}
              {actors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.displayName ? `${actor.displayName} (${actor.username})` : actor.username}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="audit-from" className="text-[13px] font-semibold">
              {t('audit.from')}
            </label>
            <input
              id="audit-from"
              type="date"
              min="1970-01-01"
              max="2100-12-31"
              className={fieldClass}
              value={draft.from}
              aria-invalid={dateError || undefined}
              aria-describedby={error ? 'audit-filter-error' : undefined}
              onChange={(event) => setDraft({ ...draft, from: event.target.value })}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="audit-to" className="text-[13px] font-semibold">
              {t('audit.to')}
            </label>
            <input
              id="audit-to"
              type="date"
              min="1970-01-01"
              max="2100-12-31"
              className={fieldClass}
              value={draft.to}
              aria-invalid={dateError || undefined}
              aria-describedby={error ? 'audit-filter-error' : undefined}
              onChange={(event) => setDraft({ ...draft, to: event.target.value })}
            />
          </div>
          <button
            type="submit"
            className={cn(
              buttonClass,
              'border-esi-blue! bg-esi-blue! text-white! hover:bg-esi-secondary!',
            )}
          >
            {t('audit.apply')}
          </button>
        </fieldset>
        {error && (
          <p
            id="audit-filter-error"
            ref={validationMessage}
            role="alert"
            tabIndex={-1}
            className="mt-5 rounded-sm border-l-[3px] border-esi-blue bg-esi-light px-3 py-3 text-sm leading-relaxed text-esi-blue outline-offset-4"
          >
            {t(`audit.${error}`)}
          </p>
        )}
      </form>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 min-h-11 rounded-sm text-[13px] font-semibold text-esi-blue hover:underline"
      >
        {t('audit.reset')}
      </button>
    </section>
  )
}

function AuditResultBadge({ event }: { event: AuditEvent }) {
  const { t } = useT()
  const success = event.result === 'success'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-semibold',
        success ? 'bg-esi-light text-esi-blue' : 'border border-esi-border bg-white text-esi-navy',
      )}
    >
      {success ? <CheckCircle2 size={14} aria-hidden /> : <CircleX size={14} aria-hidden />}
      {t(`audit.results.${event.result}`)}
    </span>
  )
}

function AuditActorName({ actor }: { actor: AuditActor | null }) {
  const { t } = useT()
  return actor ? (
    <div className="min-w-0 break-words">
      <p className="font-medium text-esi-navy">{actor.displayName || actor.username}</p>
      {actor.displayName && actor.displayName !== actor.username && (
        <p className="mt-1 text-xs text-esi-muted">{actor.username}</p>
      )}
    </div>
  ) : (
    <span className="text-esi-muted">{t('audit.unknownActor')}</span>
  )
}

function AuditSubject({ event }: { event: AuditEvent }) {
  const { t, lang } = useT()
  return (
    <div className="min-w-0 [overflow-wrap:anywhere] break-words">
      {event.details.title && <p className="font-medium text-esi-navy">{event.details.title}</p>}
      {event.details.projectId !== undefined && (
        <p className={cn(event.details.title && 'mt-1', 'text-xs text-esi-muted')}>
          {t('audit.projectNumber')} #{event.details.projectId.toLocaleString(lang)}
        </p>
      )}
      {!event.details.title && event.details.projectId === undefined && (
        <span className="text-esi-muted">{t('audit.noSubject')}</span>
      )}
    </div>
  )
}

function AuditDetailsPanel({ event }: { event: AuditEvent }) {
  const { t, lang } = useT()
  const entries = Object.entries(event.details) as [keyof AuditDetails, string | number | boolean][]
  if (!entries.length) return <span className="text-esi-muted">{t('audit.noSubject')}</span>
  return (
    <details className="group min-w-0">
      <summary
        className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-sm font-semibold text-esi-blue"
        aria-label={`${t('audit.viewDetails')}: ${t(`audit.actions.${event.action}`)}, ${formatAuditTime(event.createdAt, lang)}`}
      >
        {t('audit.viewDetails')}
        <ChevronDown size={15} aria-hidden className="transition-transform group-open:rotate-180" />
      </summary>
      <dl className="mt-2 space-y-3 border-l-2 border-esi-border pl-3 text-xs leading-relaxed">
        {entries.map(([key, value]) => (
          <div key={key}>
            <dt className="font-semibold text-esi-muted">{t(`audit.fields.${key}`)}</dt>
            <dd className="mt-1 [overflow-wrap:anywhere] break-words text-esi-text">
              {key === 'reason'
                ? t(`audit.reasons.${value as AuditReason}`)
                : typeof value === 'boolean'
                  ? t(value ? 'audit.yes' : 'audit.no')
                  : typeof value === 'number'
                    ? value.toLocaleString(lang)
                    : value}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

function AuditEmptyState({ filtered }: { filtered: boolean }) {
  const { t } = useT()
  return (
    <div className="px-5 py-12 text-center sm:px-6 sm:py-14">
      <h3 className="text-base font-semibold text-esi-navy">
        {t(filtered ? 'audit.noMatchesTitle' : 'audit.emptyTitle')}
      </h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-esi-muted">
        {t(filtered ? 'audit.noMatchesHelp' : 'audit.emptyHelp')}
      </p>
    </div>
  )
}

function AuditEventList({ items, filtered }: { items: AuditEvent[]; filtered: boolean }) {
  const { t, lang } = useT()
  return (
    <>
      <div className="hidden lg:block">
        <table className="w-full table-fixed border-collapse text-left text-[13px]">
          <caption className="sr-only">{t('audit.resultsTitle')}</caption>
          <thead className="border-b border-esi-border bg-esi-light text-xs text-esi-muted">
            <tr>
              <th scope="col" className="w-[19%] px-5 py-4 font-semibold">
                {t('audit.time')}
              </th>
              <th scope="col" className="w-[17%] px-5 py-4 font-semibold">
                {t('audit.actor')}
              </th>
              <th scope="col" className="w-[14%] px-5 py-4 font-semibold">
                {t('audit.action')}
              </th>
              <th scope="col" className="w-[23%] px-5 py-4 font-semibold">
                {t('audit.subject')}
              </th>
              <th scope="col" className="w-[12%] px-5 py-4 font-semibold">
                {t('audit.result')}
              </th>
              <th scope="col" className="w-[15%] px-5 py-4 font-semibold">
                {t('audit.details')}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((event) => (
              <tr key={event.id} className="border-b border-esi-border align-top last:border-b-0">
                <td className="px-5 py-4 leading-relaxed text-esi-muted">
                  <time dateTime={event.createdAt}>
                    {formatAuditTime(event.createdAt, lang) || t('audit.timeUnavailable')}
                  </time>
                </td>
                <td className="px-5 py-4">
                  <AuditActorName actor={event.actor} />
                </td>
                <td className="px-5 py-4 font-medium text-esi-navy">
                  {t(`audit.actions.${event.action}`)}
                </td>
                <td className="px-5 py-4">
                  <AuditSubject event={event} />
                </td>
                <td className="px-5 py-4">
                  <AuditResultBadge event={event} />
                </td>
                <td className="px-5 py-3">
                  <AuditDetailsPanel event={event} />
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={6}>
                  <AuditEmptyState filtered={filtered} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {items.length > 0 ? (
        <ul className="divide-y divide-esi-border lg:hidden">
          {items.map((event) => (
            <li key={event.id} className="min-w-0 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-esi-blue">
                  {t(`audit.actions.${event.action}`)}
                </h3>
                <AuditResultBadge event={event} />
              </div>
              <dl className="mt-4 grid gap-4 text-sm">
                <div>
                  <dt className="mb-1 text-xs font-semibold text-esi-muted">{t('audit.time')}</dt>
                  <dd>
                    <time dateTime={event.createdAt}>
                      {formatAuditTime(event.createdAt, lang) || t('audit.timeUnavailable')}
                    </time>
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs font-semibold text-esi-muted">{t('audit.actor')}</dt>
                  <dd>
                    <AuditActorName actor={event.actor} />
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs font-semibold text-esi-muted">
                    {t('audit.subject')}
                  </dt>
                  <dd>
                    <AuditSubject event={event} />
                  </dd>
                </div>
              </dl>
              <div className="mt-2 text-sm">
                <AuditDetailsPanel event={event} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="lg:hidden">
          <AuditEmptyState filtered={filtered} />
        </div>
      )}
    </>
  )
}

export function AdminAuditLogPage() {
  const { t, lang } = useT()
  const auth = useAdminAuth()
  const [params, setParams] = useSearchParams()
  const parsed = useMemo(() => parseAuditFilters(params), [params])
  const [retry, setRetry] = useState(0)
  const [fetched, setFetched] = useState<{
    key: string | null
    response?: AuditResponse
    error?: string
  }>({ key: null })
  const resultsHeading = useRef<HTMLHeadingElement>(null)
  const allowed = auth.user?.role === 'admin'
  const requestKey = `${auditFilterParams(parsed.filters)}|${retry}`
  const response = fetched.key === requestKey ? fetched.response : undefined
  const error = fetched.key === requestKey ? fetched.error : undefined
  const loading = allowed && !parsed.error && fetched.key !== requestKey
  const hasFilters = !!(
    parsed.filters.action ||
    parsed.filters.result ||
    parsed.filters.actorId ||
    parsed.filters.from ||
    parsed.filters.to
  )

  useEffect(() => {
    if (!allowed || parsed.error) return
    const controller = new AbortController()
    void getAdminAuditLogs(parsed.filters, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setFetched({ key: requestKey, response: data })
      },
      (reason) => {
        if (!controller.signal.aborted)
          setFetched({
            key: requestKey,
            error: reason instanceof AdminAuditError ? reason.code : 'BACKEND_UNAVAILABLE',
          })
      },
    )
    return () => controller.abort()
  }, [allowed, parsed, requestKey])

  function changePage(page: number) {
    setParams(auditFilterParams({ ...parsed.filters, page }))
    resultsHeading.current?.focus({ preventScroll: true })
    resultsHeading.current?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="min-h-screen bg-esi-light">
      <Seo
        title={`${t('audit.title')} | ESI`}
        description={t('audit.description')}
        path="/admin/audit-logs"
      />
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <a
        href="#audit-main"
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
          <div className="flex max-w-full min-w-0 flex-wrap items-center justify-end gap-x-4 gap-y-2">
            <LangSwitch />
            <AdminAccountMenu />
          </div>
        </div>
      </header>
      <main id="audit-main" className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8 lg:py-10">
        <Reveal immediate>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="display-title text-3xl text-esi-blue">{t('audit.title')}</h1>
              <span aria-hidden className="mt-3 block h-[3px] w-10 bg-esi-blue" />
              <p className="mt-[18px] text-sm leading-relaxed text-esi-muted">{t('audit.intro')}</p>
            </div>
            <Link to="/admin" className={buttonClass}>
              <ArrowLeft size={16} aria-hidden />
              {t('audit.back')}
            </Link>
          </div>
        </Reveal>
        {!allowed || error === 'FORBIDDEN' ? (
          <p
            role="alert"
            className="rounded-sm border border-esi-border bg-white p-6 text-sm text-esi-blue"
          >
            {t('audit.forbidden')}
          </p>
        ) : (
          <>
            <AuditFiltersForm
              key={requestKey}
              initial={parsed.filters}
              urlError={parsed.error}
              actors={fetched.response?.actors || []}
              onApply={(filters) => {
                setParams(auditFilterParams(filters))
                setRetry((value) => value + 1)
              }}
              onReset={() => {
                setParams(new URLSearchParams())
                setRetry((value) => value + 1)
              }}
            />
            <section
              className="mt-6 overflow-hidden rounded-sm border border-esi-border bg-white"
              aria-labelledby="audit-results-title"
              aria-busy={loading}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-esi-border px-5 py-5 sm:px-6">
                <h2
                  id="audit-results-title"
                  ref={resultsHeading}
                  tabIndex={-1}
                  className="scroll-mt-5 rounded-sm display-title text-lg text-esi-blue outline-offset-4"
                >
                  {t('audit.resultsTitle')}
                </h2>
                <p role="status" aria-live="polite" className="text-[13px] text-esi-muted">
                  {response && (
                    <>
                      {response.total.toLocaleString(lang)} {t('audit.records')}
                    </>
                  )}
                </p>
              </div>
              {parsed.error ? (
                <p className="p-6 text-sm text-esi-muted">{t('audit.correctFilters')}</p>
              ) : loading ? (
                <p role="status" className="p-6 text-sm text-esi-muted">
                  {t('audit.loading')}
                </p>
              ) : error ? (
                <div className="p-6">
                  <p role="alert" className="text-sm leading-relaxed text-esi-blue">
                    {t(
                      error === 'INVALID_AUDIT_FILTER'
                        ? 'audit.invalidFilters'
                        : 'audit.unavailable',
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetry((value) => value + 1)}
                    className={cn(buttonClass, 'mt-4')}
                  >
                    {t('admin.retry')}
                  </button>
                </div>
              ) : response ? (
                <AuditEventList items={response.items} filtered={hasFilters} />
              ) : null}
            </section>
            {response && response.total > 0 && !parsed.error && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-esi-border pt-6">
                <p className="text-sm text-esi-muted">
                  {t('audit.showing')}{' '}
                  <span className="font-semibold text-esi-navy">
                    {((response.page - 1) * response.pageSize + 1).toLocaleString(lang)}–
                    {Math.min(response.page * response.pageSize, response.total).toLocaleString(
                      lang,
                    )}
                  </span>{' '}
                  {t('audit.of')}{' '}
                  <span className="font-semibold text-esi-navy">
                    {response.total.toLocaleString(lang)}
                  </span>{' '}
                  {t('audit.records')}
                </p>
                {response.totalPages > 1 && (
                  <nav
                    aria-label={t('audit.pagination')}
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => changePage(response.page - 1)}
                      disabled={response.page === 1}
                      aria-label={t('pagination.previous')}
                      className={cn(buttonClass, 'size-10 min-h-10! shrink-0 rounded-full! px-0!')}
                    >
                      <ChevronLeft size={18} aria-hidden />
                    </button>
                    {pageItems(response.page, response.totalPages).map((item, index) =>
                      item === 'gap' ? (
                        <span key={`gap-${index}`} aria-hidden className="px-1 text-esi-muted">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => changePage(item)}
                          aria-label={`${t('pagination.goTo')} ${item}`}
                          aria-current={item === response.page ? 'page' : undefined}
                          className={cn(
                            buttonClass,
                            'size-10 min-h-10! shrink-0 rounded-full! px-0!',
                            item === response.page && 'border-esi-blue! bg-esi-blue! text-white!',
                          )}
                        >
                          {item}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => changePage(response.page + 1)}
                      disabled={response.page === response.totalPages}
                      aria-label={t('pagination.next')}
                      className={cn(buttonClass, 'size-10 min-h-10! shrink-0 rounded-full! px-0!')}
                    >
                      <ChevronRight size={18} aria-hidden />
                    </button>
                  </nav>
                )}
              </div>
            )}
            <p className="mt-5 text-xs leading-relaxed text-esi-muted">{t('audit.timezone')}</p>
          </>
        )}
      </main>
    </div>
  )
}
