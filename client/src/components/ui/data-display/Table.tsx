import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from 'react'
import { cn } from '@/utils'
import { tableVariants, type TableVariantsProps } from './table-utils'

export type { TableVariantsProps }

export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ className, bordered = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-auto',
          bordered && 'rounded-2xl border border-line-accent-subtle bg-surface-card',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TableContainer.displayName = 'TableContainer'

export interface TableProps
  extends HTMLAttributes<HTMLTableElement>,
    TableVariantsProps {
  containerBordered?: boolean
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <table
        ref={ref}
        className={cn(tableVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Table.displayName = 'Table'

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('border-b border-line-subtle bg-surface-sunken text-xs font-semibold uppercase tracking-wider text-fg-dim', className)}
        {...props}
      />
    )
  }
)
TableHeader.displayName = 'TableHeader'

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  }
)
TableBody.displayName = 'TableBody'

export const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    return (
      <tfoot
        ref={ref}
        className={cn('border-t border-line-subtle bg-surface-sunken font-medium text-fg-primary', className)}
        {...props}
      />
    )
  }
)
TableFooter.displayName = 'TableFooter'

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-t border-line-subtle transition-colors duration-150 hover:bg-surface-card-hover',
          className
        )}
        {...props}
      />
    )
  }
)
TableRow.displayName = 'TableRow'

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-5 py-3.5 text-left align-middle font-medium text-fg-dim [&:has([role=checkbox])]:pr-0',
          className
        )}
        {...props}
      />
    )
  }
)
TableHead.displayName = 'TableHead'

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn('p-5 align-middle [&:has([role=checkbox])]:pr-0', className)}
        {...props}
      />
    )
  }
)
TableCell.displayName = 'TableCell'

export const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => {
    return (
      <caption
        ref={ref}
        className={cn('mt-4 text-xs text-fg-dim', className)}
        {...props}
      />
    )
  }
)
TableCaption.displayName = 'TableCaption'

export const TableEmpty = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, colSpan, children, ...props }, ref) => {
    return (
      <tr>
        <td
          ref={ref}
          colSpan={colSpan}
          className={cn('p-8 text-center text-sm text-fg-dim', className)}
          {...props}
        >
          {children}
        </td>
      </tr>
    )
  }
)
TableEmpty.displayName = 'TableEmpty'
