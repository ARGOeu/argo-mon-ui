import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/16/solid'
import Button from '@/components/Button'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string | React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  typeToConfirm?: string
  confirmSuffix?: string
  closeOnClickOutside?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  typeToConfirm,
  confirmSuffix = 'to confirm:',
  closeOnClickOutside = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [typedValue, setTypedValue] = useState('')

  useEffect(() => {
    if (!isOpen) setTypedValue('')
  }, [isOpen])

  if (!isOpen) return null

  const isConfirmDisabled =
    typeToConfirm !== undefined && typedValue !== typeToConfirm

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={closeOnClickOutside ? onCancel : undefined}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-[30rem] w-full overflow-hidden mb-32"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
          <h3 className="text-xl font-semibold text-foreground m-0">{title}</h3>
          <button
            className="p-1 rounded-full text-muted bg-transparent border-none cursor-pointer transition-colors hover:bg-surface-strong hover:text-foreground"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <XMarkIcon className="size-6" />
          </button>
        </div>

        <div className="px-5 py-3">
          {typeof message === 'string' ? (
            <p className="text-base text-muted leading-relaxed overflow-hidden text-ellipsis">
              {message}
            </p>
          ) : (
            <div className="text-base text-muted leading-relaxed overflow-hidden text-ellipsis">
              {message}
            </div>
          )}

          {typeToConfirm && (
            <div className="mt-3">
              <p className="text-sm text-muted mb-1.5">
                Type <strong>{typeToConfirm}</strong> {confirmSuffix}
              </p>
              <input
                type="text"
                value={typedValue}
                onChange={(e) => setTypedValue(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-6 px-5 py-3 mt-2 bg-surface-muted border-t border-line">
          <Button onClick={onCancel} size="sm" variant="outline-secondary">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            size="sm"
            variant="primary"
            disabled={isConfirmDisabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
