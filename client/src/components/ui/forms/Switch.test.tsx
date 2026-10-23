import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from './Switch'
import { FormField } from './FormField'

describe('Switch Primitive', () => {
  it('renders standard shorthand switch and handles toggle', () => {
    const handleChange = vi.fn()
    const handleCheckedChange = vi.fn()
    render(
      <Switch
        label="Thông báo đẩy"
        onChange={handleChange}
        onCheckedChange={handleCheckedChange}
      />
    )

    const switchEl = screen.getByRole('switch', { name: /Thông báo đẩy/ })
    expect(switchEl).toBeInTheDocument()
    expect(switchEl).not.toBeChecked()
    expect(switchEl).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(switchEl)
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleCheckedChange).toHaveBeenCalledWith(true)
  })

  it('forwards ref directly to native HTMLInputElement', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Switch ref={ref} label="Tham chiếu switch" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    ref.current?.focus()
    expect(document.activeElement).toBe(ref.current)
  })

  it('supports loading state with spinner and disabled behavior', () => {
    render(<Switch loading label="Đang đồng bộ" />)

    const switchEl = screen.getByRole('switch', { name: /Đang đồng bộ/ })
    expect(switchEl).toBeDisabled()
    expect(switchEl).toHaveAttribute('aria-busy', 'true')
  })

  it('auto-binds with FormField for accessibility and validation', () => {
    render(
      <FormField label="Kích hoạt dịch vụ" error="Vui lòng kích hoạt" required>
        <Switch label="Bật dịch vụ" />
      </FormField>
    )

    const switchEl = screen.getByRole('switch', { name: /Bật dịch vụ/ })
    expect(switchEl).toBeRequired()
    expect(switchEl).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports sizes sm, md, lg and touch target expander', () => {
    const { container, rerender } = render(<Switch size="sm" label="Small" />)
    expect(container.querySelector('.w-9')).toBeInTheDocument()
    expect(container.querySelector('.after\\:min-h-\\[44px\\]')).toBeInTheDocument()

    rerender(<Switch size="lg" label="Large" />)
    expect(container.querySelector('.w-13')).toBeInTheDocument()
  })

  it('supports disabled state', () => {
    render(<Switch disabled label="Chế độ bảo trì" />)

    const switchEl = screen.getByRole('switch', { name: /Chế độ bảo trì/ })
    expect(switchEl).toBeDisabled()
  })

  it('renders correctly using Compound Sub-components API', () => {
    render(
      <Switch defaultChecked id="custom-switch">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <div className="flex flex-col">
          <Switch.Label>Compound Switch</Switch.Label>
          <Switch.Description>Mô tả cần gạt</Switch.Description>
        </div>
      </Switch>
    )

    const switchEl = screen.getByRole('switch', { name: /Compound Switch/ })
    expect(switchEl).toBeInTheDocument()
    expect(switchEl).toBeChecked()
    expect(screen.getByText('Mô tả cần gạt')).toBeInTheDocument()
  })
})
