import { describe, expect, it } from 'vitest'

import { adminLoginPath, isAdminLoginPath, safeAdminReturnTo } from '@/lib/adminAuth'

describe('admin login return destination', () => {
  it('keeps editor state and draft previews within the admin area', () => {
    expect(safeAdminReturnTo('/admin?q=CCTV&page=2')).toBe('/admin?q=CCTV&page=2')
    expect(safeAdminReturnTo('/admin/projects/21?tab=details#scope')).toBe(
      '/admin/projects/21?tab=details#scope',
    )
    expect(safeAdminReturnTo('/admin/preview/21')).toBe('/admin/preview/21')
    expect(adminLoginPath('/admin/projects/new')).toBe(
      '/admin/login?returnTo=%2Fadmin%2Fprojects%2Fnew',
    )
  })

  it('rejects external destinations, malformed paths and login loops', () => {
    for (const value of [
      undefined,
      null,
      '',
      'https://elsewhere.example/admin',
      '//elsewhere.example/admin',
      '/\\elsewhere.example/admin',
      '/admin/../../contact',
      '/administer',
      '/contact',
      '/admin/login',
      '/admin/login?returnTo=https://elsewhere.example',
      '/admin/login/',
      '/admin/%6cogin',
      '/admin/LOGIN',
      '/admin/../admin/login',
      '/admin/%',
      '/admin/%5cexternal',
      '/admin/%0a',
      '/admin\n',
    ])
      expect(safeAdminReturnTo(value)).toBe('/admin')
  })

  it('recognizes equivalent login paths without looping after authentication', () => {
    for (const pathname of ['/admin/login', '/admin/login/', '/admin/LOGIN', '/admin/%6cogin'])
      expect(isAdminLoginPath(pathname)).toBe(true)
    for (const pathname of ['/admin', '/admin/projects/new', '/admin/login-extra', '/admin/%'])
      expect(isAdminLoginPath(pathname)).toBe(false)
  })
})
