import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

const mockOptions = [
  { value: 'grid', label: 'Lưới' },
  { value: 'list', label: 'Danh sách' },
]

describe('SegmentedControl Component', () => {
  it('renders all options', () => {
    render(<SegmentedControl options={mockOptions} value="grid" />)
    expect(screen.getByText('Lưới')).toBeInTheDocument()
    expect(screen.getByText('Danh sách')).toBeInTheDocument()
  })

  it('triggers onValueChange on option click', () => {
    const handleChange = vi.fn()
    render(
      <SegmentedControl
        options={mockOptions}
        value="grid"
        onValueChange={handleChange}
      />
    )

    fireEvent.click(screen.getByText('Danh sách'))
    expect(handleChange).toHaveBeenCalledWith('list')
  })
})
