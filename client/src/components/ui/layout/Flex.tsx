import { forwardRef, type ElementType } from 'react'
import { cn } from '@/utils'
import {
  flexVariants,
  type FlexProps,
  type FlexSemanticTag,
  type FlexVariantsProps,
  type HStackProps,
  type VStackProps,
} from './flex-utils'

export type {
  FlexProps,
  FlexSemanticTag,
  FlexVariantsProps,
  HStackProps,
  VStackProps,
}

export const Flex = forwardRef<HTMLElement, FlexProps>(
  (
    {
      as = 'div',
      direction,
      align,
      justify,
      gap,
      wrap,
      inline,
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
          flexVariants({ direction, align, justify, gap, wrap, inline }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Flex.displayName = 'Flex'

export const HStack = forwardRef<HTMLElement, HStackProps>(
  ({ align = 'center', gap = 3, className, children, ...props }, ref) => {
    return (
      <Flex
        ref={ref}
        direction="row"
        align={align}
        gap={gap}
        className={className}
        {...props}
      >
        {children}
      </Flex>
    )
  }
)
HStack.displayName = 'HStack'

export const VStack = forwardRef<HTMLElement, VStackProps>(
  ({ align = 'stretch', gap = 3, className, children, ...props }, ref) => {
    return (
      <Flex
        ref={ref}
        direction="column"
        align={align}
        gap={gap}
        className={className}
        {...props}
      >
        {children}
      </Flex>
    )
  }
)
VStack.displayName = 'VStack'
