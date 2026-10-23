// rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Enterprise layout master-detail container]
import type { HTMLAttributes, ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/actions'

export interface SplitPaneProps extends HTMLAttributes<HTMLDivElement> {
  masterList: ReactNode
  detailPane: ReactNode
  selectedId?: string | null
  onBackToList?: () => void
  masterWidth?: string
  backLabel?: string
  masterAriaLabel?: string
  detailAriaLabel?: string
  emptyDetailMessage?: ReactNode
}

export function SplitPane({
  masterList,
  detailPane,
  selectedId,
  onBackToList,
  masterWidth = 'w-full md:w-80 lg:w-96',
  backLabel = 'Quay lại danh sách',
  masterAriaLabel = 'Danh sách các mục',
  detailAriaLabel = 'Chi tiết mục đã chọn',
  emptyDetailMessage = 'Chọn một mục từ danh sách để xem chi tiết',
  className,
  ...props
}: Readonly<SplitPaneProps>) {
  const hasSelection = Boolean(selectedId)

  return (
    <div
      className={cn(
        'relative flex w-full flex-col md:flex-row items-stretch gap-6 overflow-hidden min-h-96',
        className
      )}
      {...props}
    >
      {/* Master List Column */}
      <section
        aria-label={masterAriaLabel}
        className={cn(
          'flex flex-col shrink-0 overflow-y-auto',
          masterWidth,
          hasSelection ? 'hidden md:flex' : 'flex'
        )}
      >
        {masterList}
      </section>

      {/* Detail Pane Column */}
      <article
        aria-label={detailAriaLabel}
        className={cn(
          'flex-1 flex flex-col min-w-0 overflow-y-auto rounded-2xl border border-line-subtle bg-surface-card p-6',
          !hasSelection ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Mobile Back Button */}
        {hasSelection && onBackToList && (
          <div className="mb-4 md:hidden">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
              onClick={onBackToList}
            >
              {backLabel}
            </Button>
          </div>
        )}

        {hasSelection ? (
          detailPane
        ) : (
          <div className="flex flex-1 items-center justify-center p-12 text-center text-sm text-fg-dim">
            {emptyDetailMessage}
          </div>
        )}
      </article>
    </div>
  )
}
