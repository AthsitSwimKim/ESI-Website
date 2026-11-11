import { createContext } from 'react'

import type { AdminUser } from '@/lib/adminAuth'

export interface AdminAuthContextValue {
  user: AdminUser | null
  phase: 'loading' | 'ready' | 'error'
  expired: boolean
  refresh: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)
