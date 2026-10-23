import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadPreview,
} from './FileUpload'

describe('FileUpload Component', () => {
  beforeEach(() => {
    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = vi.fn((file: File) => `blob:mock-url-${file.name}`)
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      URL.revokeObjectURL = vi.fn()
    }
  })
  it('renders dropzone placeholder and helper text', () => {
    render(
      <FileUpload
        placeholder="Tải lên tài liệu"
        helperText="Hỗ trợ PDF, PNG (tối đa 5MB)"
      />
    )

    expect(screen.getByText('Tải lên tài liệu')).toBeInTheDocument()
    expect(screen.getByText('Hỗ trợ PDF, PNG (tối đa 5MB)')).toBeInTheDocument()
  })

  it('renders file preview when value is a string URL', () => {
    render(
      <FileUpload
        value="https://example.com/avatar.jpg"
        variant="avatar"
      />
    )

    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('handles file selection via input change', () => {
    const handleChange = vi.fn()
    const { container } = render(<FileUpload onChange={handleChange} />)

    const file = new File(['dummy content'], 'document.png', { type: 'image/png' })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })
    expect(handleChange).toHaveBeenCalledWith(file)
  })

  it('shows error when file size exceeds maxSizeMB', () => {
    const handleChange = vi.fn()
    const { container } = render(<FileUpload maxSizeMB={1} onChange={handleChange} />)

    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.png', { type: 'image/png' })
    Object.defineProperty(largeFile, 'size', { value: 2 * 1024 * 1024 })

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [largeFile] } })

    expect(screen.getByText('Kích thước tệp vượt quá 1MB')).toBeInTheDocument()
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('handles drag over, drag leave, and drop events', () => {
    const handleChange = vi.fn()
    render(<FileUpload onChange={handleChange} />)

    const dropzone = screen.getByText('Kéo thả tệp vào đây hoặc nhấn để chọn').closest('div') as HTMLElement
    expect(dropzone).toBeInTheDocument()

    fireEvent.dragOver(dropzone)
    fireEvent.dragLeave(dropzone)

    const file = new File(['drop content'], 'drop.png', { type: 'image/png' })
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    })

    expect(handleChange).toHaveBeenCalledWith(file)
  })

  it('clears file when RemoveButton is clicked', () => {
    const handleChange = vi.fn()
    render(
      <FileUpload
        value="https://example.com/sample.png"
        onChange={handleChange}
      />
    )

    const removeBtn = screen.getByRole('button', { name: 'Xóa tệp' })
    expect(removeBtn).toBeInTheDocument()

    fireEvent.click(removeBtn)
    expect(handleChange).toHaveBeenCalledWith(null)
  })

  it('renders avatar variant with round button and action label', () => {
    render(<FileUpload variant="avatar" helperText="Ảnh đại diện 500x500" />)

    const buttons = screen.getAllByRole('button', { name: 'Chọn ảnh đại diện' })
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Ảnh đại diện 500x500')).toBeInTheDocument()
  })

  it('renders loading overlay with ProgressBar when loading is true', () => {
    render(<FileUpload loading progress={75} />)

    expect(screen.getByText('Đang tải lên...')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
  })

  it('disables file input and dropzone interactions when disabled prop is true', () => {
    const { container } = render(<FileUpload disabled />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it('supports Compound API mode with FileUpload.Dropzone and FileUpload.Preview', () => {
    const handleChange = vi.fn()
    render(
      <FileUpload value="https://example.com/comp.png" onChange={handleChange}>
        <FileUploadDropzone>
          <FileUploadPreview />
        </FileUploadDropzone>
      </FileUpload>
    )

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/comp.png')
    expect(screen.getByRole('button', { name: 'Xóa tệp' })).toBeInTheDocument()
  })
})
