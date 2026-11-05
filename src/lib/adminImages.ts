import { adminImageLimits } from '@/data/admin'

export type ImageUploadError = 'uploadTypeError' | 'uploadSizeError' | 'uploadReadError'

export function checkImageFile(file: Pick<File, 'type' | 'size'>): ImageUploadError | null {
  if (!(adminImageLimits.mimeTypes as readonly string[]).includes(file.type))
    return 'uploadTypeError'
  if (file.size <= 0 || file.size > adminImageLimits.fileBytes) return 'uploadSizeError'
  return null
}

/** Only raster data produced by the uploader can be used as inline draft images. */
export function isInlineDraftImage(value: string): boolean {
  if (value.length > Math.ceil(adminImageLimits.encodedBytes / 3) * 4 + 32) return false
  const match = /^data:image\/(?:webp|jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value)
  return Boolean(match && match[1].length % 4 === 0)
}

/** Decode and resize locally. Re-encoding strips original metadata and avoids SVG content. */
export async function prepareDraftImage(file: File): Promise<string> {
  const error = checkImageFile(file)
  if (error) throw new Error(error)
  const bitmap = await createImageBitmap(file)
  try {
    const ratio = Math.min(1, adminImageLimits.maxSide / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio))
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('uploadReadError')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    for (const quality of [0.85, 0.7, 0.55]) {
      const result = canvas.toDataURL('image/webp', quality)
      if (isInlineDraftImage(result)) return result
    }
    throw new Error('uploadSizeError')
  } finally {
    bitmap.close()
  }
}

/** Validate the full selection first; callers apply the batch only when every image succeeds. */
export async function prepareDraftImages(files: File[]): Promise<string[]> {
  for (const file of files) {
    const error = checkImageFile(file)
    if (error) throw new Error(error)
  }
  const images: string[] = []
  for (const file of files) images.push(await prepareDraftImage(file))
  return images
}
