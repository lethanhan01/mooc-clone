import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Textarea } from './Textarea'
import { FormField } from './FormField'

describe('Textarea Primitive', () => {
  it('renders textarea and handles input event in shorthand mode', () => {
    const handleChange = vi.fn()
    render(
      <Textarea
        placeholder="Nhập ghi chú"
        onChange={handleChange}
      />
    )

    const textarea = screen.getByPlaceholderText('Nhập ghi chú')
    expect(textarea).toBeInTheDocument()
    // Auto fallback label for FORMS_LABEL_ASSOC
    expect(textarea).toHaveAttribute('aria-label', 'Nhập ghi chú')
    expect(textarea).toHaveClass('min-h-[96px]')

    fireEvent.change(textarea, { target: { value: 'Nội dung ghi chú' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('forwards ref directly to native HTMLTextAreaElement in shorthand mode', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} placeholder="Textarea focus" />)

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    ref.current?.focus()
    expect(document.activeElement).toBe(ref.current)
  })

  it('auto-binds with FormField for accessibility and validation', () => {
    render(
      <FormField label="Lý do hủy" error="Vui lòng nêu lý do" hint="Tối đa 500 ký tự" required>
        <Textarea placeholder="Nhập lý do..." />
      </FormField>
    )

    const label = screen.getByText('Lý do hủy').closest('label')
    const textarea = screen.getByPlaceholderText('Nhập lý do...')
    const errorAlert = screen.getByRole('alert')

    expect(label).toHaveAttribute('for', textarea.id)
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAttribute('aria-describedby', errorAlert.id)
    expect(textarea).toBeRequired()
  })

  it('supports custom rows and disabled state', () => {
    render(<Textarea rows={6} disabled placeholder="Bị khóa" />)

    const textarea = screen.getByPlaceholderText('Bị khóa')
    expect(textarea).toHaveAttribute('rows', '6')
    expect(textarea).toBeDisabled()
  })

  it('supports character count display with showCount', () => {
    render(
      <Textarea
        showCount
        maxLength={100}
        defaultValue="Xin chào"
        placeholder="Đếm ký tự"
      />
    )

    expect(screen.getByText('8 / 100')).toBeInTheDocument()
  })

  it('renders correctly using Compound Sub-components API', () => {
    const textareaRef = createRef<HTMLTextAreaElement>()
    render(
      <Textarea>
        <Textarea.Field ref={textareaRef} placeholder="Compound textarea" />
        <Textarea.Counter max={200} />
        <Textarea.HelperText>Nhập tối đa 200 ký tự</Textarea.HelperText>
      </Textarea>
    )

    expect(textareaRef.current).toBeInstanceOf(HTMLTextAreaElement)
    expect(screen.getByPlaceholderText('Compound textarea')).toBeInTheDocument()
    expect(screen.getByText('0 / 200')).toBeInTheDocument()
    expect(screen.getByText('Nhập tối đa 200 ký tự')).toBeInTheDocument()
  })
})
