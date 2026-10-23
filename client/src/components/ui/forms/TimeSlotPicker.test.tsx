import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TimeSlotPicker } from './TimeSlotPicker'

const mockSlots = [
  { startTime: '2026-08-23T07:00:00.000Z', endTime: '2026-08-23T08:00:00.000Z', available: false, reason: 'PAST_TIME' },
  { startTime: '2026-08-23T09:00:00.000Z', endTime: '2026-08-23T10:00:00.000Z', available: true },
]

describe('TimeSlotPicker Component', () => {
  it('renders available and unavailable slots', () => {
    render(
      <TimeSlotPicker
        slots={mockSlots}
        onSelectSlot={vi.fn()}
      />
    )

    expect(screen.getByText('Đã qua')).toBeInTheDocument()
  })

  it('calls onSelectSlot when available slot is clicked', () => {
    const handleSelect = vi.fn()
    render(
      <TimeSlotPicker
        slots={mockSlots}
        onSelectSlot={handleSelect}
      />
    )

    const buttons = screen.getAllByRole('button')
    const availableBtn = buttons.find((b) => !b.hasAttribute('disabled'))
    expect(availableBtn).toBeDefined()
    if (availableBtn) {
      fireEvent.click(availableBtn)
      expect(handleSelect).toHaveBeenCalledTimes(1)
    }
  })

  it('renders empty message when slots array is empty', () => {
    render(<TimeSlotPicker slots={[]} onSelectSlot={vi.fn()} emptyMessage="Hết chỗ" />)
    expect(screen.getByText('Hết chỗ')).toBeInTheDocument()
  })
})
