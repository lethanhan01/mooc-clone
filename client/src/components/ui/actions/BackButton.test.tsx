import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { BackButton } from './BackButton'

describe('BackButton Component', () => {
  it('renders default back button label and calls onClick', () => {
    const handleClick = vi.fn()
    render(
      <MemoryRouter>
        <BackButton onClick={handleClick} />
      </MemoryRouter>
    )

    const btn = screen.getByRole('button', { name: 'Quay lại' })
    expect(btn).toBeInTheDocument()

    fireEvent.click(btn)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders router link when "to" prop is provided', () => {
    render(
      <MemoryRouter>
        <BackButton to="/dashboard" label="Về trang chủ" />
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: 'Về trang chủ' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders icon only mode', () => {
    render(
      <MemoryRouter>
        <BackButton iconOnly label="Quay lại" />
      </MemoryRouter>
    )

    const btn = screen.getByRole('button', { name: 'Quay lại' })
    expect(btn).toBeInTheDocument()
    expect(screen.queryByText('Quay lại')).not.toBeInTheDocument()
  })
})
