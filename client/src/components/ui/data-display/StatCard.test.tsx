import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DollarSign } from 'lucide-react'
import { StatCard } from './StatCard'
import { TONES } from '@/lib/variants'

describe('StatCard UI Component', () => {
  it('renders icon, label, and value', () => {
    render(
      <StatCard
        icon={<DollarSign data-testid="stat-icon" />}
        label="Tổng doanh thu"
        value="120.000.000 đ"
      />
    )

    expect(screen.getByTestId('stat-icon')).toBeInTheDocument()
    expect(screen.getByText('Tổng doanh thu')).toBeInTheDocument()
    expect(screen.getByText('120.000.000 đ')).toBeInTheDocument()
  })

  it('renders hint text when provided', () => {
    render(
      <StatCard
        icon={<DollarSign />}
        label="Doanh thu"
        value="10.000.000 đ"
        hint="Tăng 12% so với tháng trước"
      />
    )

    expect(screen.getByText('Tăng 12% so với tháng trước')).toBeInTheDocument()
  })

  it('supports all semantic tones for icon background', () => {
    for (const tone of TONES) {
      const { container, unmount } = render(
        <StatCard
          icon={<DollarSign />}
          label="Test Tone"
          value="100"
          tone={tone}
        />
      )
      expect(container.firstChild).toBeInTheDocument()
      unmount()
    }
  })

  it('supports legacy accent={false} by defaulting to neutral tone', () => {
    const { container } = render(
      <StatCard
        icon={<DollarSign />}
        label="Hội viên mới"
        value="25"
        accent={false}
      />
    )
    expect(container.querySelector('.bg-surface-sunken')).toBeInTheDocument()
  })

  it('renders positive and negative trend badges', () => {
    const { unmount } = render(
      <StatCard
        icon={<DollarSign />}
        label="Tăng trưởng"
        value="50"
        trend={{ value: '15%', isPositive: true }}
      />
    )
    expect(screen.getByText('+15%')).toBeInTheDocument()
    unmount()

    render(
      <StatCard
        icon={<DollarSign />}
        label="Giảm sút"
        value="30"
        trend={{ value: '8%', isPositive: false }}
      />
    )
    expect(screen.getByText('8%')).toBeInTheDocument()
  })

  it('renders skeleton pulse when loading is true', () => {
    const { container } = render(
      <StatCard
        icon={<DollarSign />}
        label="Loading Stat"
        value="0"
        loading
      />
    )

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.queryByText('Loading Stat')).not.toBeInTheDocument()
  })

  it('renders React Router Link when `to` prop is provided', () => {
    render(
      <MemoryRouter>
        <StatCard
          icon={<DollarSign />}
          label="Link Stat"
          value="500"
          to="/reports/revenue"
        />
      </MemoryRouter>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/reports/revenue')
  })

  it('supports forwardRef to underlying HTMLElement', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <StatCard
        ref={ref}
        icon={<DollarSign />}
        label="Ref Stat"
        value="1"
      />
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })
})
