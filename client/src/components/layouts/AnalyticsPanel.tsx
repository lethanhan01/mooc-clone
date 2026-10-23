// rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Enterprise data-dense layout slots]
import type { HTMLAttributes, ReactNode } from 'react'
import { Card } from '@/components/ui/data-display'
import { cn } from '@/utils/cn'

export interface AnalyticsPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  as?: 'main' | 'section' | 'div'
  header?: ReactNode
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  toolbar?: ReactNode
  filters?: ReactNode
  bulkActions?: ReactNode
  table: ReactNode
  pagination?: ReactNode
  emptyState?: ReactNode
  isEmpty?: boolean
  maxTableHeight?: string
  tableAriaLabel?: string
  bulkActionsAriaLabel?: string
  filtersAriaLabel?: string
}

export function AnalyticsPanel({
  as: Component = 'main',
  header,
  title,
  description,
  actions,
  toolbar,
  filters,
  bulkActions,
  table,
  pagination,
  emptyState,
  isEmpty = false,
  maxTableHeight = 'max-h-[40rem]',
  tableAriaLabel = 'Bảng dữ liệu phân tích',
  bulkActionsAriaLabel = 'Thao tác hàng loạt',
  filtersAriaLabel = 'Bộ lọc và tìm kiếm',
  className,
  ...props
}: Readonly<AnalyticsPanelProps>) {
  const hasCustomHeader = Boolean(header)
  const hasTitleOrActions = Boolean(title || actions || description)
  const hasFiltersOrToolbar = Boolean(toolbar || filters)

  return (
    <Component
      className={cn('flex-1 w-full space-y-4 pb-8', className)}
      {...props}
    >
      {/* 1. Header Landmark */}
      {hasCustomHeader ? (
        <header>{header}</header>
      ) : hasTitleOrActions ? (
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            {typeof title === 'string' ? (
              <h1 className="text-xl md:text-2xl font-bold text-surface-card-fg tracking-tight">
                {title}
              </h1>
            ) : (
              title
            )}
            {description && (
              <p className="text-sm text-fg-muted">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      ) : null}

      {/* 2. Filters & Toolbar Section */}
      {hasFiltersOrToolbar && (
        <section
          aria-label={filtersAriaLabel}
          className="space-y-3"
        >
          {toolbar}
          {filters}
        </section>
      )}

      {/* 3. Bulk Actions Region (Live Region for Screen Readers) */}
      {bulkActions && (
        <section
          role="region"
          aria-label={bulkActionsAriaLabel}
          aria-live="polite"
          className="rounded-xl border border-line-subtle bg-surface-subtle p-3 flex flex-wrap items-center justify-between gap-3"
        >
          {bulkActions}
        </section>
      )}

      {/* 4. Dense Data Table Container with Card Wrapper */}
      <Card
        as="section"
        aria-label={tableAriaLabel}
        padding="none"
        className="overflow-hidden border border-line-subtle bg-surface-card shadow-sm"
      >
        {isEmpty && emptyState ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            {emptyState}
          </div>
        ) : (
          <div className={cn('overflow-x-auto relative', maxTableHeight)}>
            {table}
          </div>
        )}

        {/* 5. Pagination Footer */}
        {pagination && (
          <footer
            aria-label="Phân trang bảng dữ liệu"
            className="p-3 border-t border-line-subtle flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-card"
          >
            {pagination}
          </footer>
        )}
      </Card>
    </Component>
  )
}
