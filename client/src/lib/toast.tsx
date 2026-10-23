import React from 'react'
import { toast as sonnerToast, type ExternalToast } from 'sonner'
import { NotificationToast, type NotificationTone } from '@/components/shared/notification/NotificationUI'
import { Button } from '@/components/ui/actions'
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'

function getIcon(tone: NotificationTone) {
  switch (tone) {
    case 'success':
      return <CheckCircle2 size={16} />
    case 'danger':
      return <AlertCircle size={16} />
    case 'warning':
      return <AlertTriangle size={16} />
    case 'info':
      return <Info size={16} />
    default:
      return null
  }
}

type ToastOptions = ExternalToast & {
  action?: {
    label: string
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  }
}

const DEDUPE_WINDOW_MS = 1500
const recentToasts = new Map<string, number>()

function getDedupeKey(message: React.ReactNode, tone: NotificationTone, options?: ToastOptions): string {
  if (options?.id !== undefined) {
    return String(options.id)
  }
  if (typeof message === 'string' || typeof message === 'number') {
    return `${tone}:${message}`
  }
  return `${tone}:${String(message)}`
}

function shouldDedupe(key: string): boolean {
  const now = Date.now()
  const lastTime = recentToasts.get(key)
  if (lastTime && now - lastTime < DEDUPE_WINDOW_MS) {
    return true
  }
  recentToasts.set(key, now)
  if (recentToasts.size > 50) {
    for (const [k, time] of recentToasts.entries()) {
      if (now - time > DEDUPE_WINDOW_MS * 2) {
        recentToasts.delete(k)
      }
    }
  }
  return false
}

function customToast(message: React.ReactNode, tone: NotificationTone, options?: ToastOptions) {
  const dedupeKey = getDedupeKey(message, tone, options)
  if (options?.id === undefined && shouldDedupe(dedupeKey)) {
    return dedupeKey
  }

  const className = ['rogym-sonner-toast', options?.className].filter(Boolean).join(' ')

  return sonnerToast.custom(
    (t) => (
      <NotificationToast
        tone={tone}
        message={message}
        icon={options?.icon || getIcon(tone)}
        action={
          options?.action ? (
            <Button
              variant="link"
              tone="accent"
              size="sm"
              onClick={(e) => {
                if (options.action?.onClick) {
                  options.action.onClick(e)
                }
                sonnerToast.dismiss(t)
              }}
              className="rogym-text-link rogym-text-link--accent text-sm font-semibold h-auto p-0"
            >
              {options.action.label}
            </Button>
          ) : undefined
        }
        onClose={() => {
          if (options?.onDismiss) {
            const onDismissFn = options.onDismiss as unknown as (id: string | number) => void
            onDismissFn(t)
          }
          sonnerToast.dismiss(t)
        }}
      />
    ),
    { ...options, className }
  )
}

const toastFn = (message: string | React.ReactNode, options?: ToastOptions) => customToast(message, 'info', options)

export const toast = Object.assign(toastFn, {
  success: (message: string | React.ReactNode, options?: ToastOptions) => customToast(message, 'success', options),
  error: (message: string | React.ReactNode, options?: ToastOptions) => customToast(message, 'danger', options),
  danger: (message: string | React.ReactNode, options?: ToastOptions) => customToast(message, 'danger', options),
  warning: (message: string | React.ReactNode, options?: ToastOptions) => customToast(message, 'warning', options),
  info: (message: string | React.ReactNode, options?: ToastOptions) => customToast(message, 'info', options),
  loading: (message: string | React.ReactNode, options?: ToastOptions) => sonnerToast.loading(message, options),
  dismiss: sonnerToast.dismiss,
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
})

