import { useContext } from 'react'

import { AdminAuthContext } from '@/lib/adminAuthContext'

export function useAdminAuth() {
  const auth = useContext(AdminAuthContext)
  if (!auth) throw new Error('Admin authentication context is missing')
  return auth
}
