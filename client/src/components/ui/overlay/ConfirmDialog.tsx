import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Info } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from '../actions/Button'

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary' | 'warning'
  loading?: boolean
  icon?: ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'primary',
  loading = false,
  icon,
}: Readonly<ConfirmDialogProps>) {
  const { t } = useTranslation('common')
  const isDanger = variant === 'danger'
  const isWarning = variant === 'warning'

  const effectiveConfirmLabel = confirmLabel ?? (isDanger ? t('button.delete', 'Xác nhận') : t('button.confirm', 'Xác nhận'))
  const effectiveCancelLabel = cancelLabel ?? t('button.cancel', 'Hủy')

  const defaultIcon = isDanger ? (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger-fg">
      <AlertTriangle size={24} />
    </div>
  ) : isWarning ? (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-warning-bg text-status-warning-fg">
      <AlertTriangle size={24} />
    </div>
  ) : (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-action-accent-soft text-action-accent">
      <Info size={24} />
    </div>
  )

  return (
    <Modal
      open={open}
      title={title}
      size="sm"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {effectiveCancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            className={
              isWarning
                ? 'bg-status-warning-solid text-status-warning-on-solid hover:opacity-90 border-transparent shadow-xs'
                : undefined
            }
            loading={loading}
            onClick={onConfirm}
          >
            {effectiveConfirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        {icon ?? defaultIcon}
        <div className="space-y-1">
          <div className="text-sm leading-relaxed text-fg-secondary">{description}</div>
        </div>
      </div>
    </Modal>
  )
}
