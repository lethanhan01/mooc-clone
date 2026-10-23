import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Separator } from './Separator'

describe('Separator Component', () => {
  it('renders horizontal separator by default', () => {
    const { container } = render(<Separator />)
    const el = container.firstChild as HTMLElement
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('h-[1px]')
  })

  it('renders label in horizontal mode', () => {
    render(<Separator label="HOẶC" />)
    expect(screen.getByText('HOẶC')).toBeInTheDocument()
  })

  it('renders vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const el = container.firstChild as HTMLElement
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('w-[1px]')
  })
})
