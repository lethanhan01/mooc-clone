import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils'
import type { Tone } from '@/lib/variants'
import { Card } from './Card'
import { Badge } from './Badge'

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode
  label: string
  value: ReactNode
  hint?: string
  tone?: Tone
  /** @deprecated Dùng prop `tone` thay thế */
  accent?: boolean
  trend?: {
    value: number | string
    isPositive?: boolean
    label?: string
  }
  loading?: boolean
  to?: string
}

const TONE_ICON_BG: Record<Tone, string> = {
  accent: 'bg-action-accent/15 text-action-accent',
  success: 'bg-status-success-bg text-status-success-fg',
  warning: 'bg-status-warning-bg text-status-warning-fg',
  danger: 'bg-status-danger-bg text-status-danger-fg',
  info: 'bg-status-info-bg text-status-info-fg',
  neutral: 'bg-surface-sunken text-fg-secondary',
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      icon,
      label,
      value,
      hint,
      tone,
      accent = true,
      trend,
      loading = false,
      to,
      className,
      ...props
    },
    ref
  ) => {
    const resolvedTone: Tone = tone ?? (accent ? 'accent' : 'neutral')

    return (
      <Card
        as="article"
        variant="compact"
        padding="none"
        to={to}
        ref={ref}
        className={cn('flex flex-col justify-between rounded-lg p-3 shadow-none', className)}
        {...props}
      >
        <div className="mb-2 flex items-center justify-between">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors',
              TONE_ICON_BG[resolvedTone]
            )}
            aria-hidden="true"
          >
            {icon}
          </div>

          {trend && !loading && (
            <Badge
              tone={trend.isPositive ? 'success' : 'danger'}
              size="xs"
              emphasis="subtle"
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse" aria-busy="true">
            <div className="h-8 w-24 rounded-lg bg-surface-card-hover" />
            <div className="h-4 w-32 rounded-sm bg-surface-sunken" />
          </div>
        ) : (
          <div>
            <div className="text-xl font-bold tracking-tight text-fg-primary">
              {value}
            </div>
            <div className="mt-0.5 text-xs font-medium text-fg-secondary">
              {label}
            </div>
            {hint ? (
              <div className="mt-1 text-[11px] leading-snug text-fg-dim">
                {hint}
              </div>
            ) : null}
          </div>
        )}
      </Card>
    )
  }
)
StatCard.displayName = 'StatCard'
