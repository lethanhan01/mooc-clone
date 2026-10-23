import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Combobox } from './Combobox'

const mockOptions = [
  { value: 'apple', label: 'Táo Đỏ' },
  { value: 'banana', label: 'Chuối Vàng' },
  { value: 'orange', label: 'Cam Sành' },
]

describe('Combobox Component', () => {
  it('renders placeholder when no value is selected', () => {
    render(<Combobox options={mockOptions} placeholder="Chọn hoa quả..." />)
    expect(screen.getByText('Chọn hoa quả...')).toBeInTheDocument()
  })

  it('renders label of selected value', () => {
    render(<Combobox options={mockOptions} value="banana" />)
    expect(screen.getByText('Chuối Vàng')).toBeInTheDocument()
  })

  it('opens options popover on click and filters results', () => {
    render(<Combobox options={mockOptions} placeholder="Chọn hoa quả..." />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    expect(screen.getByText('Táo Đỏ')).toBeInTheDocument()
    expect(screen.getByText('Cam Sành')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Tìm kiếm...')
    fireEvent.change(searchInput, { target: { value: 'Cam' } })

    expect(screen.getByText('Cam Sành')).toBeInTheDocument()
    expect(screen.queryByText('Táo Đỏ')).not.toBeInTheDocument()
  })

  it('calls onValueChange when option is selected', () => {
    const handleValueChange = vi.fn()
    render(
      <Combobox
        options={mockOptions}
        placeholder="Chọn hoa quả..."
        onValueChange={handleValueChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Táo Đỏ'))

    expect(handleValueChange).toHaveBeenCalledWith('apple')
  })
})
