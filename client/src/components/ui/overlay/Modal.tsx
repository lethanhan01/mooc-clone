import { X } from 'lucide-react'
import { type ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../actions/Button'
import { cn } from '@/utils'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-5xl',
}

export interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className = '' }: Readonly<ModalFooterProps>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2.5 sm:gap-3 [&>button]:flex-1 sm:[&>button]:flex-initial',
        className
      )}
    >
      {children}
    </div>
  )
}

export interface ModalProps {
  open: boolean
  title: ReactNode
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
  headerActions?: ReactNode
  size?: ModalSize
  showCloseButton?: boolean
  bodyClassName?: string
  contentClassName?: string
  description?: ReactNode
  closeOnOutsideClick?: boolean
}

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  headerActions,
  size = 'xl',
  showCloseButton = true,
  bodyClassName,
  contentClassName,
  description,
  closeOnOutsideClick = false,
}: Readonly<ModalProps>) {
  const { t } = useTranslation('common')

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <dialog
      open
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      className="fixed inset-0 z-modal flex items-center justify-center bg-surface-overlay/80 backdrop-blur-[2px] p-3 sm:p-4 animate-in fade-in duration-200 border-none m-0 max-w-none max-h-none w-full h-full"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      onClick={(e) => {
        if (closeOnOutsideClick && e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className={cn(
          `max-h-[92vh] w-[calc(100vw-24px)] sm:w-full ${SIZE_CLASS[size]} overflow-y-auto rounded-2xl border border-line-accent-subtle bg-surface-card shadow-glass outline-hidden animate-in zoom-in-95 duration-200`,
          contentClassName
        )}
      >
        <div className="flex items-center justify-between border-b border-line-subtle px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="min-w-0 pr-3">
            <h2 id="modal-title" className="text-base sm:text-lg font-bold text-fg-primary truncate">
              {title}
            </h2>
            {description && (
              typeof description === 'string' ? (
                <p className="mt-0.5 text-xs text-fg-dim line-clamp-2">{description}</p>
              ) : (
                <div className="mt-0.5 text-xs text-fg-dim line-clamp-2">{description}</div>
              )
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {headerActions}
            {showCloseButton && (
              <Button
                variant="icon"
                size="sm"
                onClick={onClose}
                aria-label={t('button.close')}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
        <div className={bodyClassName ?? 'p-4 sm:p-6'}>{children}</div>
        {footer && (
          <div className="border-t border-line-subtle px-4 sm:px-6 py-3.5 sm:py-4">
            <ModalFooter>{footer}</ModalFooter>
          </div>
        )}
      </div>
    </dialog>
  )
}

