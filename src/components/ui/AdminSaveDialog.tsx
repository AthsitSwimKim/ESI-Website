import { useEffect, useRef } from 'react'
import { CircleCheck } from 'lucide-react'

import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useT } from '@/i18n'

export function AdminSaveDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()
  const dialogRef = useRef<HTMLDialogElement>(null)
  useLockBodyScroll(open)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="admin-save-title"
      aria-describedby="admin-save-description"
      onClose={onClose}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-[4px] border border-esi-border bg-white p-6 text-esi-text shadow-card backdrop:bg-esi-navy/65 sm:p-8"
    >
      <CircleCheck size={40} strokeWidth={1.5} className="mb-4 text-esi-blue" aria-hidden />
      <h2 id="admin-save-title" className="display-title text-2xl text-esi-blue">
        {t('admin.saveSuccess')}
      </h2>
      <span aria-hidden className="mt-3 block h-[3px] w-10 bg-esi-blue" />
      <p id="admin-save-description" className="mt-4 text-sm leading-relaxed text-esi-muted">
        {t('admin.saveSuccessHelp')}
      </p>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-esi-blue px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-esi-secondary"
        >
          {t('admin.ok')}
        </button>
      </div>
    </dialog>
  )
}
