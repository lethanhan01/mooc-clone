import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DateTimePickerInput } from './DateTimePickerInput'

describe('DateTimePickerInput', () => {
  it('renders trigger with formatted date and time', () => {
    render(
      <DateTimePickerInput
        value="2026-10-20T14:30"
        onChange={vi.fn()}
        aria-label="Thời gian hẹn"
      />
    )

    const trigger = screen.getByLabelText('Thời gian hẹn')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('20/10/2026 14:30')
  })

  it('renders placeholder when value is empty', () => {
    render(
      <DateTimePickerInput
        value=""
        onChange={vi.fn()}
        placeholder="Chọn ngày và giờ"
        aria-label="Lịch tập"
      />
    )

    const trigger = screen.getByLabelText('Lịch tập')
    expect(trigger).toHaveTextContent('Chọn ngày và giờ')
  })

  it('opens popover and allows editing hours and minutes', () => {
    const handleChange = vi.fn()
    render(
      <DateTimePickerInput
        value="2026-10-20T10:15"
        onChange={handleChange}
        aria-label="Lịch tập"
      />
    )

    const trigger = screen.getByLabelText('Lịch tập')
    fireEvent.click(trigger)

    const hourInput = screen.getByLabelText('Giờ (HH)') as HTMLInputElement
    const minuteInput = screen.getByLabelText('Phút (MM)') as HTMLInputElement

    expect(hourInput).toBeInTheDocument()
    expect(minuteInput).toBeInTheDocument()
    expect(hourInput.value).toBe('10')
    expect(minuteInput.value).toBe('15')

    fireEvent.change(hourInput, { target: { value: '14' } })
    expect(handleChange).toHaveBeenCalledWith('2026-10-20T14:15')

    fireEvent.change(minuteInput, { target: { value: '45' } })
    expect(handleChange).toHaveBeenCalledWith('2026-10-20T10:45')
  })

  it('handles disabled state', () => {
    render(
      <DateTimePickerInput
        value="2026-10-20T14:30"
        disabled
        onChange={vi.fn()}
        aria-label="Lịch tập"
      />
    )

    const trigger = screen.getByLabelText('Lịch tập')
    expect(trigger).toBeDisabled()
  })

  it('applies error border styling', () => {
    render(
      <DateTimePickerInput
        value=""
        error="Thời gian không hợp lệ"
        onChange={vi.fn()}
        aria-label="Lịch tập"
      />
    )

    const trigger = screen.getByLabelText('Lịch tập')
    expect(trigger).toHaveClass('border-status-danger-border')
  })
})
