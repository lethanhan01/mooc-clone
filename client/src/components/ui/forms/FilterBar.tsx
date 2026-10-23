import { useState, type ReactNode } from 'react'
import { SearchInput } from './SearchInput'
import { FilterDropdown } from './FilterDropdown'
import { Chip, type ChipTone } from '../data-display/Chip'
import { Button } from '../actions/Button'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/utils'

export interface FilterChipItem {
  id: string
  label: string
  onRemove: () => void
  tone?: ChipTone
}

export interface FilterBarProps {
  search?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  filterDropdownTitle?: string
  filterContent?: ReactNode
  activeFilterCount?: number
  onApplyFilters?: () => void
  onClearAll?: () => void
  filterChips?: FilterChipItem[]
  extraActions?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filterDropdownTitle,
  filterContent,
  activeFilterCount = 0,
  onApplyFilters,
  onClearAll,
  filterChips = [],
  extraActions,
  className,
  size = 'md',
}: Readonly<FilterBarProps>) {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {onSearchChange !== undefined && (
          <div className="min-w-[200px] flex-1">
            <SearchInput
              value={search ?? ''}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              size={size}
              fullWidth
            />
          </div>
        )}

        {filterContent && onApplyFilters && (
          <FilterDropdown
            open={filterOpen}
            onOpenChange={setFilterOpen}
            activeCount={activeFilterCount}
            title={filterDropdownTitle}
            size={size}
            onApply={onApplyFilters}
          >
            {filterContent}
          </FilterDropdown>
        )}

        {extraActions}

        {onClearAll && (activeFilterCount > 0 || filterChips.length > 0 || search) && (
          <Button
            type="button"
            variant="text-muted"
            size="compact"
            onClick={onClearAll}
            leftIcon={<RotateCcw size={13} />}
            className="text-xs"
          >
            Đặt lại
          </Button>
        )}
      </div>

      {filterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-fg-dim mr-1">
            Đang lọc:
          </span>
          {filterChips.map((chip) => (
            <Chip
              key={chip.id}
              label={chip.label}
              tone={chip.tone ?? 'accent'}
              size="sm"
              removable
              onRemove={chip.onRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
