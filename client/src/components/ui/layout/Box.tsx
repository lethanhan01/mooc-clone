import { forwardRef, type ElementType } from 'react'
import { cn } from '@/utils'
import {
  boxVariants,
  type BoxProps,
  type BoxSemanticTag,
  type BoxVariantsProps,
} from './box-utils'

export type { BoxProps, BoxSemanticTag, BoxVariantsProps }

export const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      as = 'div',
      surface,
      padding,
      border,
      rounded,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Component = as as ElementType

    return (
      <Component
        ref={ref}
        className={cn(boxVariants({ surface, padding, border, rounded }), className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Box.displayName = 'Box'
