import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../actions/Button'
import { cn } from '@/utils'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
  className?: string
  showItemCount?: boolean
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className,
  showItemCount = false,
}: Readonly<PaginationProps>) {
  const { t } = useTranslation('common')

  if (totalPages <= 1 && !totalItems) return null

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('ellipsis')
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      if (page < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-4 py-3 sm:flex-row',
        className
      )}
    >
      {showItemCount && totalItems !== undefined && (
        <div className="text-xs text-fg-secondary">
          {pageSize ? (
            <span>
              {t('pagination.showing', {
                from: Math.min((page - 1) * pageSize + 1, totalItems),
                to: Math.min(page * pageSize, totalItems),
                total: totalItems,
                defaultValue: `Hiển thị ${Math.min((page - 1) * pageSize + 1, totalItems)} - ${Math.min(page * pageSize, totalItems)} trên ${totalItems}`,
              })}
            </span>
          ) : (
            <span>{t('pagination.totalItems', { total: totalItems, defaultValue: `Tổng: ${totalItems}` })}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 sm:ml-auto">
        <Button
          variant="icon"
          size="compact"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('pagination.prev', 'Trang trước')}
        >
          <ChevronLeft size={16} />
        </Button>

        {/* Page numbers on md+ screens */}
        <div className="hidden items-center gap-1 md:flex">
          {pageNumbers.map((p, idx) => {
            if (p === 'ellipsis') {
              const ellipsisKey = idx < pageNumbers.length / 2 ? 'ellipsis-prev' : 'ellipsis-next'
              return (
                <span key={ellipsisKey} className="px-2 text-xs text-fg-dim select-none">
                  ...
                </span>
              )
            }
            const isActive = p === page
            return (
              <Button
                key={p}
                variant={isActive ? 'primary' : 'elevated'}
                size="compact"
                className={cn('h-8 min-w-[32px] px-2 text-xs font-semibold', isActive && 'pointer-events-none')}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            )
          })}
        </div>

        {/* Compact page display on mobile */}
        <span className="px-2 text-xs text-fg-secondary md:hidden">
          {page} / {totalPages}
        </span>

        <Button
          variant="icon"
          size="compact"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('pagination.next', 'Trang sau')}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
