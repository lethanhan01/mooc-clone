import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TagInput, TagList, TagItem, TagField } from './TagInput'

describe('TagInput Component', () => {
  it('renders default tags and placeholder', () => {
    render(<TagInput defaultValue={['Cardio', 'Tăng cơ']} placeholder="Thêm thẻ..." />)

    expect(screen.getByText('Cardio')).toBeInTheDocument()
    expect(screen.getByText('Tăng cơ')).toBeInTheDocument()
  })

  it('adds a new tag on Enter key', () => {
    const handleChange = vi.fn()
    render(<TagInput defaultValue={['Cardio']} onChange={handleChange} placeholder="Thêm thẻ..." />)

    const input = screen.getByPlaceholderText('')
    fireEvent.change(input, { target: { value: 'Giảm mỡ' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(handleChange).toHaveBeenCalledWith(['Cardio', 'Giảm mỡ'])
    expect(screen.getByText('Giảm mỡ')).toBeInTheDocument()
  })

  it('adds a new tag on comma key', () => {
    const handleChange = vi.fn()
    render(<TagInput defaultValue={['Cardio']} onChange={handleChange} />)

    const input = screen.getByPlaceholderText('')
    fireEvent.change(input, { target: { value: 'Yoga' } })
    fireEvent.keyDown(input, { key: ',', code: 'Comma' })

    expect(handleChange).toHaveBeenCalledWith(['Cardio', 'Yoga'])
    expect(screen.getByText('Yoga')).toBeInTheDocument()
  })

  it('removes tag on click remove button', () => {
    const handleChange = vi.fn()
    render(<TagInput defaultValue={['Cardio', 'Yoga']} onChange={handleChange} />)

    const removeBtns = screen.getAllByRole('button', { name: /xóa/i })
    fireEvent.click(removeBtns[0])

    expect(handleChange).toHaveBeenCalledWith(['Yoga'])
  })

  it('removes last tag when Backspace is pressed on empty input', () => {
    const handleChange = vi.fn()
    render(<TagInput defaultValue={['Cardio', 'Yoga']} onChange={handleChange} />)

    const input = screen.getByPlaceholderText('')
    fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' })

    expect(handleChange).toHaveBeenCalledWith(['Cardio'])
  })

  it('does not allow duplicates when allowDuplicates is false', () => {
    const handleChange = vi.fn()
    render(<TagInput defaultValue={['Cardio']} onChange={handleChange} allowDuplicates={false} />)

    const input = screen.getByPlaceholderText('')
    fireEvent.change(input, { target: { value: 'Cardio' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('allows duplicates when allowDuplicates is true', () => {
    const handleChange = vi.fn()
    render(<TagInput defaultValue={['Cardio']} onChange={handleChange} allowDuplicates={true} />)

    const input = screen.getByPlaceholderText('')
    fireEvent.change(input, { target: { value: 'Cardio' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(handleChange).toHaveBeenCalledWith(['Cardio', 'Cardio'])
  })

  it('respects maxTags limit and hides input when full', () => {
    const handleChange = vi.fn()
    render(<TagInput defaultValue={['A', 'B']} maxTags={2} onChange={handleChange} />)

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('disables removing tags and input when disabled prop is true', () => {
    render(<TagInput defaultValue={['Cardio']} disabled />)

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /xóa/i })).not.toBeInTheDocument()
  })

  it('supports Compound API with TagInput.List, TagInput.Tag, and TagInput.Field', () => {
    const handleChange = vi.fn()
    render(
      <TagInput value={['React', 'Vite']} onChange={handleChange}>
        <TagList>
          <TagItem tag="React" index={0} />
          <TagItem tag="Vite" index={1} />
        </TagList>
        <TagField placeholder="Thêm tech..." />
      </TagInput>
    )

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Vite')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('')).toBeInTheDocument()
  })

  it('applies error styling when error prop is provided', () => {
    const { container } = render(<TagInput defaultValue={['Tag']} error="Lỗi thẻ nhập" />)
    expect(container.firstChild).toHaveClass('border-status-danger-border')
  })

  it('renders semantic fieldset with accessible legend and custom aria-label', () => {
    render(<TagInput defaultValue={['Tag']} aria-label="Mục tiêu tập luyện" />)
    const fieldset = screen.getByRole('group', { name: 'Mục tiêu tập luyện' })
    expect(fieldset.tagName.toLowerCase()).toBe('fieldset')
    expect(screen.getByText('Mục tiêu tập luyện')).toHaveClass('sr-only')
  })

  it('forwards ref to HTMLFieldSetElement', () => {
    const ref = createRef<HTMLFieldSetElement>()
    render(<TagInput ref={ref} defaultValue={['Tag']} />)
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement)
  })

  it('renders semantic ul and li elements for tag items', () => {
    render(<TagInput defaultValue={['Tag1', 'Tag2']} />)
    const list = screen.getByRole('list')
    expect(list.tagName.toLowerCase()).toBe('ul')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
  })
})
