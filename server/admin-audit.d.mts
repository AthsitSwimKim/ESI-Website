export interface AuditContext {
  actorId: number
  scope: string
}
export interface QueuedAuditEvent extends AuditContext {
  eventId: string
  action: 'save_draft' | 'publish' | 'unpublish' | 'delete' | 'upload'
  result: 'success' | 'failure'
  createdAt: string
  details: Record<string, string | number | boolean | undefined>
}
export function createProjectAuditEvents(
  context: AuditContext | undefined,
  action: string,
  result: string,
  details?: Record<string, unknown>,
): QueuedAuditEvent[]
export function enqueueAdminAudit(root: string, event: QueuedAuditEvent): Promise<void>
export function flushAdminAudit(
  root: string,
  scope: string,
  deliver: (event: Omit<QueuedAuditEvent, 'scope'>) => Promise<boolean>,
): Promise<number>
