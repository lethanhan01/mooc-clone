import { forwardRef, type ElementType } from 'react'
import { cn } from '@/utils'
import {
  textVariants,
  clampMap,
  type TextProps,
  type TextSemanticTag,
  type TextVariantsProps,
} from './text-utils'

export type { TextProps, TextSemanticTag, TextVariantsProps }

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      as = 'span',
      variant,
      size,
      weight,
      tone,
      truncate,
      clamp,
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
        className={cn(
          textVariants({ variant, size, weight, tone, truncate }),
          clamp && clampMap[clamp],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Text.displayName = 'Text'
