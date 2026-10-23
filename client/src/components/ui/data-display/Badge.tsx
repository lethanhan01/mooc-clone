import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { cn } from '@/utils'
import type { Tone, Emphasis, Size } from '@/lib/variants'
import { getStatusTone, getStatusLabel, type StatusDomain } from '@/utils/status'
import {
  getBadgeClasses,
  type BadgeShapeVariant,
  TONE_DOT_CLASSES,
  BadgeContext,
  useBadgeContext,
} from './badge-utils'

export type BadgeTone = Tone
export type BadgeEmphasis = Emphasis
export type BadgeSize = Size
export type { BadgeShapeVariant, StatusDomain }

export interface BaseBadgeProps {
  tone?: Tone
  emphasis?: Emphasis
  size?: Size
  variant?: BadgeShapeVariant
  status?: string | null
  domain?: StatusDomain
  dot?: boolean
  pulse?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  truncate?: boolean
  interactive?: boolean
  children?: ReactNode
}

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    BaseBadgeProps {}

// ── Compound Sub-components ──────────────────────────────────────────────────

export interface BadgeDotProps extends HTMLAttributes<HTMLSpanElement> {
  pulse?: boolean
  tone?: Tone
}

export function BadgeDot({ pulse, tone, className, ...props }: Readonly<BadgeDotProps>) {
  const context = useBadgeContext()
  const effectiveTone = tone ?? context.tone
  const dotColorClass = TONE_DOT_CLASSES[effectiveTone] ?? TONE_DOT_CLASSES.neutral

  return (
    <span
      className={cn('relative inline-flex items-center justify-center shrink-0', className)}
      aria-hidden="true"
      {...props}
    >
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex h-2 w-2 rounded-full opacity-75 animate-ping',
            dotColorClass
          )}
        />
      )}
      <span
        className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dotColorClass)}
      />
    </span>
  )
}
BadgeDot.displayName = 'Badge.Dot'

export interface BadgeIconProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode
}

export function BadgeIcon({ className, children, ...props }: Readonly<BadgeIconProps>) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      aria-hidden="true"
      {...props}
    >
      {children}
    </span>
  )
}
BadgeIcon.displayName = 'Badge.Icon'

export interface BadgeTextProps extends HTMLAttributes<HTMLSpanElement> {
  truncate?: boolean
  children?: ReactNode
}

export function BadgeText({ truncate, className, children, ...props }: Readonly<BadgeTextProps>) {
  return (
    <span className={cn(truncate && 'truncate', className)} {...props}>
      {children}
    </span>
  )
}
BadgeText.displayName = 'Badge.Text'

// ── Main Badge Component ─────────────────────────────────────────────────────

const BadgeRoot = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      tone,
      emphasis = 'subtle',
      size = 'md',
      variant = 'pill',
      status,
      domain = 'general',
      dot,
      pulse,
      leftIcon,
      rightIcon,
      truncate,
      interactive,
      className,
      children,
      onClick,
      onKeyDown,
      role,
      tabIndex,
      ...props
    },
    ref
  ) => {
    // 1. Phân giải Tone ngữ nghĩa (nếu không truyền tone, dùng tone suy luận từ status)
    const effectiveTone: Tone =
      tone ?? (status ? getStatusTone(status, domain) : 'neutral')

    // 2. Phân giải Nội dung hiển thị (ưu tiên: children > label dịch tự động từ status)
    const effectiveContent =
      children !== undefined
        ? children
        : status
        ? getStatusLabel(status, domain)
        : null

    // 3. Tự động kích hoạt hiệu ứng pulse cho trạng thái đang diễn ra nếu không set rõ ràng
    const effectivePulse =
      pulse ?? (status === 'in_progress' || status === 'realtime')

    // 4. Trợ năng APG W3C:
    // - Khi có status: gán role="status" cho Screen Readers
    // - Khi interactive: gán role="button", tabIndex=0, xử lý Enter/Space
    const isStatusMode = Boolean(status)
    const effectiveRole = role ?? (interactive ? 'button' : isStatusMode ? 'status' : undefined)
    const effectiveTabIndex = interactive ? (tabIndex ?? 0) : tabIndex

    const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
      if (interactive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onClick?.(e as unknown as React.MouseEvent<HTMLSpanElement>)
      }
      onKeyDown?.(e)
    }

    const contextValue = {
      tone: effectiveTone,
      emphasis,
      size,
      variant,
    }

    return (
      <BadgeContext.Provider value={contextValue}>
        <span
          ref={ref}
          role={effectiveRole}
          tabIndex={effectiveTabIndex}
          className={getBadgeClasses({
            tone: effectiveTone,
            emphasis,
            size,
            variant,
            truncate,
            interactive,
            className,
          })}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {dot && <BadgeDot pulse={effectivePulse} tone={effectiveTone} />}
          {leftIcon && <BadgeIcon>{leftIcon}</BadgeIcon>}
          {effectiveContent !== null && (
            <BadgeText truncate={truncate}>{effectiveContent}</BadgeText>
          )}
          {rightIcon && <BadgeIcon>{rightIcon}</BadgeIcon>}
        </span>
      </BadgeContext.Provider>
    )
  }
)
BadgeRoot.displayName = 'Badge'

export const Badge = Object.assign(BadgeRoot, {
  Dot: BadgeDot,
  Icon: BadgeIcon,
  Text: BadgeText,
})

export type { BadgeVariantProps } from './badge-utils'
