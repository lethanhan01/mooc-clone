import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner, PageLoader, FullScreenLoader } from './Spinner'

describe('Spinner components', () => {
  it('renders inline Spinner with default size and spin animation class', () => {
    const { container } = render(<Spinner />)
    const span = container.querySelector('span')

    expect(span).toBeInTheDocument()
    expect(span).toHaveAttribute('aria-hidden', 'true')
    expect(span).toHaveClass('animate-spin')
    expect(span).toHaveStyle({ width: '24px', height: '24px' })
  })

  it('renders Spinner with custom size and custom className', () => {
    const { container } = render(<Spinner size={40} className="custom-spinner-class" />)
    const span = container.querySelector('span')

    expect(span).toHaveClass('custom-spinner-class')
    expect(span).toHaveStyle({ width: '40px', height: '40px' })
  })

  it('renders PageLoader inside an accessible output element with localized label', () => {
    render(<PageLoader minHeight="50vh" className="test-loader-class" />)

    const output = screen.getByRole('status')
    expect(output).toBeInTheDocument()
    expect(output).toHaveClass('flex', 'w-full', 'items-center', 'justify-center', 'test-loader-class')
    expect(output).toHaveStyle({ minHeight: '50vh' })
  })

  it('renders FullScreenLoader inside full-screen output container', () => {
    render(<FullScreenLoader />)

    const output = screen.getByRole('status')
    expect(output).toBeInTheDocument()
    expect(output).toHaveClass('min-h-screen', 'w-full', 'bg-surface-base')
  })
})
