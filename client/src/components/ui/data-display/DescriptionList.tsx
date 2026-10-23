import { forwardRef } from 'react'
import { cn } from '@/utils'
import {
  descriptionListVariants,
  type DescriptionListProps,
  type DescriptionItemProps,
  type DescriptionTermProps,
  type DescriptionDetailsProps,
  type DescriptionItemData,
} from './description-list-utils'

export type {
  DescriptionListProps,
  DescriptionItemProps,
  DescriptionTermProps,
  DescriptionDetailsProps,
  DescriptionItemData,
}

export const DescriptionTerm = forwardRef<HTMLElement, DescriptionTermProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <dt
        ref={ref}
        className={cn('text-fg-secondary font-medium truncate', className)}
        {...props}
      >
        {children}
      </dt>
    )
  }
)
DescriptionTerm.displayName = 'DescriptionTerm'

export const DescriptionDetails = forwardRef<HTMLElement, DescriptionDetailsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <dd
        ref={ref}
        className={cn('mt-0.5 text-fg-primary font-semibold truncate', className)}
        {...props}
      >
        {children}
      </dd>
    )
  }
)
DescriptionDetails.displayName = 'DescriptionDetails'

export const DescriptionItem = forwardRef<HTMLDivElement, DescriptionItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('min-w-0', className)} {...props}>
        {children}
      </div>
    )
  }
)
DescriptionItem.displayName = 'DescriptionItem'

export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(
  (
    {
      layout = 'grid',
      columns = 2,
      gap = 'md',
      size = 'sm',
      bordered = false,
      items,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <dl
        ref={ref}
        className={cn(
          descriptionListVariants({ layout, columns, gap, size }),
          bordered && 'border-t border-border-subtle pt-3',
          className
        )}
        {...props}
      >
        {items
          ? items.map((item, index) => {
              const itemKey = item.id ?? (typeof item.term === 'string' ? item.term : `item-${index}`)
              return (
                <DescriptionItem key={itemKey}>
                  <DescriptionTerm>{item.term}</DescriptionTerm>
                  <DescriptionDetails>{item.details}</DescriptionDetails>
                </DescriptionItem>
              )
            })
          : children}
      </dl>
    )
  }
)
DescriptionList.displayName = 'DescriptionList'
