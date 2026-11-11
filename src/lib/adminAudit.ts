import { auditActions, auditReasons, auditResults, auditPageSize } from '@/data/admin-audit'
import { notifyAdminUnauthorized } from '@/lib/adminAuth'
import type { Lang } from '@/types'

export type AuditAction = (typeof auditActions)[number]
export type AuditResult = (typeof auditResults)[number]
export type AuditReason = (typeof auditReasons)[number]

export interface AuditActor {
  id: number
  username: string
  displayName: string
}

export interface AuditDetails {
  projectId?: number
  title?: string
  uploadCount?: number
  reason?: AuditReason
  created?: boolean
  migratedCount?: number
}

export interface AuditEvent {
  id: string
  action: AuditAction
  result: AuditResult
  actor: AuditActor | null
  createdAt: string
  details: AuditDetails
}

export interface AuditResponse {
  items: AuditEvent[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  actors: AuditActor[]
}

export interface AuditFilters {
  page: number
  action: AuditAction | ''
  result: AuditResult | ''
  actorId: string
  from: string
  to: string
}

export type AuditFilterError = 'invalidFilters' | 'invalidDates' | 'invalidDateRange'

export class AdminAuditError extends Error {
  readonly code: string
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

function isAction(value: unknown): value is AuditAction {
  return typeof value === 'string' && auditActions.some((action) => action === value)
}

function isResult(value: unknown): value is AuditResult {
  return typeof value === 'string' && auditResults.some((result) => result === value)
}

export function isAuditDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const year = Number(value.slice(0, 4))
  if (year < 1970 || year > 2100) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function validateAuditDates(from: string, to: string): AuditFilterError | null {
  if ((from && !isAuditDate(from)) || (to && !isAuditDate(to))) return 'invalidDates'
  if (from && to && from > to) return 'invalidDateRange'
  return null
}

export function parseAuditFilters(params: URLSearchParams): {
  filters: AuditFilters
  error: AuditFilterError | null
} {
  const pageValue = params.get('page') ?? '1'
  const actionValue = params.get('action') ?? ''
  const resultValue = params.get('result') ?? ''
  const actorValue = params.get('actorId') ?? ''
  const fromValue = params.get('from') ?? ''
  const toValue = params.get('to') ?? ''
  const validPage =
    /^[1-9]\d*$/.test(pageValue) &&
    Number.isSafeInteger(Number(pageValue)) &&
    Number(pageValue) <= 1000000
  const validActor =
    !actorValue ||
    actorValue === 'none' ||
    (/^[1-9]\d*$/.test(actorValue) && Number(actorValue) <= 4294967295)
  const invalidOptions =
    !validPage ||
    !validActor ||
    (!!actionValue && !isAction(actionValue)) ||
    (!!resultValue && !isResult(resultValue)) ||
    [...params.keys()].some(
      (key) =>
        !['page', 'action', 'result', 'actorId', 'from', 'to'].includes(key) ||
        params.getAll(key).length > 1,
    )
  const dateError = validateAuditDates(fromValue, toValue)
  return {
    filters: {
      page: validPage ? Number(pageValue) : 1,
      action: isAction(actionValue) ? actionValue : '',
      result: isResult(resultValue) ? resultValue : '',
      actorId: validActor ? actorValue : '',
      from: isAuditDate(fromValue) ? fromValue : '',
      to: isAuditDate(toValue) ? toValue : '',
    },
    error: dateError || (invalidOptions ? 'invalidFilters' : null),
  }
}

export function auditFilterParams(filters: AuditFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.page > 1) params.set('page', String(filters.page))
  for (const key of ['action', 'result', 'actorId', 'from', 'to'] as const)
    if (filters[key]) params.set(key, filters[key])
  return params
}

/** Backend timestamps are UTC; locale changes presentation, never the selected timezone. */
export function formatAuditTime(value: string, lang: Lang): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-GB', {
    timeZone: 'Asia/Bangkok',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0
}

function readActor(value: unknown): AuditActor {
  if (
    !isObject(value) ||
    !isPositiveInteger(value.id) ||
    typeof value.username !== 'string' ||
    typeof value.displayName !== 'string'
  )
    throw new AdminAuditError('INVALID_RESPONSE')
  return { id: value.id, username: value.username, displayName: value.displayName }
}

/** Only explicitly approved fields can reach the UI, even if a server adds other metadata. */
export function readAuditDetails(value: unknown): AuditDetails {
  if (!isObject(value)) return {}
  const details: AuditDetails = {}
  if (isPositiveInteger(value.projectId)) details.projectId = value.projectId
  if (typeof value.title === 'string' && value.title.trim()) details.title = value.title
  for (const key of ['uploadCount', 'migratedCount'] as const)
    if (Number.isSafeInteger(value[key]) && Number(value[key]) >= 0)
      details[key] = Number(value[key])
  if (typeof value.created === 'boolean') details.created = value.created
  if (typeof value.reason === 'string' && auditReasons.some((reason) => reason === value.reason))
    details.reason = value.reason as AuditReason
  return details
}

function readAuditResponse(value: unknown): AuditResponse {
  if (
    !isObject(value) ||
    !Array.isArray(value.items) ||
    !Array.isArray(value.actors) ||
    !isPositiveInteger(value.page) ||
    value.pageSize !== auditPageSize ||
    !Number.isSafeInteger(value.total) ||
    Number(value.total) < 0 ||
    !isPositiveInteger(value.totalPages)
  )
    throw new AdminAuditError('INVALID_RESPONSE')
  const items = value.items.map((item): AuditEvent => {
    if (
      !isObject(item) ||
      typeof item.id !== 'string' ||
      !/^[1-9]\d*$/.test(item.id) ||
      !isAction(item.action) ||
      !isResult(item.result) ||
      typeof item.createdAt !== 'string' ||
      formatAuditTime(item.createdAt, 'en') === null
    )
      throw new AdminAuditError('INVALID_RESPONSE')
    return {
      id: item.id,
      action: item.action,
      result: item.result,
      actor: item.actor === null ? null : readActor(item.actor),
      createdAt: item.createdAt,
      details: readAuditDetails(item.details),
    }
  })
  return {
    items,
    actors: value.actors.map(readActor),
    page: value.page,
    pageSize: auditPageSize,
    total: Number(value.total),
    totalPages: value.totalPages,
  }
}

export async function getAdminAuditLogs(
  filters: AuditFilters,
  signal: AbortSignal,
): Promise<AuditResponse> {
  const params = auditFilterParams(filters)
  params.set('page', String(filters.page))
  let response: Response
  try {
    response = await fetch(`/api/admin/audit-logs?${params}`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.any([signal, AbortSignal.timeout(20000)]),
    })
  } catch (error) {
    if (signal.aborted) throw error
    throw new AdminAuditError('BACKEND_UNAVAILABLE')
  }
  if (response.status === 401) {
    notifyAdminUnauthorized()
    throw new AdminAuditError('AUTH_REQUIRED')
  }
  if (!response.headers.get('content-type')?.includes('application/json'))
    throw new AdminAuditError('BACKEND_UNAVAILABLE')
  let value: unknown
  try {
    value = await response.json()
  } catch {
    throw new AdminAuditError('BACKEND_UNAVAILABLE')
  }
  if (!response.ok)
    throw new AdminAuditError(
      isObject(value) && typeof value.error === 'string' ? value.error : 'BACKEND_UNAVAILABLE',
    )
  return readAuditResponse(value)
}
