import { XMarkIcon } from '@heroicons/react/16/solid'
import Button from '@/components/Button'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string | React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onCancel}
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
        </div>

        <div className="flex justify-between gap-6 px-5 py-3 mt-2 bg-surface-muted border-t border-line">
          <Button onClick={onCancel} size="sm" variant="outline-secondary">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} size="sm" variant="primary">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
