import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LineIcon, type LineIconSize } from './LineIcon'
import type { FgRole, Tone } from '@/lib/variants'

describe('LineIcon UI Primitive Component', () => {
  it('renders default icon with size md (20px) and aria-hidden="true" when no label is provided', () => {
    const { container } = render(<LineIcon data-testid="line-icon" />)
    const svg = container.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('height', '20')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
    expect(svg).not.toHaveAttribute('role')
    expect(svg).not.toHaveAttribute('aria-label')
    expect(container.querySelector('title')).toBeNull()
  })

  it('renders with accessibility attributes and <title> when label is provided', () => {
    const { container } = render(<LineIcon label="Liên kết tài khoản LINE" />)
    const svg = container.querySelector('svg')
    const title = container.querySelector('title')

    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).toHaveAttribute('aria-label', 'Liên kết tài khoản LINE')
    expect(svg).not.toHaveAttribute('aria-hidden')
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Liên kết tài khoản LINE')
    expect(screen.getByRole('img', { name: 'Liên kết tài khoản LINE' })).toBe(svg)
  })

  it('correctly maps predefined size presets to pixel dimensions', () => {
    const sizeMap: Record<LineIconSize, string> = {
      xs: '14',
      sm: '16',
      md: '20',
      lg: '24',
      xl: '32',
    }

    for (const [size, expectedPx] of Object.entries(sizeMap)) {
      const { container } = render(
        <LineIcon size={size as LineIconSize} data-testid={`line-icon-${size}`} />
      )
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', expectedPx)
      expect(svg).toHaveAttribute('height', expectedPx)
    }
  })

  it('supports custom numeric size', () => {
    const { container } = render(<LineIcon size={36} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '36')
    expect(svg).toHaveAttribute('height', '36')
  })

  it('applies correct fg role classes', () => {
    const fgClassMap: Record<FgRole, string> = {
      primary: 'text-fg-primary',
      secondary: 'text-fg-secondary',
      muted: 'text-fg-muted',
      dim: 'text-fg-subtle',
      faint: 'text-fg-disabled',
      inherit: '',
    }

    for (const [fg, expectedClass] of Object.entries(fgClassMap)) {
      const { container } = render(<LineIcon fg={fg as FgRole} />)
      const svg = container.querySelector('svg')
      if (expectedClass) {
        expect(svg).toHaveClass(expectedClass)
      }
    }
  })

  it('applies correct tone classes and prioritizes tone over fg', () => {
    const toneClassMap: Record<Tone, string> = {
      accent: 'text-action-accent',
      success: 'text-status-success-fg',
      warning: 'text-status-warning-fg',
      danger: 'text-status-danger-fg',
      info: 'text-status-info-fg',
      neutral: 'text-fg-muted',
    }

    for (const [tone, expectedClass] of Object.entries(toneClassMap)) {
      const { container } = render(<LineIcon tone={tone as Tone} fg="primary" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass(expectedClass)
      expect(svg).not.toHaveClass('text-fg-primary')
    }
  })

  it('forwards ref properly to SVGSVGElement', () => {
    const ref = createRef<SVGSVGElement>()
    render(<LineIcon ref={ref} />)
    expect(ref.current).toBeInstanceOf(SVGSVGElement)
  })

  it('forwards custom className and SVG attributes', () => {
    const { container } = render(<LineIcon className="custom-class" data-custom="value" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('custom-class')
    expect(svg).toHaveAttribute('data-custom', 'value')
  })
})
