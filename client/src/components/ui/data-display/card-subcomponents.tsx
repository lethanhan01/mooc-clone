import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils'

export type {
  CardAspectRatio,
  CardMediaProps,
  CardRibbonProps,
  CardSkeletonProps,
} from './card-addons'
export {
  CardMedia,
  CardRibbon,
  CardSkeleton,
} from './card-addons'

/* ── Card Header ─────────────────────────────────────────────── */

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  responsive?: boolean
}

function getHeaderLayoutClasses(responsive: boolean, hasActions: boolean): string {
  if (responsive) {
    return 'flex-col sm:flex-row sm:items-start sm:justify-between'
  }
  return hasActions ? 'flex-row items-start justify-between' : 'flex-col'
}

export function CardHeader({
  eyebrow,
  icon,
  actions,
  responsive = true,
  className,
  children,
  ...props
}: Readonly<CardHeaderProps>) {
  return (
    <div
      className={cn(
        'flex gap-3',
        getHeaderLayoutClasses(responsive, Boolean(actions)),
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-action-accent/15 text-action-accent"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <div className="space-y-1 min-w-0 flex-1">
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-wider text-action-accent">
              {eyebrow}
            </div>
          )}
          {children}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  )
}

/* ── Card Title ──────────────────────────────────────────────── */

export type CardTitleSize = 'sm' | 'md' | 'lg' | 'xl'
export type CardHeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p'

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: CardHeadingTag
  size?: CardTitleSize
  truncate?: boolean
  lineClamp?: 1 | 2 | 3
}

const TITLE_SIZES: Record<CardTitleSize, string> = {
  sm: 'text-sm font-semibold',
  md: 'text-base sm:text-lg font-bold',
  lg: 'text-lg sm:text-xl font-bold',
  xl: 'text-xl sm:text-2xl font-extrabold',
}

export function CardTitle({
  as: Comp = 'h3',
  size = 'md',
  truncate = false,
  lineClamp,
  className,
  children,
  ...props
}: Readonly<CardTitleProps>) {
  return (
    <Comp
      className={cn(
        'tracking-tight text-fg-primary',
        TITLE_SIZES[size],
        truncate && 'truncate',
        lineClamp === 1 && 'line-clamp-1',
        lineClamp === 2 && 'line-clamp-2',
        lineClamp === 3 && 'line-clamp-3',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}

/* ── Card Description ────────────────────────────────────────── */

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  lineClamp?: 1 | 2 | 3
}

export function CardDescription({
  lineClamp,
  className,
  children,
  ...props
}: Readonly<CardDescriptionProps>) {
  return (
    <p
      className={cn(
        'text-sm leading-relaxed text-fg-secondary',
        lineClamp === 1 && 'line-clamp-1',
        lineClamp === 2 && 'line-clamp-2',
        lineClamp === 3 && 'line-clamp-3',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

/* ── Card Content ────────────────────────────────────────────── */

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  noPaddingTop?: boolean
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const SPACING_CLASSES = {
  none: '',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
}

export function CardContent({
  noPaddingTop = false,
  spacing = 'none',
  className,
  children,
  ...props
}: Readonly<CardContentProps>) {
  return (
    <div
      className={cn(
        !noPaddingTop && 'pt-4',
        SPACING_CLASSES[spacing],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── Card Footer ─────────────────────────────────────────────── */

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between'
  bordered?: boolean
  responsiveStack?: boolean
}

const ALIGN_CLASSES = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
}

export function CardFooter({
  align = 'end',
  bordered = true,
  responsiveStack = false,
  className,
  children,
  ...props
}: Readonly<CardFooterProps>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 pt-4',
        ALIGN_CLASSES[align],
        bordered && 'border-t border-line-subtle',
        responsiveStack && 'flex-col sm:flex-row',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
