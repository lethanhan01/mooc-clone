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
        className={cn('p-5 flex flex-col justify-between', className)}
        {...props}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-colors shrink-0',
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
            <div className="text-2xl font-bold text-fg-primary tracking-tight">
              {value}
            </div>
            <div className="mt-1 text-sm font-medium text-fg-secondary">
              {label}
            </div>
            {hint && (
              <div className="mt-2 text-xs text-fg-dim leading-relaxed">
                {hint}
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }
)
StatCard.displayName = 'StatCard'
