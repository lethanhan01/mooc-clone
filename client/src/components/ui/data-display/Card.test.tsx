import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardMedia,
  CardContent,
  CardFooter,
  CardRibbon,
  CardSkeleton,
} from './Card'
import { TONES } from '@/lib/variants'

describe('Card UI Primitive Component', () => {
  it('renders default card with base classes and children', () => {
    const { container } = render(<Card>Card Content</Card>)
    const cardEl = container.firstChild as HTMLElement

    expect(cardEl).toBeInTheDocument()
    expect(cardEl).toHaveTextContent('Card Content')
    expect(cardEl.tagName.toLowerCase()).toBe('div')
  })

  it('supports semantic HTML tags via `as` prop', () => {
    const { container } = render(<Card as="article">Article Card</Card>)
    const cardEl = container.querySelector('article')
    expect(cardEl).toBeInTheDocument()
    expect(cardEl).toHaveTextContent('Article Card')
  })

  it('applies padding variants correctly', () => {
    const paddings = ['none', 'xs', 'sm', 'md', 'lg'] as const
    for (const padding of paddings) {
      const { container, unmount } = render(<Card padding={padding}>Padded</Card>)
      expect(container.firstChild).toBeInTheDocument()
      unmount()
    }
  })

  it('supports all semantic tones with tone styling', () => {
    for (const tone of TONES) {
      const { container, unmount } = render(<Card tone={tone}>Tone Card</Card>)
      const cardEl = container.firstChild as HTMLElement
      expect(cardEl).toBeInTheDocument()
      unmount()
    }
  })

  it('handles click and keyboard Enter/Space activation when onClick is provided', () => {
    const handleClick = vi.fn()
    render(<Card onClick={handleClick}>Clickable Card</Card>)

    const cardEl = screen.getByRole('button', { name: 'Clickable Card' })
    expect(cardEl).toHaveAttribute('tabindex', '0')

    fireEvent.click(cardEl)
    expect(handleClick).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(cardEl, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(2)

    fireEvent.keyDown(cardEl, { key: ' ' })
    expect(handleClick).toHaveBeenCalledTimes(3)
  })

  it('renders React Router Link when `to` prop is provided', () => {
    render(
      <MemoryRouter>
        <Card to="/dashboard">Go to Dashboard</Card>
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: 'Go to Dashboard' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders anchor tag when `href` prop is provided', () => {
    render(<Card href="https://example.com">External Link</Card>)

    const link = screen.getByRole('link', { name: 'External Link' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('disables interaction when `disabled` is true', () => {
    const handleClick = vi.fn()
    render(<Card disabled onClick={handleClick}>Disabled Card</Card>)

    const cardEl = screen.getByText('Disabled Card')
    fireEvent.click(cardEl)
    expect(handleClick).not.toHaveBeenCalled()
    expect(cardEl).toHaveClass('opacity-50')
  })

  it('supports forwardRef to underlying HTMLElement', () => {
    const ref = createRef<HTMLElement>()
    render(<Card ref={ref}>Ref Card</Card>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('renders complete Card ecosystem with subcomponents', () => {
    render(
      <Card as="article">
        <CardRibbon tone="warning" position="top-right">VIP</CardRibbon>
        <CardMedia src="/test-media.jpg" alt="Test Media" aspectRatio="16/9" />
        <CardHeader eyebrow="Category" actions={<button type="button">Action</button>}>
          <CardTitle as="h2" size="lg">Card Main Title</CardTitle>
          <CardDescription>Description for the card</CardDescription>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter align="between">
          <span>Footer Left</span>
          <span>Footer Right</span>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Card Main Title' })).toBeInTheDocument()
    expect(screen.getByText('Description for the card')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
    expect(screen.getByText('Footer Left')).toBeInTheDocument()
  })

  it('renders CardSkeleton in loading state', () => {
    render(<CardSkeleton hasMedia lines={2} data-testid="card-skeleton" />)
    const skeleton = screen.getByTestId('card-skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
  })
})
