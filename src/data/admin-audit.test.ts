import { describe, expect, it } from 'vitest'

import {
  auditFilterParams,
  formatAuditTime,
  isAuditDate,
  parseAuditFilters,
  readAuditDetails,
  validateAuditDates,
} from '@/lib/adminAudit'

describe('audit filters and Bangkok dates', () => {
  it('round trips supported filters without changing the Bangkok calendar bounds', () => {
    const params = new URLSearchParams(
      'page=2&action=publish&result=success&actorId=none&from=2026-11-01&to=2026-11-11',
    )
    const parsed = parseAuditFilters(params)
    expect(parsed.error).toBeNull()
    expect(auditFilterParams(parsed.filters).toString()).toBe(params.toString())
  })

  it('rejects invalid dates, reversed ranges, duplicate and unknown query values', () => {
    expect(isAuditDate('2024-02-29')).toBe(true)
    expect(isAuditDate('2025-02-29')).toBe(false)
    expect(isAuditDate('2026-2-01')).toBe(false)
    expect(isAuditDate('1969-12-31')).toBe(false)
    expect(isAuditDate('2101-01-01')).toBe(false)
    expect(isAuditDate('1970-01-01')).toBe(true)
    expect(isAuditDate('2100-12-31')).toBe(true)
    expect(validateAuditDates('2026-11-11', '2026-11-01')).toBe('invalidDateRange')
    for (const query of [
      'page=-1',
      'page=1.5',
      'page=1000001',
      'page=9007199254740992',
      'actorId=0',
      'actorId=4294967296',
      'action=erase',
      'result=unknown',
      'page=1&page=2',
      'from=2025-02-29',
      'from=1960-01-01',
      'to=2101-01-01',
      'unused=1',
    ])
      expect(parseAuditFilters(new URLSearchParams(query)).error).not.toBeNull()
  })

  it('converts UTC across midnight into Thailand time for either locale', () => {
    const en = formatAuditTime('2026-11-11T17:30:00Z', 'en')
    const th = formatAuditTime('2026-11-11T17:30:00Z', 'th')
    expect(en).toContain('12 Nov 2026')
    expect(en).toContain('00:30:00')
    expect(th).toContain('12')
    expect(th).toContain('00:30:00')
    expect(formatAuditTime('2026-11-11 17:30:00', 'en')).toBeNull()
    expect(formatAuditTime('not-a-date', 'en')).toBeNull()
  })
})

describe('audit details disclosure boundary', () => {
  it('drops unknown fields and unapproved reason strings instead of exposing raw metadata', () => {
    expect(
      readAuditDetails({
        projectId: 21,
        title: 'Existing project',
        uploadCount: 2,
        password: 'private',
        token: 'private',
        ip: 'private',
        reason: 'secret text',
        nested: { secret: true },
      }),
    ).toEqual({ projectId: 21, title: 'Existing project', uploadCount: 2 })
    expect(
      readAuditDetails({ reason: 'INVALID_CREDENTIALS', migratedCount: 0, created: false }),
    ).toEqual({ reason: 'INVALID_CREDENTIALS', migratedCount: 0, created: false })
  })
})
