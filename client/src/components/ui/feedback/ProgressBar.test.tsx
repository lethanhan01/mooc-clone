import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar Component', () => {
  it('renders progressbar with label and calculated percentage', () => {
    render(<ProgressBar value={75} max={100} label="Tiến độ tập luyện" showValue />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeInTheDocument()
    expect(progressbar).toHaveAttribute('aria-valuenow', '75')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    expect(screen.getByText('Tiến độ tập luyện')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('clamps value within bounds 0 and max', () => {
    render(<ProgressBar value={150} max={100} showValue />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('supports custom value formatter', () => {
    render(
      <ProgressBar
        value={3}
        max={10}
        showValue
        valueFormatter={(val, pct) => `${val}/10 buổi (${pct}%)`}
      />
    )
    expect(screen.getByText('3/10 buổi (30%)')).toBeInTheDocument()
  })

  it('supports forwardRef', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ProgressBar ref={ref} value={50} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('renders semantic tones correctly: accent, neutral, danger, warning', () => {
    const { rerender } = render(<ProgressBar value={40} tone="accent" />)
    let indicator = screen.getByRole('progressbar').firstElementChild
    expect(indicator).toHaveClass('bg-action-accent')

    rerender(<ProgressBar value={40} tone="neutral" />)
    indicator = screen.getByRole('progressbar').firstElementChild
    expect(indicator).toHaveClass('bg-fg-muted')

    rerender(<ProgressBar value={40} tone="danger" />)
    indicator = screen.getByRole('progressbar').firstElementChild
    expect(indicator).toHaveClass('bg-status-danger-solid')

    rerender(<ProgressBar value={40} tone="warning" />)
    indicator = screen.getByRole('progressbar').firstElementChild
    expect(indicator).toHaveClass('bg-status-warning-solid')
  })

  it('applies standard height scale for sizes: xs, sm, md, lg, xl', () => {
    const { rerender } = render(<ProgressBar value={50} size="xs" />)
    expect(screen.getByRole('progressbar')).toHaveClass('h-1')

    rerender(<ProgressBar value={50} size="sm" />)
    expect(screen.getByRole('progressbar')).toHaveClass('h-1.5')

    rerender(<ProgressBar value={50} size="md" />)
    expect(screen.getByRole('progressbar')).toHaveClass('h-2')

    rerender(<ProgressBar value={50} size="lg" />)
    expect(screen.getByRole('progressbar')).toHaveClass('h-3')

    rerender(<ProgressBar value={50} size="xl" />)
    expect(screen.getByRole('progressbar')).toHaveClass('h-4')
  })
})

