import { type ReactNode } from 'react'
import { cn } from '@/utils'
import {
  switchTrackVariants,
  switchThumbVariants,
  resolveThumbTranslate,
  useSwitchContext,
} from './switch-utils'

export const SwitchThumb = ({
  className,
}: Readonly<{ className?: string }>) => {
  const context = useSwitchContext()
  const isChecked = Boolean(context?.checked)
  const size = context?.size ?? 'md'
  const isLoading = Boolean(context?.loading)

  return (
    <div
      className={cn(
        switchThumbVariants({ size, checked: isChecked }),
        resolveThumbTranslate(size, isChecked),
        className
      )}
    >
      {isLoading ? (
        <span className="h-2.5 w-2.5 animate-spin rounded-full border border-current border-t-transparent text-action-primary" />
      ) : null}
    </div>
  )
}
SwitchThumb.displayName = 'Switch.Thumb'

export const SwitchControl = ({
  className,
  children,
}: Readonly<{ className?: string; children?: ReactNode }>) => {
  const context = useSwitchContext()
  const isChecked = Boolean(context?.checked)
  const size = context?.size ?? 'md'

  return (
    <div
      className={cn(
        'relative',
        switchTrackVariants({
          size,
          checked: isChecked,
          disabled: context?.disabled,
        }),
        'after:content-[""] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden',
        className
      )}
      aria-hidden="true"
    >
      {children ?? <SwitchThumb />}
    </div>
  )
}
SwitchControl.displayName = 'Switch.Control'

export const SwitchLabel = ({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) => (
  <span
    className={cn(
      'text-sm font-medium text-fg-primary group-hover:text-fg-secondary transition-colors',
      className
    )}
  >
    {children}
  </span>
)
SwitchLabel.displayName = 'Switch.Label'

export const SwitchDescription = ({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) => (
  <span className={cn('text-xs text-fg-dim mt-0.5', className)}>
    {children}
  </span>
)
SwitchDescription.displayName = 'Switch.Description'
