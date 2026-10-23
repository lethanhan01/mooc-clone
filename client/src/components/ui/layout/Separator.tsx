import * as React from 'react'
import { Separator as RadixSeparator } from 'radix-ui'
import { cn } from '@/utils'

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof RadixSeparator.Root> {
  label?: React.ReactNode
}

export const Separator = React.forwardRef<
  React.ElementRef<typeof RadixSeparator.Root>,
  SeparatorProps
>(
  (
    { className, orientation = 'horizontal', decorative = true, label, ...props },
    ref
  ) => {
    if (label && orientation === 'horizontal') {
      return (
        <div className={cn('relative flex w-full items-center my-4', className)}>
          <div className="flex-grow border-t border-line-subtle" />
          <span className="mx-3 flex-shrink text-xs font-medium uppercase tracking-wider text-fg-dim select-none">
            {label}
          </span>
          <div className="flex-grow border-t border-line-subtle" />
        </div>
      )
    }

    return (
      <RadixSeparator.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          'shrink-0 bg-line-subtle',
          orientation === 'horizontal' ? 'h-[1px] w-full my-3' : 'h-full w-[1px] mx-3',
          className
        )}
        {...props}
      />
    )
  }
)
Separator.displayName = RadixSeparator.Root.displayName
