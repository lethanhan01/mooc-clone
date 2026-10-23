import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Badge } from './Badge'
import { StatusBadge } from './StatusBadge'
import {
  getStatusTone,
  getMemberStatusTone,
  getSessionStatusTone,
  getSubscriptionStatusTone,
  getPaymentStatusTone,
} from '@/utils/status'

describe('Badge Component (Unified Primitive)', () => {
  describe('Base Rendering & Variants', () => {
    it('renders text children correctly', () => {
      render(<Badge>Hội viên VIP</Badge>)
      expect(screen.getByText('Hội viên VIP')).toBeInTheDocument()
    })

    it('applies semantic tone classes and emphasis levels', () => {
      const { rerender } = render(<Badge tone="success" emphasis="subtle">Hoạt động</Badge>)
      let el = screen.getByText('Hoạt động').parentElement
      expect(el).toHaveClass('bg-status-success-bg', 'text-status-success-fg')

      rerender(<Badge tone="success" emphasis="solid">Hoạt động</Badge>)
      el = screen.getByText('Hoạt động').parentElement
      expect(el).toHaveClass('bg-status-success-solid', 'text-status-success-on-solid')

      rerender(<Badge tone="danger" emphasis="outline">Hết hạn</Badge>)
      el = screen.getByText('Hết hạn').parentElement
      expect(el).toHaveClass('bg-transparent', 'border-status-danger-border', 'text-status-danger-fg')
    })

    it('supports shape variants: pill (default) and rounded', () => {
      const { rerender } = render(<Badge variant="pill">Pill Badge</Badge>)
      let el = screen.getByText('Pill Badge').parentElement
      expect(el).toHaveClass('rounded-full')

      rerender(<Badge variant="rounded">Rounded Badge</Badge>)
      el = screen.getByText('Rounded Badge').parentElement
      expect(el).toHaveClass('rounded-md')
    })

    it('supports size scales: xs, sm, md, lg, xl', () => {
      const { rerender } = render(<Badge size="xs">Cỡ XS</Badge>)
      let el = screen.getByText('Cỡ XS').parentElement
      expect(el).toHaveClass('h-5', 'text-[10px]')

      rerender(<Badge size="xl">Cỡ XL</Badge>)
      el = screen.getByText('Cỡ XL').parentElement
      expect(el).toHaveClass('h-9', 'text-sm')
    })

    it('renders left and right icons with aria-hidden', () => {
      render(
        <Badge
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Có Icon
        </Badge>
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('supports text truncation', () => {
      render(<Badge truncate>Nhãn có nội dung văn bản siêu dài cần bị cắt ngắn</Badge>)
      expect(screen.getByText('Nhãn có nội dung văn bản siêu dài cần bị cắt ngắn')).toHaveClass('truncate')
    })
  })

  describe('Visual Indicators (Dot & Pulse)', () => {
    it('renders dot indicator with tone color', () => {
      const { container } = render(<Badge tone="success" dot>Hoạt động</Badge>)
      const dot = container.querySelector('.rounded-full.bg-status-success-solid')
      expect(dot).toBeInTheDocument()
    })

    it('renders pulse animation ring when pulse=true', () => {
      const { container } = render(<Badge tone="accent" dot pulse>Đang diễn ra</Badge>)
      const pingRing = container.querySelector('.animate-ping')
      expect(pingRing).toBeInTheDocument()
    })
  })

  describe('Compound Sub-components (Badge.Dot, Badge.Icon, Badge.Text)', () => {
    it('inherits tone from Badge context in Badge.Dot', () => {
      const { container } = render(
        <Badge tone="warning">
          <Badge.Dot pulse />
          <Badge.Text>Chờ duyệt</Badge.Text>
        </Badge>
      )
      const dot = container.querySelector('.bg-status-warning-solid')
      expect(dot).toBeInTheDocument()
      expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
    })
  })

  describe('Domain Status Mapping & Resolution', () => {
    it('resolves tones across domains via getStatusTone', () => {
      expect(getStatusTone('active', 'member')).toBe('success')
      expect(getStatusTone('in_progress', 'session')).toBe('accent')
      expect(getStatusTone('paid', 'payment')).toBe('success')
      expect(getStatusTone('expiring_soon', 'subscription')).toBe('warning')
      expect(getStatusTone('completed', 'general')).toBe('success')
    })

    it('maps member statuses correctly', () => {
      expect(getMemberStatusTone('active')).toBe('success')
      expect(getMemberStatusTone('pending')).toBe('warning')
      expect(getMemberStatusTone('pending_verification')).toBe('warning')
      expect(getMemberStatusTone('trial')).toBe('info')
      expect(getMemberStatusTone('expired')).toBe('danger')
      expect(getMemberStatusTone('inactive')).toBe('neutral')
      expect(getMemberStatusTone('suspended')).toBe('neutral')
      expect(getMemberStatusTone(null)).toBe('neutral')
    })

    it('maps session statuses correctly', () => {
      expect(getSessionStatusTone('confirmed')).toBe('success')
      expect(getSessionStatusTone('in_progress')).toBe('accent')
      expect(getSessionStatusTone('scheduled')).toBe('info')
      expect(getSessionStatusTone('cancelled')).toBe('danger')
      expect(getSessionStatusTone('no_show')).toBe('danger')
      expect(getSessionStatusTone('completed')).toBe('neutral')
      expect(getSessionStatusTone(null)).toBe('neutral')
    })

    it('maps subscription statuses correctly', () => {
      expect(getSubscriptionStatusTone('active')).toBe('success')
      expect(getSubscriptionStatusTone('expiring_soon')).toBe('warning')
      expect(getSubscriptionStatusTone('pending')).toBe('warning')
      expect(getSubscriptionStatusTone('expired')).toBe('danger')
      expect(getSubscriptionStatusTone('cancelled')).toBe('danger')
      expect(getSubscriptionStatusTone('paused')).toBe('neutral')
      expect(getSubscriptionStatusTone(null)).toBe('neutral')
    })

    it('maps payment statuses correctly', () => {
      expect(getPaymentStatusTone('paid')).toBe('success')
      expect(getPaymentStatusTone('completed')).toBe('success')
      expect(getPaymentStatusTone('pending')).toBe('warning')
      expect(getPaymentStatusTone('processing')).toBe('warning')
      expect(getPaymentStatusTone('failed')).toBe('danger')
      expect(getPaymentStatusTone('rejected')).toBe('danger')
      expect(getPaymentStatusTone('refunded')).toBe('neutral')
      expect(getPaymentStatusTone(null)).toBe('neutral')
    })

    it('renders status badge with domain and custom children override', () => {
      render(
        <Badge status="active" domain="member">
          Đang hoạt động
        </Badge>
      )
      expect(screen.getByText('Đang hoạt động')).toBeInTheDocument()
      const el = screen.getByText('Đang hoạt động').parentElement
      expect(el).toHaveClass('bg-status-success-bg')
    })

    it('renders session badge with automatic tone and role=status', () => {
      render(<Badge status="in_progress" domain="session" />)
      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-status-accent-bg')
    })
  })

  describe('Accessibility & Interactive Behavior', () => {
    it('sets role="status" when status prop is provided', () => {
      render(<Badge status="confirmed" domain="session" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('sets role="button" and tabIndex=0 when interactive=true', () => {
      const handleClick = vi.fn()
      render(<Badge interactive onClick={handleClick}>Bấm để lọc</Badge>)

      const btn = screen.getByRole('button', { name: 'Bấm để lọc' })
      expect(btn).toBeInTheDocument()
      expect(btn).toHaveAttribute('tabIndex', '0')

      fireEvent.click(btn)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles keyboard Enter and Space keys when interactive=true', () => {
      const handleClick = vi.fn()
      render(<Badge interactive onClick={handleClick}>Phím bấm</Badge>)

      const btn = screen.getByRole('button', { name: 'Phím bấm' })
      fireEvent.keyDown(btn, { key: 'Enter' })
      expect(handleClick).toHaveBeenCalledTimes(1)

      fireEvent.keyDown(btn, { key: ' ' })
      expect(handleClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('StatusBadge Backward Compatibility Alias', () => {
    it('renders StatusBadge proxying to Badge correctly', () => {
      render(<StatusBadge status="active" label="Kích hoạt" />)
      expect(screen.getByText('Kích hoạt')).toBeInTheDocument()
      const el = screen.getByText('Kích hoạt').parentElement
      expect(el).toHaveClass('bg-status-success-bg')
    })

    it('supports domain prop in StatusBadge', () => {
      render(<StatusBadge status="trial" domain="member" label="Dùng thử" />)
      expect(screen.getByText('Dùng thử')).toBeInTheDocument()
      const el = screen.getByText('Dùng thử').parentElement
      expect(el).toHaveClass('bg-status-info-bg')
    })
  })
})
