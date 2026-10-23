import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FilterBar } from './FilterBar'

describe('FilterBar Component', () => {
  it('renders search input, filter chips and clear all button', () => {
    const handleSearchChange = vi.fn()
    const handleRemoveChip = vi.fn()
    const handleClearAll = vi.fn()

    render(
      <FilterBar
        search="Hội viên"
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm hội viên..."
        filterChips={[
          { id: '1', label: 'Gói VIP', onRemove: handleRemoveChip },
        ]}
        onClearAll={handleClearAll}
      />
    )

    expect(screen.getByPlaceholderText('Tìm hội viên...')).toBeInTheDocument()
    expect(screen.getByText('Gói VIP')).toBeInTheDocument()

    const resetBtn = screen.getByRole('button', { name: /đặt lại|reset/i })
    expect(resetBtn).toBeInTheDocument()

    fireEvent.click(resetBtn)
    expect(handleClearAll).toHaveBeenCalledTimes(1)

  })
})
