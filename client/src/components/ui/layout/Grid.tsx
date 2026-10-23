import { forwardRef, type ElementType } from 'react'
import { cn } from '@/utils'
import {
  gridVariants,
  smColsMap,
  mdColsMap,
  lgColsMap,
  xlColsMap,
  colSpanMap,
  type GridProps,
  type GridItemProps,
} from './grid-utils'

export type { GridCols, GridSemanticTag } from './grid-utils'
export type { GridProps, GridItemProps }

export const Grid = forwardRef<HTMLElement, GridProps>(
  (
    {
      as = 'div',
      cols = 1,
      smCols,
      mdCols,
      lgCols,
      xlCols,
      gap = 4,
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
          gridVariants({ cols, gap }),
          smCols && smColsMap[smCols],
          mdCols && mdColsMap[mdCols],
          lgCols && lgColsMap[lgCols],
          xlCols && xlColsMap[xlCols],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Grid.displayName = 'Grid'

export const GridItem = forwardRef<HTMLElement, GridItemProps>(
  ({ as = 'div', colSpan, className, children, ...props }, ref) => {
    const Component = as as ElementType

    return (
      <Component
        ref={ref}
        className={cn(colSpan && colSpanMap[colSpan], className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
GridItem.displayName = 'GridItem'
