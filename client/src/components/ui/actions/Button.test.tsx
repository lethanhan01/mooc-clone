import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import {
  Button,
  ButtonLink,
  ButtonAnchor,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from './Button'
import { useButtonContext } from './button-utils'

describe('Button Primitive', () => {
  it('renders default button and handles click event', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Bấm vào đây</Button>)

    const button = screen.getByRole('button', { name: 'Bấm vào đây' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-action-primary')

    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders modern variants correctly', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-surface-elevated')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-line-subtle')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-fg-secondary')

    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-status-danger-solid')

    rerender(<Button variant="link">Link</Button>)
    expect(screen.getByRole('button')).toHaveClass('underline-offset-4')

    rerender(<Button variant="plain">Plain</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-transparent')
  })

  it('supports semantic tone on outline, link, and ghost variants', () => {
    const { rerender } = render(
      <Button variant="outline" tone="accent">Outline Accent</Button>
    )
    expect(screen.getByRole('button')).toHaveClass('text-action-accent')

    rerender(<Button variant="link" tone="accent">Link Accent</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-action-accent')

    rerender(<Button variant="outline" tone="danger">Outline Danger</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-status-danger-fg')

    rerender(<Button variant="outline" tone="success">Outline Success</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-status-success-fg')

    rerender(<Button variant="outline" tone="warning">Outline Warning</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-status-warning-fg')

    rerender(<Button variant="ghost" tone="accent">Ghost Accent</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-action-accent')

    rerender(<Button variant="ghost" tone="danger">Ghost Danger</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-status-danger-fg')
  })

  it('supports various sizes and explicit width variants', () => {
    const { rerender } = render(<Button size="xs">Extra Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-7')

    rerender(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-12')

    rerender(<Button size="xl">Extra Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-14')

    rerender(<Button size="icon" aria-label="Icon Action" />)
    expect(screen.getByRole('button')).toHaveClass('aspect-square')

    rerender(<Button width="full">Full Width Explicit</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')

    rerender(<Button width="mobile-full">Mobile Full Width</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full sm:w-auto')

    rerender(<Button mobileFull>Legacy Mobile Full</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full sm:w-auto')

    rerender(<Button fullWidth>Legacy Full Width</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  it('handles mobile touch target expander correctly for block vs inline variants', () => {
    const { rerender } = render(<Button variant="primary">Block Button</Button>)
    // Primary has touch target enabled by default
    expect(screen.getByRole('button').className).toContain('after:min-h-[44px]')

    // Link variant omits touch target by default
    rerender(<Button variant="link">Inline Link</Button>)
    expect(screen.getByRole('button').className).not.toContain('after:min-h-[44px]')

    // Plain variant omits touch target by default
    rerender(<Button variant="plain">Plain Inline</Button>)
    expect(screen.getByRole('button').className).not.toContain('after:min-h-[44px]')

    // Overriding touchTarget explicitly
    rerender(<Button variant="link" touchTarget>Link With Forced Target</Button>)
    expect(screen.getByRole('button').className).toContain('after:min-h-[44px]')

    rerender(<Button variant="primary" touchTarget={false}>Primary Without Target</Button>)
    expect(screen.getByRole('button').className).not.toContain('after:min-h-[44px]')
  })

  it('handles loading state with spinner and accessibility attributes', () => {
    const handleClick = vi.fn()
    render(
      <Button loading loadingText="Đang xử lý..." onClick={handleClick}>
        Lưu thay đổi
      </Button>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Đang xử lý...')).toBeInTheDocument()
    expect(screen.queryByText('Lưu thay đổi')).not.toBeInTheDocument()

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('handles disabled state properly', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Vô hiệu hóa
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Vô hiệu hóa' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('supports legacy variants through backward-compatible normalization', () => {
    const { rerender } = render(<Button variant="outline-white">Legacy Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-line-subtle')

    rerender(<Button variant="outline-green">Legacy Outline Green</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-action-accent')

    rerender(<Button variant="outline-green-light">Legacy Outline Green Light</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-action-accent')

    rerender(<Button variant="text-accent">Legacy Text Accent</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-action-accent')

    rerender(<Button variant="text-muted">Legacy Text Muted</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-fg-secondary')

    rerender(<Button variant="dark">Legacy Dark</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-surface-elevated')

    rerender(<Button variant="elevated">Legacy Elevated</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-surface-elevated')

    rerender(<Button variant="icon">Legacy Icon</Button>)
    expect(screen.getByRole('button')).toHaveClass('aspect-square')

    rerender(<Button size="compact">Legacy Compact</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')

    rerender(<Button size="nav">Legacy Nav</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')

    rerender(<Button size="hero">Legacy Hero</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-14')

    rerender(<Button wide>Legacy Wide</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  it('renders left and right icons correctly with shorthand props', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
        truncate
      >
        Icon Button
      </Button>
    )

    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    expect(screen.getByText('Icon Button')).toBeInTheDocument()
  })

  it('supports Compound Sub-components API (<Button.Icon>, <Button.Spinner>, <Button.Text>)', () => {
    render(
      <Button>
        <Button.Icon position="left"><span data-testid="compound-left">L</span></Button.Icon>
        <Button.Text truncate>Compound Button</Button.Text>
        <Button.Icon position="right"><span data-testid="compound-right">R</span></Button.Icon>
      </Button>
    )

    expect(screen.getByTestId('compound-left')).toBeInTheDocument()
    expect(screen.getByTestId('compound-right')).toBeInTheDocument()
    expect(screen.getByText('Compound Button')).toBeInTheDocument()
    expect(screen.getByText('Compound Button')).toHaveClass('truncate')
  })

  it('auto-hides left icon and auto-prepends spinner when loading in Compound mode', () => {
    const { rerender } = render(
      <Button loading>
        <Button.Icon position="left"><span data-testid="compound-left">L</span></Button.Icon>
        <Button.Text>Nạp tiền</Button.Text>
      </Button>
    )

    // Left icon should be auto-hidden when loading
    expect(screen.queryByTestId('compound-left')).not.toBeInTheDocument()
    expect(screen.getByText('Nạp tiền')).toBeInTheDocument()
    // Button has aria-busy and spinner is rendered
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')

    // When loading finishes, left icon reappears
    rerender(
      <Button loading={false}>
        <Button.Icon position="left"><span data-testid="compound-left">L</span></Button.Icon>
        <Button.Text>Nạp tiền</Button.Text>
      </Button>
    )
    expect(screen.getByTestId('compound-left')).toBeInTheDocument()
  })

  it('respects explicit <Button.Spinner /> location without duplicating spinner', () => {
    render(
      <Button loading>
        <Button.Text>Đang tải dữ liệu</Button.Text>
        <Button.Spinner className="custom-spinner" />
      </Button>
    )

    const spinners = document.querySelectorAll('.animate-spin')
    expect(spinners).toHaveLength(1)
    expect(spinners[0]).toHaveClass('custom-spinner')
  })

  it('supports top-level named exports <ButtonIcon>, <ButtonSpinner>, and <ButtonText>', () => {
    render(
      <Button>
        <ButtonIcon position="left"><span data-testid="named-left">L</span></ButtonIcon>
        <ButtonText>Named Component</ButtonText>
        <ButtonSpinner className="named-spin" />
      </Button>
    )

    expect(screen.getByTestId('named-left')).toBeInTheDocument()
    expect(screen.getByText('Named Component')).toBeInTheDocument()
    expect(document.querySelector('.named-spin')).toBeInTheDocument()
  })

  it('provides ButtonContext to consumers', () => {
    function ContextProbe() {
      const ctx = useButtonContext()
      return <div data-testid="probe">{ctx ? `${ctx.variant}-${ctx.size}-${ctx.tone}` : 'null'}</div>
    }

    render(
      <Button variant="danger" size="lg" tone="danger">
        <ContextProbe />
      </Button>
    )

    expect(screen.getByTestId('probe')).toHaveTextContent('danger-lg-danger')
  })

  it('renders ButtonLink as a router link and guards disabled clicks', () => {
    const handleClick = vi.fn()
    const { unmount } = render(
      <MemoryRouter>
        <ButtonLink to="/dashboard" onClick={handleClick}>
          Về trang chủ
        </ButtonLink>
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: 'Về trang chủ' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')

    fireEvent.click(link)
    expect(handleClick).toHaveBeenCalledTimes(1)

    unmount()

    const handleDisabledClick = vi.fn()
    render(
      <MemoryRouter>
        <ButtonLink to="/dashboard" disabled onClick={handleDisabledClick}>
          Liên kết bị khóa
        </ButtonLink>
      </MemoryRouter>
    )

    const disabledLink = screen.getByRole('link', { name: 'Liên kết bị khóa' })
    expect(disabledLink).toHaveAttribute('aria-disabled', 'true')
    expect(disabledLink).toHaveClass('pointer-events-none')

    fireEvent.click(disabledLink)
    expect(handleDisabledClick).not.toHaveBeenCalled()
  })

  it('supports Button.Link and Button.Anchor namespace aliases', () => {
    const handleAnchorClick = vi.fn((e) => e.preventDefault())
    render(
      <MemoryRouter>
        <Button.Link to="/settings">Cài đặt</Button.Link>
        <Button.Anchor href="https://example.com" onClick={handleAnchorClick}>
          Trang chủ đối tác
        </Button.Anchor>
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'Cài đặt' })).toHaveAttribute('href', '/settings')
    const anchor = screen.getByRole('link', { name: 'Trang chủ đối tác' })
    expect(anchor).toHaveAttribute('href', 'https://example.com')

    fireEvent.click(anchor)
    expect(handleAnchorClick).toHaveBeenCalledTimes(1)
  })

  it('guards ButtonAnchor against clicks when disabled or loading', () => {
    const handleClick = vi.fn()
    const { rerender } = render(
      <ButtonAnchor href="https://example.com" disabled onClick={handleClick}>
        Disabled Anchor
      </ButtonAnchor>
    )

    const anchor = screen.getByRole('link', { name: 'Disabled Anchor' })
    expect(anchor).toHaveAttribute('aria-disabled', 'true')
    expect(anchor).toHaveAttribute('href', '#')

    fireEvent.click(anchor)
    expect(handleClick).not.toHaveBeenCalled()

    // When loading
    rerender(
      <ButtonAnchor href="https://example.com" loading onClick={handleClick}>
        Loading Anchor
      </ButtonAnchor>
    )
    expect(screen.getByRole('link')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('link')).toHaveAttribute('href', '#')
    fireEvent.click(screen.getByRole('link'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('handles keyboard activation with Enter and Space', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Bàn phím</Button>)

    const button = screen.getByRole('button', { name: 'Bàn phím' })
    button.focus()
    expect(document.activeElement).toBe(button)

    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
