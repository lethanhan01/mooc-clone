import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Image } from './Image'

describe('Image component', () => {
  it('renders an image with src, alt, and aspect ratio container', () => {
    render(
      <Image
        src="https://example.com/gym.jpg"
        alt="Gym workout room"
        aspectRatio="16/9"
        radius="lg"
      />
    )
    const img = screen.getByRole('img', { name: 'Gym workout room' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/gym.jpg')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img.parentElement?.className).toContain('aspect-video')
    expect(img.parentElement?.className).toContain('rounded-lg')
  })

  it('renders fallback icon when src is missing or empty', () => {
    render(<Image src={null} alt="Empty image" data-testid="empty-image" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // SVG icon is rendered inside fallback
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders fallback when image fails to load (onError)', () => {
    render(<Image src="https://example.com/broken.jpg" alt="Broken image" />)
    const img = screen.getByRole('img', { name: 'Broken image' })
    fireEvent.error(img)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('supports custom fallback slot', () => {
    render(
      <Image
        src=""
        alt="Custom fallback"
        fallback={<span data-testid="custom-fallback">Custom No Image</span>}
      />
    )
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
  })
})
