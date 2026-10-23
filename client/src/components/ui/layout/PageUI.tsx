import type { ReactNode } from 'react'
import { AlertCircle, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../actions/Button'
import { Card } from '../data-display/Card'
import { cn } from '@/utils'

export function Page({ children, className }: Readonly<{ children: ReactNode; className?: string }>) {
  return <div className={cn('mx-auto w-full max-w-[1280px] space-y-6', className)}>{children}</div>
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: Readonly<{
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}>) {
  return (
    <div className="flex flex-col gap-4 border-b border-line-section pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <div className="rogym-eyebrow mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-bold text-fg-primary md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-fg-secondary">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}

export function PageSkeleton({ rows = 3 }: Readonly<{ rows?: number }>) {
  const { t } = useTranslation('common')
  return (
    <div className="space-y-3" aria-label={t('loading')}>
      {Array.from({ length: rows }, (_, idx) => `page-skel-row-${idx + 1}`).map((rowKey) => (
        <div
          key={rowKey}
          className="h-20 animate-pulse rounded-2xl border border-line-subtle bg-surface-card"
        />
      ))}
    </div>
  )
}

export function PageEmptyState({
  title,
  description,
  action,
}: Readonly<{
  title: string
  description?: string
  action?: ReactNode
}>) {
  return (
    <Card variant="compact" className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface-sunken text-fg-dim">
        <Search size={20} />
      </div>
      <h2 className="text-base font-semibold text-fg-primary">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-sm text-fg-secondary">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  )
}

export function PageErrorState({
  message,
  onRetry,
  retryLabel,
}: Readonly<{
  message: string
  onRetry?: () => void
  retryLabel?: string
}>) {
  const { t } = useTranslation('common')
  const effectiveRetryLabel = retryLabel ?? t('button.retry')
  return (
    <Card variant="compact" className="flex flex-col items-start gap-4 border-status-danger-border bg-status-danger-bg p-5 sm:flex-row sm:items-center">
      <AlertCircle className="shrink-0 text-status-danger-fg" size={22} />
      <div className="min-w-0 flex-1 text-sm text-status-danger-fg">{message}</div>
      {onRetry && (
        <Button
          variant="outline-white"
          size="compact"
          className="w-full sm:w-auto"
          onClick={onRetry}
        >
          {effectiveRetryLabel}
        </Button>
      )}
    </Card>
  )
}
