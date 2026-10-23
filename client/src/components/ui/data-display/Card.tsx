import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils'
import type { Tone } from '@/lib/variants'
import {
  cardVariants,
  resolveTabIndex,
  type CardPadding,
  type CardSemanticTag,
  type CardVariant,
  type CardVariantProps,
} from './card-utils'

export type {
  CardVariant,
  CardPadding,
  CardSemanticTag,
  CardVariantProps,
}

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant
  padding?: CardPadding
  tone?: Tone
  as?: CardSemanticTag
  to?: string
  href?: string
  selected?: boolean
  disabled?: boolean
  loading?: boolean
  children?: ReactNode
}

export const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      tone,
      as = 'div',
      to,
      href,
      selected,
      disabled,
      loading,
      children,
      onClick,
      onKeyDown,
      tabIndex,
      role,
      ...props
    },
    ref
  ) => {
    const isClickable = Boolean(onClick || to || href || variant === 'interactive')
    const effectiveRole = role ?? (isClickable && as !== 'article' && as !== 'section' ? 'button' : undefined)
    const effectiveTabIndex = resolveTabIndex(disabled, tabIndex, isClickable)

    const baseClasses = cn(
      cardVariants({ variant, padding, tone }),
      selected && 'border-action-accent ring-1 ring-action-accent/30',
      disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
      loading && 'pointer-events-none',
      isClickable &&
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-action-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
      className
    )

    const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
      if (onKeyDown) {
        onKeyDown(e)
        return
      }
      if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onClick(e as unknown as React.MouseEvent<HTMLElement>)
      }
    }

    if (to && !disabled) {
      return (
        <Link
          to={to}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={baseClasses}
          aria-disabled={disabled}
          aria-busy={loading}
          {...(props as HTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </Link>
      )
    }

    if (href && !disabled) {
      return (
        <a
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={baseClasses}
          aria-disabled={disabled}
          aria-busy={loading}
          {...(props as HTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      )
    }

    const Component = as as ElementType

    return (
      <Component
        ref={ref}
        className={baseClasses}
        role={effectiveRole}
        tabIndex={effectiveTabIndex}
        onClick={disabled ? undefined : onClick}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled}
        aria-selected={selected}
        aria-busy={loading}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Card.displayName = 'Card'

export {
  CardHeader,
  CardTitle,
  CardDescription,
  CardMedia,
  CardContent,
  CardFooter,
  CardRibbon,
  CardSkeleton,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardMediaProps,
  type CardContentProps,
  type CardFooterProps,
  type CardRibbonProps,
  type CardSkeletonProps,
  type CardTitleSize,
  type CardHeadingTag,
  type CardAspectRatio,
} from './card-subcomponents'
