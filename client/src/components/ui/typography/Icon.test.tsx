import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Check, Heart } from 'lucide-react'
import { Icon, type IconSize } from './Icon'
import type { FgRole, Tone } from '@/lib/variants'

describe('Icon UI Primitive Component', () => {
  it('renders default icon with size md (20px) and aria-hidden="true" when no label is provided', () => {
    const { container } = render(<Icon icon={Check} data-testid="test-icon" />)
    const svg = container.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('height', '20')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
    expect(svg).not.toHaveAttribute('aria-label')
  })

  it('renders with accessibility attributes when label is provided', () => {
    const { container } = render(<Icon icon={Heart} label="Thích bài viết" />)
    const svg = container.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).toHaveAttribute('aria-label', 'Thích bài viết')
    expect(svg).not.toHaveAttribute('aria-hidden')
    expect(screen.getByRole('img', { name: 'Thích bài viết' })).toBe(svg)
  })

  it('correctly maps predefined size presets to pixel dimensions', () => {
    const sizeMap: Record<IconSize, string> = {
      xs: '14',
      sm: '16',
      md: '20',
      lg: '24',
      xl: '32',
    }

    for (const [size, expectedPx] of Object.entries(sizeMap)) {
      const { container } = render(
        <Icon icon={Check} size={size as IconSize} data-testid={`icon-${size}`} />
      )
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', expectedPx)
      expect(svg).toHaveAttribute('height', expectedPx)
    }
  })

  it('supports custom numeric size', () => {
    const { container } = render(<Icon icon={Check} size={48} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
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
      const { container } = render(
        <Icon icon={Check} fg={fg as FgRole} />
      )
      const svg = container.querySelector('svg')
      if (expectedClass) {
        expect(svg).toHaveClass(expectedClass)
      }
    }
  })

  it('applies correct tone status classes', () => {
    const toneClassMap: Record<Tone, string> = {
      accent: 'text-action-accent',
      success: 'text-status-success-fg',
      warning: 'text-status-warning-fg',
      danger: 'text-status-danger-fg',
      info: 'text-status-info-fg',
      neutral: 'text-fg-muted',
    }

    for (const [tone, expectedClass] of Object.entries(toneClassMap)) {
      const { container } = render(
        <Icon icon={Check} tone={tone as Tone} />
      )
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass(expectedClass)
    }
  })

  it('gives tone precedence over fg when both are provided', () => {
    const { container } = render(
      <Icon icon={Check} fg="primary" tone="danger" />
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-status-danger-fg')
    expect(svg).not.toHaveClass('text-fg-primary')
  })

  it('merges custom className without losing tone classes', () => {
    const { container } = render(
      <Icon icon={Check} tone="accent" className="custom-spin-class" />
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-action-accent')
    expect(svg).toHaveClass('custom-spin-class')
  })

  it('forwards ref to the underlying SVG element', () => {
    const ref = React.createRef<SVGSVGElement>()
    render(<Icon icon={Check} ref={ref} />)
    expect(ref.current).toBeInstanceOf(SVGElement)
  })
})
