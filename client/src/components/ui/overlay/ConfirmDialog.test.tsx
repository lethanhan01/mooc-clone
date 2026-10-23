import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog Primitive', () => {
  it('renders title, description and triggers actions', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    render(
      <ConfirmDialog
        open={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Xác nhận thao tác"
        description="Bạn có chắc chắn muốn thực hiện hành động này?"
        confirmLabel="Đồng ý"
        cancelLabel="Hủy bỏ"
      />
    )

    expect(screen.getByRole('heading', { name: 'Xác nhận thao tác' })).toBeInTheDocument()
    expect(screen.getByText('Bạn có chắc chắn muốn thực hiện hành động này?')).toBeInTheDocument()

    const cancelBtn = screen.getByRole('button', { name: 'Hủy bỏ' })
    const confirmBtn = screen.getByRole('button', { name: 'Đồng ý' })

    expect(cancelBtn).toHaveClass('border-line-subtle')
    expect(confirmBtn).toHaveClass('bg-action-primary')

    fireEvent.click(cancelBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)

    fireEvent.click(confirmBtn)
    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it('renders danger variant with danger confirm button', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    render(
      <ConfirmDialog
        open={true}
        variant="danger"
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Xóa dữ liệu"
        description="Dữ liệu sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa ngay"
        cancelLabel="Bỏ qua"
      />
    )

    const confirmBtn = screen.getByRole('button', { name: 'Xóa ngay' })
    expect(confirmBtn).toHaveClass('bg-status-danger-solid')
  })

  it('handles loading state disabling interactions', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    render(
      <ConfirmDialog
        open={true}
        loading={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Đang xử lý"
        description="Vui lòng chờ..."
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
      />
    )

    const cancelBtn = screen.getByRole('button', { name: 'Hủy' })
    const confirmBtn = screen.getByRole('button', { name: 'Xác nhận' })

    expect(cancelBtn).toBeDisabled()
    expect(confirmBtn).toBeDisabled()
    expect(confirmBtn).toHaveAttribute('aria-busy', 'true')

    fireEvent.click(confirmBtn)
    expect(handleConfirm).not.toHaveBeenCalled()
  })

  it('renders warning variant with warning confirm button', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    render(
      <ConfirmDialog
        open={true}
        variant="warning"
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Cảnh báo thao tác"
        description="Hành động này có thể ảnh hưởng đến hệ thống."
        confirmLabel="Tiếp tục"
      />
    )

    const confirmBtn = screen.getByRole('button', { name: 'Tiếp tục' })
    expect(confirmBtn).toHaveClass('bg-status-warning-solid')
  })
})
