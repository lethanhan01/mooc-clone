import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Container } from './Container'

describe('Container component', () => {
  it('renders default container centered with max-w-screen-xl', () => {
    render(<Container data-testid="container">Page Container</Container>)
    const el = screen.getByTestId('container')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('mx-auto')
    expect(el.className).toContain('max-w-screen-xl')
    expect(el.className).toContain('w-full')
  })

  it('supports sizes sm, md, lg, 2xl, full', () => {
    const { rerender } = render(<Container size="sm" data-testid="container">Sm</Container>)
    expect(screen.getByTestId('container').className).toContain('max-w-screen-sm')

    rerender(<Container size="2xl" data-testid="container">2xl</Container>)
    expect(screen.getByTestId('container').className).toContain('max-w-screen-2xl')

    rerender(<Container size="full" data-testid="container">Full</Container>)
    expect(screen.getByTestId('container').className).toContain('max-w-full')
  })

  it('supports polymorphic as prop', () => {
    render(<Container as="main">Main Content</Container>)
    expect(screen.getByText('Main Content').tagName).toBe('MAIN')
  })
})
