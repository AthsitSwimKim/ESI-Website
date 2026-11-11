/** Audit API checks against the same disposable local PHP/MySQL runtime as auth tests. */
import { randomUUID } from 'node:crypto'

export async function runAuditHttpChecks({ runtime, Client, client, check, mutate }) {
  const list = (query = '', options = {}) =>
    client.request('/api/admin/audit-logs' + query, options)
  const delivery = new Client()
  const ingest = (body, options = {}) =>
    delivery.request('/api/admin/audit-events', {
      method: 'POST',
      body,
      originHeader: null,
      includeCsrf: false,
      ...options,
      headers: { 'X-ESI-Internal-Key': runtime.internalKey, ...options.headers },
    })

  const anonymous = new Client()
  check(
    (await anonymous.request('/api/admin/audit-logs')).response.status === 401,
    'anonymous cannot read audit log',
  )
  check(
    (await list('', { originHeader: 'https://evil.example' })).response.status === 403,
    'cross-origin audit read rejected',
  )
  const first = await list()
  check(
    first.response.status === 200 && first.result.pageSize === 25,
    'admin can read audit log with fixed page size',
  )
  check(
    first.result.items.some(
      (event) =>
        event.action === 'login' &&
        event.result === 'success' &&
        event.actor?.username === runtime.username,
    ),
    'successful authentication is recorded with database actor',
  )
  check(
    first.result.items.some(
      (event) =>
        event.action === 'login' &&
        event.result === 'failure' &&
        event.actor === null &&
        event.details.reason === 'INVALID_CREDENTIALS',
    ),
    'failed authentication is logged without claimed actor',
  )
  check(
    !JSON.stringify(first.result).includes('unknown_dev_user') &&
      !JSON.stringify(first.result).includes('wrong-test-password'),
    'failed username/password are absent from audit response',
  )
  check(
    first.result.items.every(
      (event) =>
        typeof event.id === 'string' &&
        /Z$/.test(event.createdAt) &&
        event.details &&
        !Array.isArray(event.details),
    ),
    'event identifiers are strings and UTC dates/details have stable shape',
  )
  check(
    first.result.actors.some(
      (actor) => actor.id === first.result.items.find((event) => event.actor)?.actor.id,
    ),
    'actor filter options include existing actors',
  )

  for (const query of [
    '?page=0',
    '?action=unknown',
    '?result=unknown',
    '?actorId=-1',
    '?from=2001-02-30',
    '?from=2001-01-02&to=2001-01-01',
    '?sql=1',
  ]) {
    const invalid = await list(query)
    check(
      invalid.response.status === 400 && invalid.result.error === 'INVALID_AUDIT_FILTER',
      'malformed audit filters fail explicitly',
    )
  }
  check(
    (await mutate('audit-fixtures')).inserted === 33,
    'bounded isolated audit fixtures inserted',
  )
  const filtered = await list('?action=restore&result=success&from=2001-01-02&to=2001-01-02')
  check(
    filtered.result.total === 30 &&
      filtered.result.totalPages === 2 &&
      filtered.result.items.length === 25,
    'SQL pagination counts inclusive Bangkok date bounds correctly',
  )
  const second = await list('?action=restore&result=success&from=2001-01-02&to=2001-01-02&page=99')
  check(
    second.result.page === 2 && second.result.items.length === 5,
    'out-of-range audit page clamps to last page',
  )
  check(
    !filtered.result.items.some((event) =>
      second.result.items.some((other) => other.id === event.id),
    ),
    'stable date/id ordering has no pagination overlap',
  )
  check(
    !JSON.stringify(filtered.result).includes('PRIVATE_FIXTURE_VALUE') &&
      !JSON.stringify(filtered.result).includes('eventId') &&
      !JSON.stringify(filtered.result).includes('source'),
    'read projection excludes raw/private legacy metadata',
  )
  check(
    filtered.result.items.every(
      (event) =>
        event.details.reason === 'UNKNOWN_ERROR' &&
        event.details.title === '<script>escaped</script>',
    ),
    'metadata reasons are coarsened while display text remains text',
  )
  const nullActor = await list(
    '?actorId=none&action=login&result=failure&from=2000-01-01&to=2000-01-01',
  )
  check(
    nullActor.result.total === 1 && nullActor.result.items[0].actor === null,
    'anonymous actor filter uses SQL NULL',
  )
  const actorId = first.result.items.find((event) => event.actor).actor.id
  const actorFilter = await list(`?actorId=${actorId}&action=restore`)
  check(
    actorFilter.result.total === 32 &&
      actorFilter.result.items.every((event) => event.actor?.id === actorId),
    'actor filter scopes SQL query to exact ID',
  )
  const empty = await list('?action=restore&from=1999-01-01&to=1999-01-01&page=2')
  check(
    empty.result.total === 0 && empty.result.page === 1 && empty.result.totalPages === 1,
    'empty result uses a single empty page',
  )

  const event = {
    eventId: randomUUID(),
    actorId,
    action: 'save_draft',
    result: 'success',
    createdAt: '2002-01-01 00:00:00',
    details: { projectId: 4294967295, title: 'Local file project', created: true },
  }
  check(
    (await ingest(event, { headers: { 'X-ESI-Internal-Key': 'wrong' } })).response.status === 403,
    'private event ingest rejects invalid key',
  )
  check(
    (await client.request('/api/admin/audit-events', { method: 'POST', body: event })).response
      .status === 403,
    'browser session and CSRF do not authorize private ingestion',
  )
  const accepted = await ingest(event)
  check(
    accepted.response.status === 200 &&
      accepted.result.accepted === true &&
      accepted.result.eventId === event.eventId &&
      accepted.result.duplicate === false &&
      typeof accepted.result.id === 'string',
    'private outbox event accepted without browser cookie',
  )
  const duplicate = await ingest(event)
  check(
    duplicate.result.duplicate === true && duplicate.result.id === accepted.result.id,
    'idempotent event replay returns existing row',
  )
  const conflict = await ingest({
    ...event,
    details: { ...event.details, title: 'Changed payload' },
  })
  check(
    conflict.response.status === 409 && conflict.result.error === 'AUDIT_EVENT_CONFLICT',
    'reused event ID with different payload is rejected',
  )
  for (const invalid of [
    { ...event, eventId: 'not-a-uuid' },
    { ...event, eventId: randomUUID(), actorId: 4294967295 },
    { ...event, eventId: randomUUID(), action: 'login' },
    { ...event, eventId: randomUUID(), details: { password: 'private' } },
    { ...event, eventId: randomUUID(), createdAt: '2002-02-30 00:00:00' },
    { ...event, eventId: randomUUID(), createdAt: '2100-01-01 00:00:00' },
  ]) {
    check(
      (await ingest(invalid)).response.status === 400,
      'invalid trusted payload is rejected before storage',
    )
  }
  const stored = await mutate('audit-storage', null, { ESI_TEST_EVENT_ID: event.eventId })
  check(
    stored.matching === 1 && stored.nullProjectKeys === true,
    'replay stores exactly one event and no forged project foreign keys',
  )
  const saved = await list('?action=save_draft&from=2002-01-01&to=2002-01-01')
  check(
    saved.result.total === 1 && saved.result.items[0].details.projectId === event.details.projectId,
    'local project identity is preserved only as safe metadata',
  )
  const oversized = await ingest({ ...event, details: { title: 'x'.repeat(9000) } })
  check(oversized.response.status === 400, 'oversized internal request is rejected')

  await mutate('role-editor')
  check((await list()).response.status === 403, 'live database editor role cannot read audit log')
  await mutate('role-admin')
  check((await list()).response.status === 200, 'restored admin role can read audit log')
  await client.request('/api/admin/auth/logout', { method: 'POST', body: {} })
  check((await list()).response.status === 401, 'logged-out session cannot read audit log')
  const afterLogout = await ingest(event)
  check(
    afterLogout.response.status === 200 && afterLogout.result.duplicate === true,
    'durable internal replay works after original user logs out',
  )
  check(
    (await client.login()).response.status === 200,
    'admin restored for remaining authentication checks',
  )
  const logouts = await list('?action=logout&result=success')
  check(
    logouts.result.items.some((item) => item.actor?.id === actorId),
    'logout audit records the original session actor',
  )
}
