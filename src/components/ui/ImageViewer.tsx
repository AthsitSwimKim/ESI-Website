import { X } from 'lucide-react'
import { useId, useRef, useState, type ReactNode } from 'react'

import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

interface ImageViewerProps {
  src: string
  caption: string
  width: number
  height: number
  label: string
  className?: string
  children: ReactNode
}

/** Native modal keeps image viewing on the current page, with focus trapping and Escape. */
export function ImageViewer({
  src,
  caption,
  width,
  height,
  label,
  className,
  children,
}: ImageViewerProps) {
  const { t } = useT()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const captionId = useId()
  const [open, setOpen] = useState(false)
  useLockBodyScroll(open)

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={label}
        className={cn('cursor-zoom-in text-left', className)}
        onClick={() => {
          dialogRef.current?.showModal()
          setOpen(true)
        }}
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={captionId}
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          // The close button is the viewer's only interactive control.
          if (event.key === 'Tab') {
            event.preventDefault()
            closeRef.current?.focus()
          }
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return
          const bounds = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          ) {
            event.currentTarget.close()
          }
        }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-[4px] border border-esi-border bg-white p-0 text-esi-text shadow-card backdrop:bg-esi-navy/85"
      >
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-esi-border px-4 py-2 sm:px-5">
            <p id={captionId} className="text-sm leading-relaxed font-medium text-esi-navy">
              {caption}
            </p>
            <button
              ref={closeRef}
              type="button"
              aria-label={t('a11y.closeImage')}
              className="flex size-11 shrink-0 items-center justify-center rounded-[4px] text-esi-blue transition-colors hover:bg-esi-light"
              onClick={() => dialogRef.current?.close()}
            >
              <X aria-hidden size={24} />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-5">
            {open && (
              <img
                src={src}
                alt={caption}
                width={width}
                height={height}
                className="block max-h-[calc(100dvh-10rem)] w-full object-contain"
              />
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
