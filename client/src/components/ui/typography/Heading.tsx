import { forwardRef, type ElementType } from 'react'
import { cn } from '@/utils'
import {
  headingVariants,
  defaultLevelSizeMap,
  type HeadingProps,
  type HeadingLevel,
  type HeadingSize,
  type HeadingVariantsProps,
} from './heading-utils'

export type { HeadingProps, HeadingLevel, HeadingSize, HeadingVariantsProps }

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, as, size, tone, truncate, className, children, ...props }, ref) => {
    const resolvedLevel: HeadingLevel =
      level ?? (as ? (Number(as.replace('h', '')) as HeadingLevel) : 2)
    const Component = (as ?? `h${resolvedLevel}`) as ElementType
    const effectiveSize = size ?? defaultLevelSizeMap[resolvedLevel]

    return (
      <Component
        ref={ref}
        className={cn(
          headingVariants({ size: effectiveSize, tone, truncate }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Heading.displayName = 'Heading'
