import type { AriaRole, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Tone } from '@/lib/variants'
import { Alert } from '@/components/ui/feedback'

export type NotificationTone = Tone

function defaultRole(tone: NotificationTone): AriaRole {
  return tone === 'danger' || tone === 'warning' ? 'alert' : 'status'
}

const NOTIFICATION_TOAST_TONE_CLASS: Record<string, string> = {
  success: 'border-status-success-border bg-status-success-surface text-fg-primary',
  danger: 'border-status-danger-border bg-status-danger-surface text-fg-primary',
  error: 'border-status-danger-border bg-status-danger-surface text-fg-primary',
  warning: 'border-status-warning-border bg-status-warning-surface text-fg-primary',
  info: 'border-status-info-border bg-status-info-surface text-fg-primary',
  accent: 'border-line-accent-subtle bg-action-accent-soft text-fg-primary',
  neutral: 'border-line-subtle bg-surface-elevated text-fg-primary',
}

export function NotificationToast({
  tone,
  message,
  icon,
  action,
  onClose,
  role,
}: Readonly<{
  tone: NotificationTone
  message: ReactNode
  icon?: ReactNode
  action?: ReactNode
  onClose?: () => void
  role?: AriaRole
}>) {
  const toneClass = NOTIFICATION_TOAST_TONE_CLASS[tone] ?? NOTIFICATION_TOAST_TONE_CLASS.success
  return (
    <div
      className={cn(
        'rogym-notification-toast grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2.5 rounded-lg border p-3 sm:px-4 shadow-glass text-sm font-semibold',
        toneClass
      )}
      data-tone={tone}
      role={role ?? defaultRole(tone)}
    >
      {icon && <span className="rogym-notification-toast__icon inline-flex shrink-0 items-center justify-center">{icon}</span>}
      <div className="rogym-notification-toast__message min-w-0 break-words">{message}</div>
      {action && <div className="rogym-notification-toast__action [grid-column:2]">{action}</div>}
      {onClose && (
        <button
          type="button"
          className="rogym-notification-toast__close inline-flex w-7 h-7 -mt-1.5 -mr-1.5 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-current cursor-pointer opacity-70 hover:opacity-100 hover:bg-surface-card-hover transition-opacity"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export function NotificationAlert({
  tone,
  message,
  title,
  action,
  role,
}: Readonly<{
  tone: NotificationTone
  message: ReactNode
  title?: ReactNode
  action?: ReactNode
  role?: AriaRole
}>) {
  return (
    <Alert
      tone={tone}
      role={role ?? defaultRole(tone)}
      className="rogym-notification-alert"
      data-tone={tone}
      action={action}
      title={title}
      description={message}
    />
  )
}

export function NotificationPanel({
  children,
  titleId,
  className,
}: Readonly<{
  children: ReactNode
  titleId?: string
  className?: string
}>) {
  return (
    <section
      className={cn(
        'rogym-notification-panel absolute z-50 top-12 right-0 flex w-[min(360px,calc(100vw-2rem))] max-h-[420px] flex-col overflow-hidden rounded-lg border border-line-subtle bg-surface-elevated shadow-glass max-md:fixed max-md:inset-x-3 max-md:top-16 max-md:bottom-[calc(var(--rogym-bottom-nav-height,64px)+env(safe-area-inset-bottom,0px)+12px)] max-md:w-auto max-md:max-h-none',
        className
      )}
      aria-labelledby={titleId}
    >
      {children}
    </section>
  )
}
