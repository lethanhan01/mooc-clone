import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  startTransition,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { cn } from '@/utils'
import { useFormField } from './form-field-context'
import type { InputSize } from './Input'
import {
  type SearchInputSize,
  searchContainerVariants,
  searchFieldVariants,
  SearchInputContext,
  normalizeSearchInputSize,
  resolveSearchAriaLabel,
} from './search-input-utils'
import {
  SearchIcon,
  SearchClearButton,
  SearchSpinner,
  SearchField,
} from './search-input-subcomponents'

export type { SearchInputSize } from './search-input-utils'
export {
  SearchIcon,
  SearchClearButton,
  SearchSpinner,
  SearchField,
} from './search-input-subcomponents'
export type { SearchFieldProps } from './search-input-subcomponents'

// ─── SearchInput Root Component ──────────────────────────────────────────────

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  debounceMs?: number
  loading?: boolean
  inputSize?: InputSize
  size?: SearchInputSize | InputSize
  fullWidth?: boolean
  mobileFull?: boolean
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  error?: boolean | string
  'aria-label'?: string
  children?: ReactNode
}

interface SearchInputComponent
  extends React.ForwardRefExoticComponent<SearchInputProps & React.RefAttributes<HTMLInputElement>> {
  Icon: typeof SearchIcon
  ClearButton: typeof SearchClearButton
  Spinner: typeof SearchSpinner
  Field: typeof SearchField
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onSearch,
      placeholder = 'Tìm kiếm...',
      debounceMs = 300,
      loading = false,
      inputSize,
      size,
      fullWidth = true,
      mobileFull,
      disabled,
      autoFocus,
      className,
      error,
      'aria-label': ariaLabelProp,
      children,
      ...props
    },
    ref
  ) => {
    const formField = useFormField()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const effectiveDisabled = Boolean(disabled || formField?.disabled)
    const hasError = Boolean(error || formField?.error)
    const effectiveSize = normalizeSearchInputSize(size ?? inputSize)
    const resolvedAriaLabel = resolveSearchAriaLabel(ariaLabelProp, placeholder)

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    useEffect(() => {
      if (autoFocus && !effectiveDisabled) {
        inputRef.current?.focus()
      }
    }, [autoFocus, effectiveDisabled])

    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }, [])

    function triggerSearch(term: string) {
      startTransition(() => {
        onSearch?.(term)
      })
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const next = e.target.value
      onChange(next)

      if (timerRef.current) clearTimeout(timerRef.current)
      if (debounceMs <= 0) {
        triggerSearch(next)
        return
      }

      timerRef.current = setTimeout(() => {
        triggerSearch(next)
      }, debounceMs)
    }

    function handleClear() {
      if (timerRef.current) clearTimeout(timerRef.current)
      onChange('')
      triggerSearch('')
      inputRef.current?.focus()
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') {
        if (timerRef.current) clearTimeout(timerRef.current)
        triggerSearch(value)
      } else if (e.key === 'Escape' && value) {
        handleClear()
      }
    }

    let widthVariant: 'mobile-full' | 'full' | 'auto' = 'auto'
    if (mobileFull) {
      widthVariant = 'mobile-full'
    } else if (fullWidth) {
      widthVariant = 'full'
    }

    const contextValue = useMemo(
      () => ({
        value,
        effectiveSize,
        disabled: effectiveDisabled,
        loading,
        hasError,
        onChange,
        onClear: handleClear,
        inputRef,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [value, effectiveSize, effectiveDisabled, loading, hasError]
    )

    // ── Compound API Mode ─────────────────────────────────────────────────────
    if (children) {
      return (
        <SearchInputContext.Provider value={contextValue}>
          <div className={cn(searchContainerVariants({ width: widthVariant }), className)}>
            {children}
          </div>
        </SearchInputContext.Provider>
      )
    }

    // ── Shorthand API Mode ────────────────────────────────────────────────────
    return (
      <SearchInputContext.Provider value={contextValue}>
        <div className={cn(searchContainerVariants({ width: widthVariant }), className)}>
          <SearchIcon />

          <input
            {...props}
            ref={inputRef}
            type="search"
            disabled={effectiveDisabled}
            value={value}
            id={formField?.id}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label={resolvedAriaLabel}
            placeholder={placeholder}
            className={cn(searchFieldVariants({ size: effectiveSize, hasError }))}
          />

          <SearchSpinner />
          <SearchClearButton />
        </div>
      </SearchInputContext.Provider>
    )
  }
) as SearchInputComponent

SearchInput.displayName = 'SearchInput'
SearchInput.Icon = SearchIcon
SearchInput.ClearButton = SearchClearButton
SearchInput.Spinner = SearchSpinner
SearchInput.Field = SearchField
