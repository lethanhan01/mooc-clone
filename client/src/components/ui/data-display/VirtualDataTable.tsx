import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/utils'

export interface ColumnDef<T> {
  key: string
  header: string
  width?: string | number
  render: (row: T, index: number) => React.ReactNode
}

export interface VirtualDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  height?: number
  estimateRowHeight?: number
  getRowId?: (row: T, index: number) => string
  emptyMessage?: string
  className?: string
}

/**
 * VirtualDataTable Component (PERF-004)
 * High-performance virtualized table component utilizing @tanstack/react-virtual
 * for rendering datasets (>100 to 10,000 items) with minimal DOM footprint.
 */
export function VirtualDataTable<T>({
  data,
  columns,
  height = 400,
  estimateRowHeight = 48,
  getRowId = (_, i) => String(i),
  emptyMessage = 'Không có dữ liệu hiển thị.',
  className,
}: VirtualDataTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 5,
    initialRect: { width: 800, height },
  })

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl border border-border bg-surface-card p-8 text-center text-surface-card-muted-fg',
          className
        )}
      >
        <p>{emptyMessage}</p>
      </div>
    )
  }

  const virtualItems = rowVirtualizer.getVirtualItems()
  const displayItems =
    virtualItems.length > 0
      ? virtualItems
      : data.map((_, i) => ({
          index: i,
          start: i * estimateRowHeight,
          size: estimateRowHeight,
          end: (i + 1) * estimateRowHeight,
          key: i,
          lane: 0,
        }))

  return (
    <div
      ref={parentRef}
      className={cn(
        'relative w-full overflow-auto rounded-xl border border-border bg-surface-card',
        className
      )}
      style={{ height: `${height}px` }}
      role="region"
      aria-label="Bảng dữ liệu ảo hóa"
      tabIndex={0}
    >
      {/* Sticky Table Header */}
      <div className="sticky top-0 z-10 flex border-b border-border bg-surface-base font-semibold text-surface-base-fg">
        {columns.map((col) => (
          <div
            key={col.key}
            className="flex-1 px-4 py-3 text-left text-sm"
            style={col.width ? { width: col.width, flex: 'none' } : undefined}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Virtualized Rows Container */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize() || data.length * estimateRowHeight}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {displayItems.map((virtualRow) => {
          const row = data[virtualRow.index]
          const key = getRowId(row, virtualRow.index)

          return (
            <div
              key={key}
              data-index={virtualRow.index}
              className="absolute left-0 top-0 flex w-full border-b border-border/50 text-surface-card-fg transition-colors hover:bg-surface-elevated/40"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex flex-1 items-center px-4 py-2 text-sm"
                  style={col.width ? { width: col.width, flex: 'none' } : undefined}
                >
                  {col.render(row, virtualRow.index)}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

VirtualDataTable.displayName = 'VirtualDataTable'

export default VirtualDataTable
