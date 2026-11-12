import { describe, expect, it } from 'vitest'

import { adminLoginPath, isAdminLoginPath, safeAdminReturnTo } from '@/lib/adminAuth'

describe('admin login return destination', () => {
  it('keeps editor state and draft previews within the admin area', () => {
    expect(safeAdminReturnTo('/admin-portal-update?q=CCTV&page=2')).toBe(
      '/admin-portal-update/?q=CCTV&page=2',
    )
    expect(safeAdminReturnTo('/admin-portal-update/')).toBe('/admin-portal-update/')
    expect(safeAdminReturnTo('/admin-portal-update/projects/21?tab=details#scope')).toBe(
      '/admin-portal-update/projects/21?tab=details#scope',
    )
    expect(safeAdminReturnTo('/admin-portal-update/preview/21')).toBe(
      '/admin-portal-update/preview/21',
    )
    expect(adminLoginPath('/admin-portal-update/projects/new')).toBe(
      '/admin-portal-update/login?returnTo=%2Fadmin-portal-update%2Fprojects%2Fnew',
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
      '/admin-portal-update/../../contact',
      '/administer',
      '/contact',
      '/admin',
      '/admin/login',
      '/admin/projects/new',
      '/admin-portal-update-extra',
      '/admin-portal-update/login',
      '/admin-portal-update/login?returnTo=https://elsewhere.example',
      '/admin-portal-update/login/',
      '/admin-portal-update/%6cogin',
      '/admin-portal-update/LOGIN',
      '/admin-portal-update/../admin-portal-update/login',
      '/admin-portal-update/%',
      '/admin-portal-update/%5cexternal',
      '/admin-portal-update/%0a',
      '/admin\n',
    ])
      expect(safeAdminReturnTo(value)).toBe('/admin-portal-update/')
  })

  it('recognizes equivalent login paths without looping after authentication', () => {
    for (const pathname of [
      '/admin-portal-update/login',
      '/admin-portal-update/login/',
      '/admin-portal-update/LOGIN',
      '/admin-portal-update/%6cogin',
    ])
      expect(isAdminLoginPath(pathname)).toBe(true)
    for (const pathname of [
      '/admin-portal-update',
      '/admin-portal-update/projects/new',
      '/admin-portal-update/login-extra',
      '/admin-portal-update/%',
    ])
      expect(isAdminLoginPath(pathname)).toBe(false)
  })
})
