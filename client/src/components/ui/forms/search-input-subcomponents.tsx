import {
  forwardRef,
  type InputHTMLAttributes,
} from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils'
import { Button } from '../actions/Button'
import { useFormField } from './form-field-context'
import {
  searchFieldVariants,
  SEARCH_ICON_SIZES,
  CLEAR_ICON_SIZES,
  useSearchInputContext,
  resolveSearchAriaLabel,
} from './search-input-utils'

// ─── SearchInput.Icon (top-level sub-component) ──────────────────────────────

export const SearchIcon = ({ className }: Readonly<{ className?: string }>) => {
  const ctx = useSearchInputContext()
  const size = ctx?.effectiveSize ?? 'md'

  return (
    <Search
      size={SEARCH_ICON_SIZES[size]}
      className={cn('pointer-events-none absolute left-3.5 text-fg-muted shrink-0', className)}
      aria-hidden="true"
    />
  )
}
SearchIcon.displayName = 'SearchInput.Icon'

// ─── SearchInput.ClearButton (top-level sub-component) ───────────────────────

export const SearchClearButton = ({
  className,
  'aria-label': ariaLabel = 'Xóa tìm kiếm',
}: Readonly<{ className?: string; 'aria-label'?: string }>) => {
  const ctx = useSearchInputContext()
  const size = ctx?.effectiveSize ?? 'md'

  if (!ctx?.value || ctx.loading) return null

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      tabIndex={-1}
      onClick={ctx.onClear}
      disabled={ctx.disabled}
      aria-label={ariaLabel}
      className={cn(
        'relative flex items-center justify-center p-1.5 text-fg-muted hover:text-fg-primary cursor-pointer shrink-0 rounded-lg transition-colors bg-transparent hover:bg-transparent h-auto min-h-0 min-w-0',
        "after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
        'after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden',
        'absolute right-2.5 z-10 touch-manipulation active:scale-95',
        className
      )}
    >
      <X size={CLEAR_ICON_SIZES[size]} />
    </Button>
  )
}
SearchClearButton.displayName = 'SearchInput.ClearButton'

// ─── SearchInput.Spinner (top-level sub-component) ───────────────────────────

export const SearchSpinner = ({ className }: Readonly<{ className?: string }>) => {
  const ctx = useSearchInputContext()
  if (!ctx?.loading) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute right-3.5 flex items-center justify-center text-fg-muted shrink-0',
        className
      )}
      aria-hidden="true"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </div>
  )
}
SearchSpinner.displayName = 'SearchInput.Spinner'

// ─── SearchInput.Field (top-level sub-component) ─────────────────────────────

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  className?: string
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, placeholder = 'Tìm kiếm...', 'aria-label': ariaLabel, onChange: propOnChange, ...props }, ref) => {
    const ctx = useSearchInputContext()
    const formField = useFormField()
    const size = ctx?.effectiveSize ?? 'md'
    const resolvedAriaLabel = resolveSearchAriaLabel(ariaLabel, placeholder)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      propOnChange?.(e)
      ctx?.onChange(e.target.value)
    }

    return (
      <input
        ref={ref ?? (ctx?.inputRef as React.RefObject<HTMLInputElement>)}
        type="search"
        disabled={ctx?.disabled}
        value={ctx?.value ?? ''}
        id={formField?.id}
        onChange={handleChange}
        aria-label={resolvedAriaLabel}
        placeholder={placeholder}
        className={cn(searchFieldVariants({ size, hasError: ctx?.hasError }), className)}
        {...props}
      />
    )
  }
)
SearchField.displayName = 'SearchInput.Field'
