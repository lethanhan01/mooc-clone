import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils'
import type { Tone } from '@/lib/variants'
import { type CardAspectRatio, ASPECT_CLASSES } from './card-utils'

export type { CardAspectRatio }

/* ── Card Media ──────────────────────────────────────────────── */

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  aspectRatio?: CardAspectRatio
  overlay?: boolean | 'dark' | 'gradient'
  badge?: ReactNode
  action?: ReactNode
  zoomOnHover?: boolean
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
  imageClassName?: string
}

const OBJECT_FIT_CLASSES: Record<'cover' | 'contain' | 'fill' | 'scale-down' | 'none', string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  'scale-down': 'object-scale-down',
  none: 'object-none',
}

function renderCardMediaOverlay(overlay?: boolean | 'dark' | 'gradient') {
  if (overlay === true || overlay === 'dark') {
    return <div className="absolute inset-0 bg-surface-overlay/70" />
  }
  if (overlay === 'gradient') {
    return (
      <div className="absolute inset-0 bg-gradient-to-t from-surface-base/80 via-surface-base/20 to-transparent" />
    )
  }
  return null
}

export function CardMedia({
  src,
  alt = '',
  aspectRatio = '6/4',
  overlay = false,
  badge,
  action,
  zoomOnHover = true,
  objectFit = 'cover',
  imageClassName,
  className,
  children,
  ...props
}: Readonly<CardMediaProps>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-sunken border-b border-line-subtle',
        ASPECT_CLASSES[aspectRatio],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            'h-full w-full',
            OBJECT_FIT_CLASSES[objectFit],
            zoomOnHover && 'transition-transform duration-300 group-hover:scale-105',
            imageClassName
          )}
        />
      ) : (
        children
      )}

      {renderCardMediaOverlay(overlay)}

      {badge && <div className="absolute left-3 top-3 z-10">{badge}</div>}
      {action && <div className="absolute right-3 top-3 z-10">{action}</div>}
    </div>
  )
}

/* ── Card Ribbon ─────────────────────────────────────────────── */

export interface CardRibbonProps extends HTMLAttributes<HTMLSpanElement> {
  position?: 'top-left' | 'top-right'
  tone?: Tone
}

const RIBBON_TONE_CLASSES: Record<Tone, string> = {
  accent: 'bg-action-accent text-fg-on-solid font-bold',
  success: 'bg-status-success-solid text-fg-on-solid font-bold',
  warning: 'bg-status-warning-solid text-fg-on-solid font-bold',
  danger: 'bg-status-danger-solid text-fg-on-solid font-bold',
  info: 'bg-status-info-solid text-fg-on-solid font-bold',
  neutral: 'bg-surface-elevated text-fg-primary font-bold',
}

export function CardRibbon({
  position = 'top-right',
  tone = 'accent',
  className,
  children,
  ...props
}: Readonly<CardRibbonProps>) {
  return (
    <span
      className={cn(
        'absolute z-20 px-3 py-0.5 text-[11px] uppercase tracking-wider shadow-md',
        position === 'top-right'
          ? 'right-0 top-0 rounded-bl-xl'
          : 'left-0 top-0 rounded-br-xl',
        RIBBON_TONE_CLASSES[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/* ── Card Skeleton ───────────────────────────────────────────── */

export interface CardSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  hasMedia?: boolean
  mediaAspect?: CardAspectRatio
  lines?: number
  hasHeader?: boolean
  hasFooter?: boolean
}

export function CardSkeleton({
  hasMedia = false,
  mediaAspect = '6/4',
  lines = 3,
  hasHeader = true,
  hasFooter = false,
  className,
  ...props
}: Readonly<CardSkeletonProps>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line-subtle bg-surface-card overflow-hidden animate-pulse',
        className
      )}
      aria-busy="true"
      {...props}
    >
      {hasMedia && (
        <div className={cn('w-full bg-surface-card-hover', ASPECT_CLASSES[mediaAspect])} />
      )}
      <div className="p-5 space-y-4">
        {hasHeader && (
          <div className="space-y-2">
            <div className="h-5 w-2/3 rounded-lg bg-surface-card-hover" />
            <div className="h-3.5 w-1/3 rounded-sm bg-surface-card" />
          </div>
        )}
        <div className="space-y-2 pt-2">
          {Array.from({ length: lines }, (_, idx) => `card-skel-line-${idx + 1}`).map((lineKey, i) => (
            <div
              key={lineKey}
              className={cn(
                'h-3.5 rounded-sm bg-surface-card',
                i === lines - 1 ? 'w-4/5' : 'w-full'
              )}
            />
          ))}
        </div>
        {hasFooter && (
          <div className="flex justify-end gap-2 pt-4 border-t border-line-subtle">
            <div className="h-8 w-20 rounded-lg bg-surface-card-hover" />
          </div>
        )}
      </div>
    </div>
  )
}
