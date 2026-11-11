export const auditActions = [
  'login',
  'logout',
  'save_draft',
  'publish',
  'unpublish',
  'delete',
  'restore',
  'upload',
] as const

export const auditResults = ['success', 'failure'] as const

export const auditReasons = [
  'INVALID_CREDENTIALS',
  'RATE_LIMITED',
  'CONFLICT',
  'DUPLICATE_SLUG',
  'INVALID_PROJECT',
  'FEATURED_LIMIT',
  'INVALID_IMAGE',
  'IMAGE_NOT_FOUND',
  'NOT_FOUND',
  'SAVE_FAILED',
  'BACKEND_UNAVAILABLE',
  'FORBIDDEN',
  'TOO_LARGE',
  'STORE_CORRUPT',
  'UNKNOWN_ERROR',
] as const

export const auditPageSize = 25
