import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubmitButton } from './SubmitButton'

describe('SubmitButton Component', () => {
  it('renders submit button with default label and type="submit"', () => {
    render(<SubmitButton />)

    const btn = screen.getByRole('button', { name: 'Lưu thay đổi' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('type', 'submit')
  })

  it('renders custom children and attaches form attribute', () => {
    render(<SubmitButton form="user-form">Tạo mới</SubmitButton>)

    const btn = screen.getByRole('button', { name: 'Tạo mới' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('form', 'user-form')
  })

  it('handles loading and disabled states', () => {
    render(<SubmitButton loading disabled>Đang gửi</SubmitButton>)

    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })
})
