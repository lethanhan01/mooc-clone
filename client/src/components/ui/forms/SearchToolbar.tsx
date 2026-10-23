import { forwardRef, type ReactNode } from 'react'
import { SearchInput } from './SearchInput'
import { cn } from '@/utils'
import type { InputSize } from './Input'

export type SearchToolbarVariant = 'card' | 'compact' | 'plain'
export type SearchToolbarLayout = 'auto' | 'row' | 'col'

export interface SearchToolbarProps {
  /** Giá trị ô tìm kiếm */
  value?: string
  /** Hàm callback khi thay đổi ô tìm kiếm (hỗ trợ debounce tự động) */
  onChange?: (value: string) => void
  /** Callback tìm kiếm tức thời khi nhấn Enter */
  onSearch?: (value: string) => void
  /** Placeholder cho input */
  placeholder?: string
  /** Thời gian debounce (ms), mặc định 300ms */
  debounceMs?: number
  /** Trạng thái loading của thanh tìm kiếm */
  loading?: boolean
  /** Vô hiệu hóa ô tìm kiếm */
  disabled?: boolean
  /** Tự động focus */
  autoFocus?: boolean
  /** Kích thước input ('sm' | 'md' | 'lg'), mặc định 'md' (44px) */
  size?: InputSize
  /** Accessible label cho input */
  'aria-label'?: string

  /** Slot bộ lọc (FilterDropdown, ExerciseFilterDropdown, Select...) */
  filters?: ReactNode
  /** Slot nút hành động (Button thêm mới, export...) */
  actions?: ReactNode
  /** Slot nội dung bổ sung */
  children?: ReactNode

  /** Kiểu hiển thị container: 'card' (mặc định), 'compact', 'plain' */
  variant?: SearchToolbarVariant
  /** Kiểu layout: 'auto' (flex-col trên mobile, row trên desktop), 'row' (luôn cùng dòng), 'col' */
  layout?: SearchToolbarLayout
  /** ClassName bổ sung cho container ngoài */
  className?: string
  /** ClassName bổ sung cho SearchInput */
  inputClassName?: string
}

export const SearchToolbar = forwardRef<HTMLInputElement, SearchToolbarProps>(
  (
    {
      value,
      onChange,
      onSearch,
      placeholder,
      debounceMs,
      loading,
      disabled,
      autoFocus,
      size = 'md',
      'aria-label': ariaLabel,
      filters,
      actions,
      children,
      variant = 'card',
      layout = 'auto',
      className,
      inputClassName,
    },
    ref
  ) => {
    const hasSearch = value !== undefined && onChange !== undefined

    const searchNode = hasSearch ? (
      <SearchInput
        ref={ref}
        value={value}
        onChange={onChange}
        onSearch={onSearch}
        placeholder={placeholder}
        debounceMs={debounceMs}
        loading={loading}
        disabled={disabled}
        autoFocus={autoFocus}
        size={size}
        aria-label={ariaLabel}
        className={cn('min-w-0 flex-1', inputClassName)}
      />
    ) : null

    const content = (
      <>
        {searchNode}
        {children}
        {filters && <div className="flex shrink-0 items-center gap-2">{filters}</div>}
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </>
    )

    const layoutClasses = {
      auto: 'flex flex-col sm:flex-row items-stretch sm:items-center gap-3',
      row: 'flex items-center gap-3',
      col: 'flex flex-col items-stretch gap-3',
    }

    if (variant === 'plain') {
      return (
        <div className={cn(layoutClasses[layout], className)}>
          {content}
        </div>
      )
    }

    return (
      <div
        className={cn(
          'rogym-card rogym-card--compact rounded-2xl border border-line-accent-subtle bg-surface-card p-4',
          variant === 'compact' && 'p-3.5',
          layoutClasses[layout],
          className
        )}
      >
        {content}
      </div>
    )
  }
)

SearchToolbar.displayName = 'SearchToolbar'
