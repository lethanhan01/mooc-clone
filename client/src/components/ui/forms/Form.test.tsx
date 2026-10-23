import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Form } from './Form'

describe('Form Primitive Component', () => {
  it('TC-FORM-01: renders native form element with className and children', () => {
    render(
      <Form className="test-form-class">
        <span>Form Content</span>
      </Form>
    )

    const formEl = screen.getByText('Form Content').closest('form')
    expect(formEl).toBeInTheDocument()
    expect(formEl).toHaveClass('test-form-class')
  })

  it('TC-FORM-02: forwards ref correctly to HTMLFormElement', () => {
    const ref = createRef<HTMLFormElement>()
    render(<Form ref={ref}><span>Content</span></Form>)

    expect(ref.current).toBeInstanceOf(HTMLFormElement)
  })

  it('TC-FORM-03: defaults noValidate to true, but allows overriding with false', () => {
    const { rerender } = render(<Form><span>Default Form</span></Form>)
    let formEl = screen.getByText('Default Form').closest('form')
    expect(formEl).toHaveAttribute('novalidate')

    rerender(<Form noValidate={false}><span>Custom Form</span></Form>)
    formEl = screen.getByText('Custom Form').closest('form')
    expect(formEl).not.toHaveAttribute('novalidate')
  })

  it('TC-FORM-04: automatically assigns role="form" when aria-label is provided', () => {
    render(<Form aria-label="Member Registration Form"><span>Content</span></Form>)

    const formEl = screen.getByRole('form', { name: 'Member Registration Form' })
    expect(formEl).toBeInTheDocument()
  })

  it('TC-FORM-05: automatically assigns role="form" when aria-labelledby is provided', () => {
    render(
      <div>
        <h2 id="form-heading">Search Form</h2>
        <Form aria-labelledby="form-heading"><span>Content</span></Form>
      </div>
    )

    const formEl = screen.getByRole('form', { name: 'Search Form' })
    expect(formEl).toBeInTheDocument()
  })

  it('TC-FORM-06: does not assign role="form" when neither aria-label nor aria-labelledby is present', () => {
    render(<Form><span>Unlabelled Form</span></Form>)

    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    const formEl = screen.getByText('Unlabelled Form').closest('form')
    expect(formEl).not.toHaveAttribute('role')
  })

  it('TC-FORM-07: triggers onSubmit callback when submitted', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault())
    render(
      <Form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </Form>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('TC-FORM-08: prevents Enter key submission on input elements when preventEnterSubmit is true, but allows Enter in textarea and on submit button', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault())
    render(
      <Form preventEnterSubmit onSubmit={handleSubmit}>
        <input data-testid="test-input" />
        <textarea data-testid="test-textarea" />
        <button type="submit">Submit</button>
      </Form>
    )

    const input = screen.getByTestId('test-input')
    const textarea = screen.getByTestId('test-textarea')
    const submitBtn = screen.getByRole('button', { name: 'Submit' })

    // Gõ Enter trên input thông thường -> bị preventDefault, không submit
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(handleSubmit).not.toHaveBeenCalled()

    // Gõ Enter trên textarea -> cho phép xuống dòng bình thường
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })
    expect(handleSubmit).not.toHaveBeenCalled()

    // Gõ Enter trực tiếp trên nút submit -> submit thành công
    fireEvent.keyDown(submitBtn, { key: 'Enter', code: 'Enter' })
    fireEvent.click(submitBtn)
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('TC-FORM-09: allows Enter key submission when preventEnterSubmit is false (default)', () => {
    const handleKeyDown = vi.fn()
    render(
      <Form onKeyDown={handleKeyDown}>
        <input data-testid="normal-input" />
      </Form>
    )

    const input = screen.getByTestId('normal-input')
    const event = fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(event).toBe(true) // Event is not preventDefaulted
    expect(handleKeyDown).toHaveBeenCalledTimes(1)
  })

  it('TC-FORM-10: preserves normal Enter behavior on button type="button" and checkbox when preventEnterSubmit is true', () => {
    const handleButtonClick = vi.fn()
    const handleFormKeyDown = vi.fn()

    render(
      <Form preventEnterSubmit onKeyDown={handleFormKeyDown}>
        <button type="button" onClick={handleButtonClick} data-testid="action-button">
          Action
        </button>
        <input type="checkbox" data-testid="test-checkbox" />
      </Form>
    )

    const actionBtn = screen.getByTestId('action-button')
    const checkbox = screen.getByTestId('test-checkbox')

    const buttonEvent = fireEvent.keyDown(actionBtn, { key: 'Enter', code: 'Enter' })
    expect(buttonEvent).toBe(true) // Not preventDefaulted

    const checkboxEvent = fireEvent.keyDown(checkbox, { key: 'Enter', code: 'Enter' })
    expect(checkboxEvent).toBe(true) // Not preventDefaulted
  })
})
