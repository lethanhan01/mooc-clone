import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input'
import { FormField } from './FormField'

describe('Input Primitive', () => {
  it('renders standard shorthand input and handles text entry', () => {
    const handleChange = vi.fn()
    render(
      <Input
        placeholder="Nhập tên"
        onChange={handleChange}
      />
    )

    const input = screen.getByPlaceholderText('Nhập tên')
    expect(input).toBeInTheDocument()
    // Auto-fallback label for FORMS_LABEL_ASSOC
    expect(input).toHaveAttribute('aria-label', 'Nhập tên')

    fireEvent.change(input, { target: { value: 'Nguyễn Văn A' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('forwards ref directly to native HTMLInputElement in shorthand mode', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} placeholder="Tập trung" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    ref.current?.focus()
    expect(document.activeElement).toBe(ref.current)
  })

  it('auto-binds accessible attributes when inside FormField', () => {
    render(
      <FormField label="Email thành viên" error="Email không hợp lệ" required>
        <Input placeholder="example@email.com" />
      </FormField>
    )

    const label = screen.getByText('Email thành viên').closest('label')
    const input = screen.getByPlaceholderText('example@email.com')
    const errorAlert = screen.getByRole('alert')

    expect(label).toHaveAttribute('for', input.id)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', errorAlert.id)
    expect(input).toBeRequired()
    expect(errorAlert).toHaveTextContent('Email không hợp lệ')
  })

  it('supports explicit overrides over FormField context', () => {
    render(
      <FormField label="Số điện thoại" disabled error="Lỗi">
        <Input id="custom-phone" disabled={false} placeholder="0901234567" />
      </FormField>
    )

    const input = screen.getByPlaceholderText('0901234567')
    expect(input).toHaveAttribute('id', 'custom-phone')
    expect(input).not.toBeDisabled()
  })

  it('supports sizes sm, md, lg and inputSize alias', () => {
    const { container, rerender } = render(<Input size="sm" placeholder="Small" />)
    expect(container.firstChild).toHaveClass('min-h-[36px]')

    rerender(<Input size="md" placeholder="Medium" />)
    expect(container.firstChild).toHaveClass('min-h-[44px]')

    rerender(<Input size="lg" placeholder="Large" />)
    expect(container.firstChild).toHaveClass('min-h-[48px]')

    rerender(<Input inputSize="sm" placeholder="Legacy Small" />)
    expect(container.firstChild).toHaveClass('min-h-[36px]')
  })

  it('supports password visibility toggle and has touch expander', () => {
    render(
      <Input
        type="password"
        showPasswordToggle
        defaultValue="secret123"
        placeholder="Mật khẩu"
      />
    )

    const input = screen.getByPlaceholderText('Mật khẩu')
    expect(input).toHaveAttribute('type', 'password')

    const toggleBtn = screen.getByRole('button', { name: 'Hiện mật khẩu' })
    expect(toggleBtn).toBeInTheDocument()
    // WCAG 2.5.8 touch target expander class check
    expect(toggleBtn.className).toContain('after:min-h-[44px]')

    fireEvent.click(toggleBtn)
    expect(input).toHaveAttribute('type', 'text')

    const hideBtn = screen.getByRole('button', { name: 'Ẩn mật khẩu' })
    fireEvent.click(hideBtn)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('supports clearable action button with touch expander', () => {
    const handleClear = vi.fn()
    render(
      <Input
        clearable
        value="Nội dung cần xóa"
        onChange={() => {}}
        onClear={handleClear}
        placeholder="Tìm kiếm"
      />
    )

    const clearBtn = screen.getByRole('button', { name: 'Xóa nội dung' })
    expect(clearBtn).toBeInTheDocument()
    expect(clearBtn.className).toContain('after:min-h-[44px]')

    fireEvent.click(clearBtn)
    expect(handleClear).toHaveBeenCalledTimes(1)
  })

  it('renders leading and trailing visuals', () => {
    render(
      <Input
        leadingIcon={<span data-testid="lead-icon">🔍</span>}
        trailingIcon={<span data-testid="trail-icon">✓</span>}
        placeholder="Tìm kiếm với icon"
      />
    )

    expect(screen.getByTestId('lead-icon')).toBeInTheDocument()
    expect(screen.getByTestId('trail-icon')).toBeInTheDocument()
  })

  it('handles loading state with spinner', () => {
    render(<Input loading placeholder="Đang tải..." />)

    const input = screen.getByPlaceholderText('Đang tải...')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('aria-busy', 'true')
  })

  it('renders correctly using Compound Sub-components API', () => {
    const inputRef = createRef<HTMLInputElement>()
    render(
      <Input>
        <Input.LeadingVisual>
          <span data-testid="compound-icon">★</span>
        </Input.LeadingVisual>
        <Input.Field ref={inputRef} placeholder="Compound input" />
        <Input.TrailingAction aria-label="Tác vụ phụ">
          <span data-testid="compound-action">⚙</span>
        </Input.TrailingAction>
      </Input>
    )

    expect(screen.getByTestId('compound-icon')).toBeInTheDocument()
    expect(screen.getByTestId('compound-action')).toBeInTheDocument()
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement)
    expect(screen.getByPlaceholderText('Compound input')).toBeInTheDocument()
  })
})
