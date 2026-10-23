import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal, ModalFooter } from './Modal'

describe('Modal Component - Baseline Compatibility & Anti-Regression', () => {
  it('renders modal title, children and close button when open is true', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} title="Chi tiết hội viên" onClose={handleClose}>
        <p>Thông tin gói tập của hội viên</p>
      </Modal>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Chi tiết hội viên')).toBeInTheDocument()
    expect(screen.getByText('Thông tin gói tập của hội viên')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /đóng|close/i })).toBeInTheDocument()
  })

  it('does not render anything in DOM when open is false', () => {
    render(
      <Modal open={false} title="Tiêu đề ẩn" onClose={vi.fn()}>
        <p>Nội dung ẩn</p>
      </Modal>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Tiêu đề ẩn')).not.toBeInTheDocument()
    expect(screen.queryByText('Nội dung ẩn')).not.toBeInTheDocument()
  })

  it('triggers onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} title="Xác nhận" onClose={handleClose}>
        <p>Nội dung</p>
      </Modal>
    )

    fireEvent.click(screen.getByRole('button', { name: /đóng|close/i }))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('triggers onClose when Escape key is pressed', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} title="Escape Test" onClose={handleClose}>
        <p>Press ESC</p>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not trigger onClose on backdrop click when closeOnOutsideClick is false (default)', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} title="Safe Modal" onClose={handleClose}>
        <input placeholder="Tên" />
      </Modal>
    )

    const dialogBackdrop = screen.getByRole('dialog')
    fireEvent.click(dialogBackdrop)
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('triggers onClose on backdrop click when closeOnOutsideClick is true', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} title="Dismissible Modal" onClose={handleClose} closeOnOutsideClick={true}>
        <p>Content</p>
      </Modal>
    )

    const dialogBackdrop = screen.getByRole('dialog')
    fireEvent.click(dialogBackdrop)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('renders description as string and node correctly', () => {
    const { rerender } = render(
      <Modal
        open={true}
        title="Tiêu đề"
        description="Mô tả phụ chuỗi"
        onClose={vi.fn()}
      >
        <p>Body</p>
      </Modal>
    )
    expect(screen.getByText('Mô tả phụ chuỗi')).toBeInTheDocument()

    rerender(
      <Modal
        open={true}
        title="Tiêu đề"
        description={<span data-testid="custom-desc">Mô tả custom</span>}
        onClose={vi.fn()}
      >
        <p>Body</p>
      </Modal>
    )
    expect(screen.getByTestId('custom-desc')).toBeInTheDocument()
  })

  it('renders headerActions and footer with ModalFooter layout', () => {
    render(
      <Modal
        open={true}
        title="Header Actions Test"
        onClose={vi.fn()}
        headerActions={<button data-testid="custom-action">Custom Action</button>}
        footer={<button data-testid="submit-btn">Xác nhận</button>}
      >
        <p>Body</p>
      </Modal>
    )

    expect(screen.getByTestId('custom-action')).toBeInTheDocument()
    expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
  })

  it('ModalFooter renders children with custom className', () => {
    render(
      <ModalFooter className="custom-footer-class">
        <button>Btn 1</button>
        <button>Btn 2</button>
      </ModalFooter>
    )

    const footer = screen.getByText('Btn 1').parentElement
    expect(footer).toHaveClass('custom-footer-class')
    expect(footer).toHaveClass('justify-end')
  })
})
