import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'

export class AdminAuthError extends Error {
  code: string
  status: number
  constructor(code: string, status?: number)
}

export function authorizeAdminRequest(
  root: string,
  request: IncomingMessage,
): Promise<{
  id: number
  username: string
  displayName: string
  role: 'admin' | 'editor'
  auditScope: string
}>

export function flushAdminAuditEvents(root: string): Promise<number>

export function devAdminAuthPlugin(): Plugin
