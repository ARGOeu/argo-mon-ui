import { XMarkIcon } from '@heroicons/react/16/solid'
import Button from './Button'
import styles from './ConfirmDialog.module.css'

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
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button
            className={styles['close-button']}
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <XMarkIcon className={styles['close-icon']} />
          </button>
        </div>

        <div className={styles.content}>
          {typeof message === 'string' ? (
            <p className={styles.message}>{message}</p>
          ) : (
            <div className={styles.message}>{message}</div>
          )}
        </div>

        <div className={styles.actions}>
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
