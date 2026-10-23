import { forwardRef, type ElementType } from 'react'
import { cn } from '@/utils'
import {
  containerVariants,
  type ContainerProps,
  type ContainerSemanticTag,
  type ContainerVariantsProps,
} from './container-utils'

export type { ContainerProps, ContainerSemanticTag, ContainerVariantsProps }

export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ as = 'div', size, centered, padding, className, children, ...props }, ref) => {
    const Component = as as ElementType

    return (
      <Component
        ref={ref}
        className={cn(containerVariants({ size, centered, padding }), className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Container.displayName = 'Container'
