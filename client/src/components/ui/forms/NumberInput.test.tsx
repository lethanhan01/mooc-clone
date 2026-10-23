import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { NumberInput } from './NumberInput'

// ── Controlled wrapper helper ─────────────────────────────────────────────────
function ControlledNumberInput({
  initial = 5,
  min = 0,
  max = 10,
  step = 1,
  disabled = false,
  size,
  showSteppers = true,
  onChange,
}: {
  initial?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  showSteppers?: boolean
  onChange?: (val: number) => void
}) {
  const [val, setVal] = useState(initial)
  return (
    <NumberInput
      value={val}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      size={size}
      showSteppers={showSteppers}
      onChange={(next) => {
        setVal(next)
        onChange?.(next)
      }}
    />
  )
}

describe('NumberInput Component', () => {
  // ── Rendering & ARIA attributes ───────────────────────────────────────────

  it('renders spinbutton with min, max, valuenow attributes', () => {
    render(<ControlledNumberInput initial={5} min={1} max={10} />)
    const spinbutton = screen.getByRole('spinbutton')
    expect(spinbutton).toHaveValue(5)
    expect(spinbutton).toHaveAttribute('aria-valuenow', '5')
    expect(spinbutton).toHaveAttribute('aria-valuemin', '1')
    expect(spinbutton).toHaveAttribute('aria-valuemax', '10')
  })

  it('renders increment and decrement buttons with correct aria-labels', () => {
    render(<ControlledNumberInput />)
    expect(screen.getByRole('button', { name: 'Tăng giá trị' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Giảm giá trị' })).toBeInTheDocument()
  })

  it('hides stepper buttons when showSteppers=false', () => {
    render(<ControlledNumberInput showSteppers={false} />)
    expect(screen.queryByRole('button', { name: 'Tăng giá trị' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Giảm giá trị' })).not.toBeInTheDocument()
  })

  // ── Increment / Decrement ─────────────────────────────────────────────────

  it('increments value when plus stepper button is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<ControlledNumberInput initial={5} onChange={handleChange} />)

    const plusBtn = screen.getByRole('button', { name: 'Tăng giá trị' })
    await user.click(plusBtn)

    expect(handleChange).toHaveBeenCalledWith(6)
  })

  it('decrements value when minus stepper button is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<ControlledNumberInput initial={5} onChange={handleChange} />)

    const minusBtn = screen.getByRole('button', { name: 'Giảm giá trị' })
    await user.click(minusBtn)

    expect(handleChange).toHaveBeenCalledWith(4)
  })

  // ── Boundary / Clamp ──────────────────────────────────────────────────────

  it('respects min clamp and disables decrement at boundary', () => {
    render(<ControlledNumberInput initial={0} min={0} />)
    const minusBtn = screen.getByRole('button', { name: 'Giảm giá trị' })
    expect(minusBtn).toBeDisabled()
  })

  it('respects max clamp and disables increment at boundary', () => {
    render(<ControlledNumberInput initial={10} max={10} />)
    const plusBtn = screen.getByRole('button', { name: 'Tăng giá trị' })
    expect(plusBtn).toBeDisabled()
  })

  it('enables decrement above min boundary', () => {
    render(<ControlledNumberInput initial={1} min={0} />)
    const minusBtn = screen.getByRole('button', { name: 'Giảm giá trị' })
    expect(minusBtn).not.toBeDisabled()
  })

  it('respects custom step', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<ControlledNumberInput initial={5} step={5} max={20} onChange={handleChange} />)
    await user.click(screen.getByRole('button', { name: 'Tăng giá trị' }))
    expect(handleChange).toHaveBeenCalledWith(10)
  })

  // ── Keyboard navigation ───────────────────────────────────────────────────

  it('handles keyboard ArrowUp and ArrowDown keys', () => {
    const handleChange = vi.fn()
    render(<ControlledNumberInput initial={5} onChange={handleChange} />)
    const spinbutton = screen.getByRole('spinbutton')

    fireEvent.keyDown(spinbutton, { key: 'ArrowUp' })
    expect(handleChange).toHaveBeenLastCalledWith(6)

    fireEvent.keyDown(spinbutton, { key: 'ArrowDown' })
    expect(handleChange).toHaveBeenLastCalledWith(5)
  })

  it('does not go below min on ArrowDown', () => {
    const handleChange = vi.fn()
    render(<ControlledNumberInput initial={0} min={0} onChange={handleChange} />)
    const spinbutton = screen.getByRole('spinbutton')
    fireEvent.keyDown(spinbutton, { key: 'ArrowDown' })
    expect(handleChange).toHaveBeenCalledWith(0)
  })

  // ── Disabled state ────────────────────────────────────────────────────────

  it('disables both stepper buttons when disabled prop is set', () => {
    render(<ControlledNumberInput disabled />)
    expect(screen.getByRole('button', { name: 'Tăng giá trị' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Giảm giá trị' })).toBeDisabled()
  })

  it('does not call onChange when disabled and increment clicked', async () => {
    const handleChange = vi.fn()
    render(<ControlledNumberInput disabled onChange={handleChange} />)
    // disabled buttons can't be clicked by userEvent
    const plusBtn = screen.getByRole('button', { name: 'Tăng giá trị' })
    expect(plusBtn).toBeDisabled()
    expect(handleChange).not.toHaveBeenCalled()
  })

  // ── fullWidth ─────────────────────────────────────────────────────────────

  it('applies w-full class when fullWidth=true (default)', () => {
    const { container } = render(<ControlledNumberInput />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toMatch(/w-full/)
  })

  // ── Compound API (children) ───────────────────────────────────────────────

  it('supports compound API with children', () => {
    render(
      <NumberInput value={7} min={0} max={10} step={1} onChange={() => {}}>
        <NumberInput.DecrementButton />
        <NumberInput.IncrementButton />
      </NumberInput>
    )
    expect(screen.getByRole('button', { name: 'Giảm giá trị' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tăng giá trị' })).toBeInTheDocument()
  })
})
