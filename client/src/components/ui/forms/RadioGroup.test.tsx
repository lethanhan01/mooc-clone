import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { RadioGroup, RadioItem, RadioCard } from './RadioGroup'

// ── Controlled wrapper helper ─────────────────────────────────────────────────
function ControlledGroup({
  initial = '',
  disabled = false,
  size,
  orientation,
  onChange,
}: {
  initial?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'vertical' | 'horizontal'
  onChange?: (val: string) => void
}) {
  const [val, setVal] = useState(initial)
  return (
    <RadioGroup
      name="test-group"
      value={val}
      onValueChange={(v) => {
        setVal(v)
        onChange?.(v)
      }}
      disabled={disabled}
      size={size}
      orientation={orientation}
      aria-label="Nhóm lựa chọn"
    >
      <RadioItem value="a" id="r-a" label="Tùy chọn A" />
      <RadioItem value="b" id="r-b" label="Tùy chọn B" />
      <RadioItem value="c" id="r-c" label="Tùy chọn C" disabled />
    </RadioGroup>
  )
}

describe('RadioGroup Component', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders all items with role="radio"', () => {
    render(<ControlledGroup />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
  })

  it('renders correct labels for each item', () => {
    render(<ControlledGroup />)
    expect(screen.getByText('Tùy chọn A')).toBeInTheDocument()
    expect(screen.getByText('Tùy chọn B')).toBeInTheDocument()
    expect(screen.getByText('Tùy chọn C')).toBeInTheDocument()
  })

  it('has radiogroup role on root element', () => {
    render(<ControlledGroup />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('applies aria-label to radiogroup', () => {
    render(<ControlledGroup />)
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Nhóm lựa chọn')
  })

  // ── Controlled selection ───────────────────────────────────────────────────

  it('reflects pre-selected value', () => {
    render(<ControlledGroup initial="b" />)
    const radioB = screen.getByRole('radio', { name: 'Tùy chọn B' })
    expect(radioB).toBeChecked()
  })

  it('calls onValueChange and updates selection when item is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<ControlledGroup onChange={handleChange} />)

    await user.click(screen.getByText('Tùy chọn A'))
    expect(handleChange).toHaveBeenCalledWith('a')
    expect(screen.getByRole('radio', { name: 'Tùy chọn A' })).toBeChecked()
  })

  // ── Uncontrolled (defaultValue) ────────────────────────────────────────────

  it('works with uncontrolled defaultValue', async () => {
    const user = userEvent.setup()
    render(
      <RadioGroup name="uncontrolled" defaultValue="a" aria-label="Test">
        <RadioItem value="a" id="uc-a" label="Alpha" />
        <RadioItem value="b" id="uc-b" label="Beta" />
      </RadioGroup>
    )
    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeChecked()
    await user.click(screen.getByText('Beta'))
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked()
  })

  // ── Disabled state ─────────────────────────────────────────────────────────

  it('disables all items when group is disabled', () => {
    render(<ControlledGroup disabled />)
    const radios = screen.getAllByRole('radio')
    for (const radio of radios) {
      expect(radio).toBeDisabled()
    }
  })

  it('does not call onValueChange when a disabled item is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<ControlledGroup onChange={handleChange} />)
    await user.click(screen.getByText('Tùy chọn C'))
    expect(handleChange).not.toHaveBeenCalled()
  })

  // ── tabIndex / ARIA (W3C APG roving tabindex) ─────────────────────────────

  it('gives tabIndex=0 to the currently selected radio', () => {
    render(<ControlledGroup initial="b" />)
    const radioB = screen.getByRole('radio', { name: 'Tùy chọn B' })
    expect(radioB).toHaveAttribute('tabIndex', '0')
  })

  it('gives tabIndex=-1 to non-selected radios', () => {
    render(<ControlledGroup initial="a" />)
    const radioB = screen.getByRole('radio', { name: 'Tùy chọn B' })
    expect(radioB).toHaveAttribute('tabIndex', '-1')
  })

  // ── RadioCard ──────────────────────────────────────────────────────────────

  it('renders RadioCard with title and description', () => {
    render(
      <RadioGroup name="cards" value="card1" onValueChange={() => {}} aria-label="Gói tập">
        <RadioCard value="card1" title="Gói VIP 12 Tháng" description="Đầy đủ tiện ích và PT cá nhân" />
        <RadioCard value="card2" title="Gói Standard 6 Tháng" description="Tập tự do không giới hạn giờ" />
      </RadioGroup>
    )
    expect(screen.getByText('Gói VIP 12 Tháng')).toBeInTheDocument()
    expect(screen.getByText('Đầy đủ tiện ích và PT cá nhân')).toBeInTheDocument()
  })

  it('selects RadioCard when clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <RadioGroup name="cards" value="card1" onValueChange={handleChange} aria-label="Gói tập">
        <RadioCard value="card1" title="Gói VIP" />
        <RadioCard value="card2" title="Gói Standard" />
      </RadioGroup>
    )
    await user.click(screen.getByText('Gói Standard'))
    expect(handleChange).toHaveBeenCalledWith('card2')
  })

  it('renders RadioCard with badge and icon', () => {
    render(
      <RadioGroup name="cards" value="" onValueChange={() => {}} aria-label="Gói tập">
        <RadioCard
          value="vip"
          title="VIP"
          badge={<span data-testid="badge">HOT</span>}
          icon={<span data-testid="icon">★</span>}
        />
      </RadioGroup>
    )
    expect(screen.getByTestId('badge')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  // ── Orientation ────────────────────────────────────────────────────────────

  it('applies horizontal orientation class', () => {
    render(<ControlledGroup orientation="horizontal" />)
    const group = screen.getByRole('radiogroup')
    expect(group.className).toContain('flex-row')
  })

  it('applies vertical orientation class (default)', () => {
    render(<ControlledGroup />)
    const group = screen.getByRole('radiogroup')
    expect(group.className).toContain('flex-col')
  })

  // ── Compound API ─────────────────────────────────────────────────────────

  it('supports compound API with children', () => {
    render(
      <RadioGroup name="compound" value="x" onValueChange={() => {}} aria-label="Compound">
        <RadioItem value="x" id="cmp-x">
          <input type="radio" id="cmp-x" name="compound" className="peer sr-only" defaultChecked />
          <span>Compound item</span>
        </RadioItem>
      </RadioGroup>
    )
    expect(screen.getByText('Compound item')).toBeInTheDocument()
  })

  // ── keyboard navigation ────────────────────────────────────────────────────

  it('fires onValueChange with Space key on a radio item', () => {
    const handleChange = vi.fn()
    render(
      <RadioGroup name="kb" value="" onValueChange={handleChange} aria-label="KB test">
        <RadioItem value="x" id="kb-x" label="X Item" />
      </RadioGroup>
    )
    const radio = screen.getByRole('radio', { name: 'X Item' })
    fireEvent.keyDown(radio, { key: ' ', code: 'Space' })
    expect(handleChange).toHaveBeenCalledWith('x')
  })
})
