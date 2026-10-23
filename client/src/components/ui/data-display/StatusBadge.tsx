import { forwardRef } from 'react'
import type { Tone, Emphasis, Size } from '@/lib/variants'
import type { StatusDomain } from '@/utils/status'
import { Badge, type BadgeProps } from './Badge'

export interface StatusBadgeProps extends Omit<BadgeProps, 'tone' | 'children'> {
  status?: string | null
  domain?: StatusDomain
  tone?: Tone
  emphasis?: Emphasis
  label?: string
  size?: Size
  dot?: boolean
  pulse?: boolean
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      status,
      domain = 'general',
      tone,
      emphasis,
      label,
      size = 'md',
      dot,
      pulse,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Badge
        ref={ref}
        status={status}
        domain={domain}
        tone={tone}
        emphasis={emphasis}
        size={size}
        dot={dot}
        pulse={pulse}
        className={className}
        {...props}
      >
        {label}
      </Badge>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'
