import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'

import { adminImageLimits } from '@/data/admin'
import { useT } from '@/i18n'
import { prepareDraftImages, type ImageUploadError } from '@/lib/adminImages'

interface AdminGalleryUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  onBusyChange: (busy: boolean) => void
  disabled: boolean
}

export function AdminGalleryUpload({
  images,
  onChange,
  onBusyChange,
  disabled,
}: AdminGalleryUploadProps) {
  const { t } = useT()
  const input = useRef<HTMLInputElement>(null)
  const active = useRef(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ImageUploadError | 'galleryLimitError' | ''>('')

  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return
    if (images.length + files.length > adminImageLimits.galleryCount) {
      setError('galleryLimitError')
      return
    }
    setError('')
    setBusy(true)
    onBusyChange(true)
    try {
      const added = await prepareDraftImages(files)
      if (active.current) onChange([...new Set([...images, ...added])])
    } catch (cause) {
      if (active.current) {
        const code = cause instanceof Error ? cause.message : ''
        setError(
          code === 'uploadTypeError' || code === 'uploadSizeError' ? code : 'uploadReadError',
        )
      }
    } finally {
      if (active.current) {
        setBusy(false)
        onBusyChange(false)
      }
    }
  }

  return (
    <section aria-labelledby="admin-gallery-label" className="border-t border-esi-border pt-5">
      <h3 id="admin-gallery-label" className="text-base font-semibold text-esi-navy">
        {t('admin.gallery')} <span className="font-normal text-esi-muted">({images.length})</span>
      </h3>
      <p id="admin-gallery-help" className="mt-2 text-sm text-esi-muted">
        {t('admin.galleryHelp')}
      </p>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        aria-labelledby="admin-gallery-label"
        aria-describedby="admin-gallery-help"
        onChange={upload}
        disabled={busy || disabled}
        className="sr-only"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy || disabled}
        aria-describedby="admin-gallery-help"
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-sm bg-esi-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-esi-secondary disabled:cursor-wait disabled:opacity-60"
      >
        <ImagePlus size={18} aria-hidden />
        {t(busy ? 'admin.uploading' : 'admin.addGalleryImages')}
      </button>
      <p className="mt-2 text-xs text-esi-muted">{t('admin.galleryUploadHelp')}</p>
      <p role="status" aria-live="polite" className="mt-2 text-sm text-esi-blue">
        {error && t(`admin.${error}`)}
      </p>
      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((src, index) => (
            <li
              key={`${index}-${src.slice(0, 80)}`}
              className="overflow-hidden rounded-sm border border-esi-border bg-white"
            >
              <img
                src={src}
                alt={`${t('admin.galleryImage')} ${index + 1}`}
                width="480"
                height="320"
                loading="lazy"
                className="aspect-[3/2] w-full object-cover"
              />
              <button
                type="button"
                disabled={busy || disabled}
                onClick={() => {
                  setError('')
                  onChange(images.filter((_, i) => i !== index))
                }}
                className="flex min-h-11 w-full items-center justify-center gap-2 border-t border-esi-border px-2 py-2 text-sm font-semibold text-esi-blue transition-colors hover:bg-esi-light disabled:opacity-50"
                aria-label={`${t('admin.removeGalleryImage')} ${index + 1}`}
              >
                <Trash2 size={15} aria-hidden />
                {t('admin.removeGalleryImage')} {index + 1}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
