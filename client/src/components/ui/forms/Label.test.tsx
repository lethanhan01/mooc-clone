import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from './Label'

describe('Label component', () => {
  it('renders a label element with text', () => {
    render(<Label htmlFor="email-input">Email Address</Label>)
    const el = screen.getByText('Email Address')
    expect(el.closest('label')).toHaveAttribute('for', 'email-input')
  })

  it('renders required indicator when required is true', () => {
    render(<Label required>Password</Label>)
    const star = screen.getByText('*')
    expect(star).toHaveAttribute('aria-hidden', 'true')
    expect(star.className).toContain('text-status-danger-fg')
  })

  it('applies disabled style when disabled is true', () => {
    render(<Label disabled data-testid="disabled-label">Disabled Field</Label>)
    expect(screen.getByTestId('disabled-label').className).toContain('opacity-50')
  })
})
