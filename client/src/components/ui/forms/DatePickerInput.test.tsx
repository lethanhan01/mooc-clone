import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DatePickerInput } from './DatePickerInput'

function ControlledDatePicker({
  initialValue = '',
  min,
  max,
  disabled,
  error,
  ariaLabel = 'Ngày',
}: Readonly<{
  initialValue?: string
  min?: string
  max?: string
  disabled?: boolean
  error?: boolean | string
  ariaLabel?: string
}>) {
  const [val, setVal] = useState(initialValue)
  return (
    <DatePickerInput
      value={val}
      onChange={setVal}
      min={min}
      max={max}
      disabled={disabled}
      error={error}
      aria-label={ariaLabel}
    />
  )
}

describe('DatePickerInput', () => {
  it('renders input with placeholder and value', () => {
    render(
      <DatePickerInput
        value="2026-10-20"
        onChange={vi.fn()}
        placeholder="Chọn ngày"
        aria-label="Ngày sinh"
      />
    )

    const input = screen.getByLabelText('Ngày sinh') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe('20/10/2026')
  })

  it('updates input text when typing a valid date', () => {
    const handleChange = vi.fn()
    render(
      <DatePickerInput
        value=""
        onChange={handleChange}
        aria-label="Ngày đặt lịch"
      />
    )

    const input = screen.getByLabelText('Ngày đặt lịch')
    fireEvent.change(input, { target: { value: '25/12/2026' } })

    expect(handleChange).toHaveBeenCalledWith('2026-12-25')
  })

  it('calls onChange with empty string when cleared', () => {
    const handleChange = vi.fn()
    render(
      <DatePickerInput
        value="2026-10-20"
        onChange={handleChange}
        aria-label="Ngày"
      />
    )

    const input = screen.getByLabelText('Ngày')
    fireEvent.change(input, { target: { value: '' } })

    expect(handleChange).toHaveBeenCalledWith('')
  })

  it('normalizes input on blur when valid date was entered in controlled wrapper', () => {
    render(<ControlledDatePicker initialValue="" ariaLabel="Ngày" />)

    const input = screen.getByLabelText('Ngày') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2026-05-15' } })
    fireEvent.blur(input)

    expect(input.value).toBe('15/05/2026')
  })

  it('ignores input outside min date bound', () => {
    const handleChange = vi.fn()
    render(
      <DatePickerInput
        value=""
        min="2026-01-01"
        onChange={handleChange}
        aria-label="Ngày"
      />
    )

    const input = screen.getByLabelText('Ngày')
    fireEvent.change(input, { target: { value: '15/12/2025' } })

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('ignores input outside max date bound', () => {
    const handleChange = vi.fn()
    render(
      <DatePickerInput
        value=""
        max="2026-12-31"
        onChange={handleChange}
        aria-label="Ngày"
      />
    )

    const input = screen.getByLabelText('Ngày')
    fireEvent.change(input, { target: { value: '01/01/2027' } })

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('supports disabled state', () => {
    render(
      <DatePickerInput
        value="2026-10-20"
        disabled
        onChange={vi.fn()}
        aria-label="Ngày"
      />
    )

    const input = screen.getByLabelText('Ngày')
    expect(input).toBeDisabled()

    const openButton = screen.getByRole('button', { name: /Mở lịch/i })
    expect(openButton).toBeDisabled()
  })

  it('applies error styling and aria-invalid', () => {
    render(
      <DatePickerInput
        value=""
        error="Ngày không hợp lệ"
        onChange={vi.fn()}
        aria-label="Ngày"
      />
    )

    const input = screen.getByLabelText('Ngày')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.closest('div')).toHaveClass('border-status-danger-border')
  })
})
