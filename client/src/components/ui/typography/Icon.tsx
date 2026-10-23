import * as React from 'react'
import type { LucideIcon, LucideProps } from 'lucide-react'
import type { Tone, FgRole, Size } from '@/lib/variants'

export type IconSize = Size
export type IconTone = Tone

export interface IconProps extends Omit<LucideProps, 'size'> {
  icon: LucideIcon
  size?: Size | number
  fg?: FgRole
  tone?: Tone
  label?: string
}

const SIZE_MAP: Record<Size, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

const FG_CLASSES: Record<FgRole, string> = {
  primary: 'text-fg-primary',
  secondary: 'text-fg-secondary',
  muted: 'text-fg-muted',
  dim: 'text-fg-subtle',
  faint: 'text-fg-disabled',
  inherit: '',
}

const TONE_CLASSES: Record<Tone, string> = {
  accent: 'text-action-accent',
  success: 'text-status-success-fg',
  warning: 'text-status-warning-fg',
  danger: 'text-status-danger-fg',
  info: 'text-status-info-fg',
  neutral: 'text-fg-muted',
}

/**
 * UI Primitive Icon — Type-safe, Tree-shakeable Lucide Icon wrapper tuân thủ Design Tokens RoGym.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      icon: Component,
      size = 'md',
      fg = 'inherit',
      tone,
      label,
      className = '',
      ...rest
    },
    ref
  ) => {
    const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size]
    // Tone có độ ưu tiên cao hơn fg khi được truyền trực tiếp
    const colorClass = tone ? TONE_CLASSES[tone] : FG_CLASSES[fg]
    const combinedClassName = `${colorClass} ${className}`.trim()

    return (
      <Component
        ref={ref}
        size={pixelSize}
        className={combinedClassName}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : 'true'}
        {...rest}
      />
    )
  }
)

Icon.displayName = 'Icon'
