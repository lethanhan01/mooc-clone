import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Heading } from './Heading'

describe('Heading component', () => {
  it('renders corresponding h1..h6 tags based on level prop', () => {
    const { rerender } = render(<Heading level={1}>Heading 1</Heading>)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    rerender(<Heading level={2}>Heading 2</Heading>)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()

    rerender(<Heading level={3}>Heading 3</Heading>)
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()

    rerender(<Heading level={4}>Heading 4</Heading>)
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument()

    rerender(<Heading level={5}>Heading 5</Heading>)
    expect(screen.getByRole('heading', { level: 5 })).toBeInTheDocument()

    rerender(<Heading level={6}>Heading 6</Heading>)
    expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument()
  })

  it('applies default size mapped to level', () => {
    render(<Heading level={1} data-testid="h1">Big Title</Heading>)
    expect(screen.getByTestId('h1').className).toContain('text-4xl')
  })

  it('allows overriding size and applying tone', () => {
    render(
      <Heading level={2} size="sm" tone="accent" data-testid="custom-h2">
        Custom Heading
      </Heading>
    )
    const el = screen.getByTestId('custom-h2')
    expect(el.className).toContain('text-lg')
    expect(el.className).toContain('text-action-accent')
  })
})
