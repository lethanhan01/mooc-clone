import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useState, createRef } from 'react'
import { SearchInput, SearchIcon, SearchClearButton, SearchSpinner, SearchField } from './SearchInput'

function ControlledSearch({
  debounceMs = 300,
  loading = false,
  disabled = false,
  placeholder,
  ariaLabel,
  onSearch,
}: {
  debounceMs?: number
  loading?: boolean
  disabled?: boolean
  placeholder?: string
  ariaLabel?: string
  onSearch?: (val: string) => void
}) {
  const [val, setVal] = useState('')
  return (
    <SearchInput
      value={val}
      onChange={setVal}
      onSearch={onSearch}
      debounceMs={debounceMs}
      loading={loading}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel}
    />
  )
}

describe('SearchInput Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders input with default placeholder and search icon', () => {
    render(<ControlledSearch placeholder="Tìm hội viên..." />)
    const input = screen.getByRole('searchbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Tìm hội viên...')
  })

  it('automatically sets accessible aria-label from placeholder when explicit label is absent', () => {
    render(<ControlledSearch placeholder="Tìm kiếm gói tập" />)
    const input = screen.getByRole('searchbox', { name: 'Tìm kiếm gói tập' })
    expect(input).toBeInTheDocument()
  })

  it('updates value immediately on change and debounces onSearch call', () => {
    const handleSearch = vi.fn()
    render(<ControlledSearch onSearch={handleSearch} debounceMs={300} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'Gym' } })

    expect(input).toHaveValue('Gym')
    expect(handleSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(handleSearch).toHaveBeenCalledWith('Gym')
  })

  it('triggers onSearch immediately when Enter key is pressed', () => {
    const handleSearch = vi.fn()
    render(<ControlledSearch onSearch={handleSearch} debounceMs={500} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'Cardio' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(handleSearch).toHaveBeenCalledWith('Cardio')
  })

  it('clears value on Escape key and triggers onSearch with empty string', () => {
    const handleSearch = vi.fn()
    render(<ControlledSearch onSearch={handleSearch} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'Yoga' } })
    expect(input).toHaveValue('Yoga')

    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
    expect(input).toHaveValue('')
    expect(handleSearch).toHaveBeenCalledWith('')
  })

  it('renders clear button when value is present and clears on click', () => {
    const handleSearch = vi.fn()
    render(<ControlledSearch onSearch={handleSearch} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'Pilates' } })

    const clearBtn = screen.getByRole('button', { name: 'Xóa tìm kiếm' })
    expect(clearBtn).toBeInTheDocument()

    fireEvent.click(clearBtn)
    expect(input).toHaveValue('')
    expect(handleSearch).toHaveBeenCalledWith('')
  })

  it('renders spinner and hides clear button when loading is true', () => {
    render(<ControlledSearch loading />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xóa tìm kiếm' })).not.toBeInTheDocument()
  })

  it('disables input when disabled prop is true', () => {
    render(<ControlledSearch disabled />)
    expect(screen.getByRole('searchbox')).toBeDisabled()
  })

  it('forwards ref and allows imperative focus', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <SearchInput
        ref={ref}
        value=""
        onChange={vi.fn()}
        placeholder="Search..."
      />
    )

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    ref.current?.focus()
    expect(screen.getByRole('searchbox')).toHaveFocus()
  })

  it('supports Compound API mode with SearchInput.Icon, Field, and ClearButton', () => {
    const handleSearch = vi.fn()
    render(
      <SearchInput value="Test" onChange={vi.fn()} onSearch={handleSearch}>
        <SearchIcon />
        <SearchField placeholder="Custom search..." />
        <SearchClearButton />
        <SearchSpinner />
      </SearchInput>
    )

    expect(screen.getByRole('searchbox')).toHaveValue('Test')
    expect(screen.getByRole('button', { name: 'Xóa tìm kiếm' })).toBeInTheDocument()
  })
})
