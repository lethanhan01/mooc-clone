import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'
import { FormField } from './FormField'

describe('Checkbox Primitive', () => {
  it('renders standard shorthand checkbox and handles check toggle', () => {
    const handleChange = vi.fn()
    const handleCheckedChange = vi.fn()
    render(
      <Checkbox
        label="Đồng ý điều khoản"
        onChange={handleChange}
        onCheckedChange={handleCheckedChange}
      />
    )

    const checkbox = screen.getByRole('checkbox', { name: /Đồng ý điều khoản/ })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleCheckedChange).toHaveBeenCalledWith(true)
  })

  it('forwards ref directly to native HTMLInputElement', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Checkbox ref={ref} label="Tham chiếu input" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    ref.current?.focus()
    expect(document.activeElement).toBe(ref.current)
  })

  it('supports indeterminate state and renders minus icon', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Checkbox ref={ref} indeterminate label="Chọn một phần" />)

    const checkbox = screen.getByRole('checkbox', { name: /Chọn một phần/ })
    expect(checkbox).toBeInTheDocument()
    expect(ref.current?.indeterminate).toBe(true)
  })

  it('auto-binds with FormField for accessibility and validation', () => {
    render(
      <FormField label="Xác nhận" error="Bắt buộc chọn" required>
        <Checkbox label="Tôi đồng ý" />
      </FormField>
    )

    const checkbox = screen.getByRole('checkbox', { name: /Tôi đồng ý/ })
    expect(checkbox).toBeRequired()
    expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Bắt buộc chọn')
  })

  it('supports sizes sm, md, lg and touch target expander', () => {
    const { container, rerender } = render(<Checkbox size="sm" label="Small" />)
    expect(container.querySelector('.h-4')).toBeInTheDocument()
    expect(container.querySelector('.after\\:min-h-\\[44px\\]')).toBeInTheDocument()

    rerender(<Checkbox size="lg" label="Large" />)
    expect(container.querySelector('.h-6')).toBeInTheDocument()
  })

  it('supports disabled state', () => {
    render(<Checkbox disabled label="Khóa" />)

    const checkbox = screen.getByRole('checkbox', { name: /Khóa/ })
    expect(checkbox).toBeDisabled()
  })

  it('renders correctly using Compound Sub-components API', () => {
    render(
      <Checkbox defaultChecked id="custom-check">
        <Checkbox.Indicator />
        <div className="flex flex-col">
          <Checkbox.Label>Compound Checkbox</Checkbox.Label>
          <Checkbox.Description>Mô tả chi tiết</Checkbox.Description>
          <Checkbox.Error>Lỗi nhập liệu</Checkbox.Error>
        </div>
      </Checkbox>
    )

    const checkbox = screen.getByRole('checkbox', { name: /Compound Checkbox/ })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toBeChecked()
    expect(screen.getByText('Mô tả chi tiết')).toBeInTheDocument()
    expect(screen.getByText('Lỗi nhập liệu')).toBeInTheDocument()
  })
})
