import { type ReactNode, forwardRef, type HTMLAttributes } from 'react'
import { Inbox } from 'lucide-react'
import { Button } from '../actions/Button'
import { cn } from '@/utils'

export type EmptyStateSize = 'sm' | 'md' | 'lg'

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode
  title?: ReactNode
  description?: ReactNode
  actionLabel?: string
  onAction?: () => void
  action?: ReactNode
  size?: EmptyStateSize
  bordered?: boolean
}

const sizeConfig: Record<
  EmptyStateSize,
  {
    container: string
    iconWrapper: string
    iconSize: number
    title: string
    description: string
    spacing: string
  }
> = {
  sm: {
    container: 'py-6 px-4',
    iconWrapper: 'h-8 w-8 rounded-lg',
    iconSize: 16,
    title: 'text-xs font-semibold',
    description: 'text-[11px]',
    spacing: 'gap-1.5',
  },
  md: {
    container: 'py-10 px-6',
    iconWrapper: 'h-12 w-12 rounded-xl',
    iconSize: 22,
    title: 'text-sm font-semibold',
    description: 'text-xs',
    spacing: 'gap-2',
  },
  lg: {
    container: 'py-16 px-8',
    iconWrapper: 'h-16 w-16 rounded-2xl',
    iconSize: 30,
    title: 'text-base font-bold',
    description: 'text-sm',
    spacing: 'gap-3',
  },
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title = 'Không có dữ liệu',
      description,
      actionLabel,
      onAction,
      action,
      size = 'md',
      bordered = false,
      className,
      ...props
    },
    ref
  ) => {
    const config = sizeConfig[size]

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          config.container,
          config.spacing,
          bordered &&
            'rounded-2xl border border-dashed border-line-subtle bg-surface-sunken',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'flex items-center justify-center bg-surface-sunken text-fg-dim',
            config.iconWrapper
          )}
        >
          {icon ?? <Inbox size={config.iconSize} />}
        </div>

        <div className="max-w-sm space-y-1">
          {title && <h4 className={cn('text-fg-primary', config.title)}>{title}</h4>}
          {description && (
            <p className={cn('text-fg-dim leading-relaxed', config.description)}>
              {description}
            </p>
          )}
        </div>

        {(action || (actionLabel && onAction)) && (
          <div className="mt-2">
            {action ?? (
              <Button
                variant="outline-white"
                size={size === 'sm' ? 'xs' : 'sm'}
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = 'EmptyState'
