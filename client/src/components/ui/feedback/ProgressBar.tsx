import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils'
import type { Tone } from '@/lib/variants'
import {
  progressBarTrackVariants,
  progressBarIndicatorVariants,
  type ProgressBarTone,
  type ProgressBarSize,
  type ProgressBarVariantProps,
} from './progress-bar-utils'

export type { ProgressBarTone, ProgressBarSize, ProgressBarVariantProps }

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  tone?: Tone
  size?: ProgressBarSize
  label?: ReactNode
  hint?: ReactNode
  showValue?: boolean
  valueFormatter?: (value: number, percentage: number) => ReactNode
  animated?: boolean
  striped?: boolean
  className?: string
  trackClassName?: string
  barClassName?: string
  'aria-label'?: string
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      tone = 'accent',
      size = 'md',
      label,
      hint,
      showValue = false,
      valueFormatter,
      animated = false,
      striped = false,
      className,
      trackClassName,
      barClassName,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const autoId = useId()
    const clampedValue = Math.min(Math.max(0, value), max)
    const percentage = max > 0 ? Math.round((clampedValue / max) * 100) : 0

    const formattedValue = valueFormatter
      ? valueFormatter(clampedValue, percentage)
      : `${percentage}%`

    const hasHeader = label || hint || showValue

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {hasHeader && (
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
            {label ? (
              <span id={`${autoId}-label`} className="font-medium text-fg-primary">
                {label}
              </span>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              {hint && (
                <span className="text-fg-dim">{hint}</span>
              )}
              {showValue && (
                <span className="font-semibold text-fg-primary font-mono">{formattedValue}</span>
              )}
            </div>
          </div>
        )}

        <div
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={ariaLabel}
          aria-labelledby={label ? `${autoId}-label` : undefined}
          className={cn(
            progressBarTrackVariants({ size }),
            trackClassName
          )}
        >
          <div
            style={{ width: `${percentage}%` }}
            className={cn(
              progressBarIndicatorVariants({ tone }),
              animated && 'animate-pulse',
              striped &&
                'bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]',
              barClassName
            )}
          />
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = 'ProgressBar'
