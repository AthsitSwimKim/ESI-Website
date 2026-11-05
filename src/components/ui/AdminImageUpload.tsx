import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'

import { useT } from '@/i18n'
import { checkImageFile, prepareDraftImage } from '@/lib/adminImages'

interface AdminImageUploadProps {
  image: string
  onChange: (image: string) => void
  onBusyChange: (busy: boolean) => void
  disabled?: boolean
}

export function AdminImageUpload({
  image,
  onChange,
  onBusyChange,
  disabled = false,
}: AdminImageUploadProps) {
  const { t } = useT()
  const input = useRef<HTMLInputElement>(null)
  const active = useRef(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const problem = checkImageFile(file)
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setBusy(true)
    onBusyChange(true)
    try {
      const result = await prepareDraftImage(file)
      if (active.current) onChange(result)
    } catch (cause) {
      if (active.current)
        setError(
          cause instanceof Error && cause.message === 'uploadSizeError'
            ? 'uploadSizeError'
            : 'uploadReadError',
        )
    } finally {
      if (active.current) {
        setBusy(false)
        onBusyChange(false)
      }
    }
  }

  return (
    <div className="min-w-0">
      <p id="admin-image-label" className="text-sm font-medium text-esi-navy">
        {t('admin.image')} *
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-4 rounded-sm border border-dashed border-esi-border bg-esi-light p-4">
        {image && (
          <img
            src={image}
            alt={t('admin.image')}
            width="120"
            height="80"
            className="h-20 w-30 rounded-sm object-cover"
          />
        )}
        <div className="min-w-0 flex-1 basis-44">
          <input
            ref={input}
            id="admin-image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={upload}
            disabled={busy || disabled}
            aria-labelledby="admin-image-label"
            aria-describedby="admin-image-help"
            className="sr-only"
            tabIndex={-1}
          />
          <button
            type="button"
            disabled={busy || disabled}
            onClick={() => input.current?.click()}
            aria-describedby="admin-image-help"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-esi-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-esi-secondary disabled:cursor-wait disabled:opacity-60"
          >
            <Upload size={17} aria-hidden />
            {t(busy ? 'admin.uploading' : 'admin.uploadImage')}
          </button>
          <p id="admin-image-help" className="mt-2 text-xs leading-relaxed text-esi-muted">
            {t('admin.uploadHelp')}
          </p>
        </div>
      </div>
      <p role="status" aria-live="polite" className="mt-2 text-sm text-esi-blue">
        {error && t(`admin.${error}` as 'admin.uploadReadError')}
      </p>
    </div>
  )
}
