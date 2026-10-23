import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Chip } from './Chip'

describe('Chip Component', () => {
  it('renders label correctly', () => {
    render(<Chip label="Cardio" />)
    expect(screen.getByText('Cardio')).toBeInTheDocument()
  })

  it('triggers onClick when clicked as interactive chip', () => {
    const handleClick = vi.fn()
    render(<Chip label="Strength" onClick={handleClick} />)

    const chip = screen.getByText('Strength')
    fireEvent.click(chip)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders remove button and calls onRemove', () => {
    const handleRemove = vi.fn()
    render(<Chip label="Removable" removable onRemove={handleRemove} />)

    const removeBtn = screen.getByRole('button', { name: 'Xóa' })
    expect(removeBtn).toBeInTheDocument()
    fireEvent.click(removeBtn)
    expect(handleRemove).toHaveBeenCalledTimes(1)
  })

  it('applies semantic tone classes and emphasis levels', () => {
    const { rerender } = render(<Chip label="Success Subtle" tone="success" emphasis="subtle" />)
    let chipEl = screen.getByText('Success Subtle').parentElement
    expect(chipEl).toHaveClass('bg-status-success-bg', 'text-status-success-fg')

    rerender(<Chip label="Success Solid" tone="success" emphasis="solid" />)
    chipEl = screen.getByText('Success Solid').parentElement
    expect(chipEl).toHaveClass('bg-status-success-solid', 'text-status-success-on-solid')

    rerender(<Chip label="Success Outline" tone="success" emphasis="outline" />)
    chipEl = screen.getByText('Success Outline').parentElement
    expect(chipEl).toHaveClass('bg-transparent', 'border-status-success-border', 'text-status-success-fg')
  })

  it('automatically maps selected=true to solid emphasis', () => {
    render(<Chip label="Selected Chip" tone="accent" selected onClick={vi.fn()} />)
    const buttonEl = screen.getByRole('button', { name: 'Selected Chip' })
    expect(buttonEl).toHaveAttribute('aria-pressed', 'true')
    expect(buttonEl).toHaveClass('bg-action-accent', 'text-fg-on-solid')
  })

  it('renders different size scales: xs, sm, md, lg', () => {
    const { rerender } = render(<Chip label="Size XS" size="xs" />)
    let el = screen.getByText('Size XS').parentElement
    expect(el).toHaveClass('h-5', 'text-[10px]')

    rerender(<Chip label="Size LG" size="lg" />)
    el = screen.getByText('Size LG').parentElement
    expect(el).toHaveClass('h-8', 'text-sm')
  })
})
