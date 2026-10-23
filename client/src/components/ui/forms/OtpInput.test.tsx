import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useState, createRef } from 'react'
import { OtpInput, OtpSlot, OtpSeparator, type OtpInputRef } from './OtpInput'

function ControlledOtp({
  length = 6,
  size,
  disabled,
  autoFocus,
  error,
  onChange,
}: {
  length?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  autoFocus?: boolean
  error?: boolean | string
  onChange?: (val: string[]) => void
}) {
  const [val, setVal] = useState<string[]>(new Array(length).fill(''))
  return (
    <OtpInput
      value={val}
      length={length}
      size={size}
      disabled={disabled}
      autoFocus={autoFocus}
      error={error}
      onChange={(next) => {
        setVal(next)
        onChange?.(next)
      }}
    />
  )
}

describe('OtpInput Component', () => {
  it('renders the correct number of input slots with accessible labels', () => {
    render(<ControlledOtp length={6} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(6)
    expect(inputs[0]).toHaveAttribute('aria-label', 'OTP digit 1 of 6')
    expect(inputs[5]).toHaveAttribute('aria-label', 'OTP digit 6 of 6')
  })

  it('allows typing digits and auto-advances focus to next slot', async () => {
    const user = userEvent.setup()
    render(<ControlledOtp length={4} />)
    const inputs = screen.getAllByRole('textbox')

    await user.type(inputs[0], '1')
    expect(inputs[0]).toHaveValue('1')
    expect(inputs[1]).toHaveFocus()

    await user.type(inputs[1], '2')
    expect(inputs[1]).toHaveValue('2')
    expect(inputs[2]).toHaveFocus()
  })

  it('ignores non-digit inputs', async () => {
    const user = userEvent.setup()
    render(<ControlledOtp length={4} />)
    const inputs = screen.getAllByRole('textbox')

    await user.type(inputs[0], 'a')
    expect(inputs[0]).toHaveValue('')
  })

  it('navigates back on Backspace when empty', async () => {
    const user = userEvent.setup()
    render(<ControlledOtp length={4} />)
    const inputs = screen.getAllByRole('textbox')

    await user.type(inputs[0], '1')
    expect(inputs[1]).toHaveFocus()

    await user.keyboard('{Backspace}')
    expect(inputs[0]).toHaveFocus()
  })

  it('clears current digit on Backspace when filled without navigating back', async () => {
    const user = userEvent.setup()
    render(<ControlledOtp length={4} />)
    const inputs = screen.getAllByRole('textbox')

    await user.type(inputs[0], '5')
    inputs[0].focus()
    await user.keyboard('{Backspace}')
    expect(inputs[0]).toHaveValue('')
  })

  it('navigates with ArrowLeft and ArrowRight keys', async () => {
    const user = userEvent.setup()
    render(<ControlledOtp length={4} />)
    const inputs = screen.getAllByRole('textbox')

    inputs[1].focus()
    expect(inputs[1]).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(inputs[0]).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(inputs[1]).toHaveFocus()
  })

  it('pastes full OTP text and distributes across slots', () => {
    const handleChange = vi.fn()
    render(<ControlledOtp length={6} onChange={handleChange} />)
    const inputs = screen.getAllByRole('textbox')

    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => '987654',
      },
    })

    expect(handleChange).toHaveBeenCalledWith(['9', '8', '7', '6', '5', '4'])
  })

  it('disables all slots when disabled prop is true', () => {
    render(<ControlledOtp length={4} disabled />)
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach((input) => {
      expect(input).toBeDisabled()
    })
  })

  it('handles autoFocus on mount', () => {
    render(<ControlledOtp length={4} autoFocus />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveFocus()
  })

  it('exposes focus and clear methods via ref', () => {
    const ref = createRef<OtpInputRef>()
    const handleChange = vi.fn()
    render(
      <OtpInput
        ref={ref}
        value={['1', '2', '3', '4']}
        length={4}
        onChange={handleChange}
      />
    )

    ref.current?.focus(2)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[2]).toHaveFocus()

    ref.current?.clear()
    expect(handleChange).toHaveBeenCalledWith(['', '', '', ''])
    expect(inputs[0]).toHaveFocus()
  })

  it('supports Compound API with OtpInput.Slot and OtpInput.Separator', () => {
    const handleChange = vi.fn()
    render(
      <OtpInput value={['1', '2', '3', '4']} length={4} onChange={handleChange}>
        <OtpSlot index={0} />
        <OtpSlot index={1} />
        <OtpSeparator>–</OtpSeparator>
        <OtpSlot index={2} />
        <OtpSlot index={3} />
      </OtpInput>
    )

    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(4)
    expect(screen.getByText('–')).toBeInTheDocument()
  })

  it('applies error styling when error prop is passed', () => {
    render(<ControlledOtp length={4} error="Mã OTP không hợp lệ" />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveClass('border-status-danger-border')
  })

  it('renders semantic fieldset, legend, and ol list for slots', () => {
    render(<ControlledOtp length={4} />)
    const fieldset = screen.getByRole('group', { name: 'Mã xác thực một lần (OTP)' })
    expect(fieldset.tagName.toLowerCase()).toBe('fieldset')
    const list = screen.getByRole('list')
    expect(list.tagName.toLowerCase()).toBe('ol')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(4)
  })
})
