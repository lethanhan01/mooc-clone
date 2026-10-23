import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'
import { Input } from './Input'

describe('FormField Component', () => {
  it('renders label, children and associates htmlFor with input id', () => {
    render(
      <FormField label="Email Address" id="email-input">
        <Input placeholder="Enter your email" />
      </FormField>
    )

    expect(screen.getByText('Email Address')).toBeInTheDocument()
    const label = screen.getByText('Email Address').closest('label')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('renders required indicator when required is true', () => {
    render(
      <FormField label="Họ và tên" required>
        <Input placeholder="Nhập tên" />
      </FormField>
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders hint text when hint is provided and no error', () => {
    render(
      <FormField label="Mật khẩu" hint="Tối thiểu 8 ký tự">
        <Input type="password" />
      </FormField>
    )

    expect(screen.getByText('Tối thiểu 8 ký tự')).toBeInTheDocument()
  })

  it('renders error message with role="alert" when error is provided, hiding hint', () => {
    render(
      <FormField label="Mật khẩu" hint="Tối thiểu 8 ký tự" error="Mật khẩu quá ngắn">
        <Input type="password" />
      </FormField>
    )

    const errorEl = screen.getByRole('alert')
    expect(errorEl).toBeInTheDocument()
    expect(errorEl).toHaveTextContent('Mật khẩu quá ngắn')
    expect(screen.queryByText('Tối thiểu 8 ký tự')).not.toBeInTheDocument()
  })

  it('applies custom className and fullWidth', () => {
    const { container } = render(
      <FormField label="Test" fullWidth={false} className="custom-field">
        <Input />
      </FormField>
    )

    const field = container.firstChild as HTMLElement
    expect(field).toHaveClass('custom-field')
    expect(field).not.toHaveClass('w-full')
  })
})
