import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState Component', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="Không tìm thấy học viên"
        description="Vui lòng thử tìm kiếm với từ khóa khác"
      />
    )

    expect(screen.getByText('Không tìm thấy học viên')).toBeInTheDocument()
    expect(
      screen.getByText('Vui lòng thử tìm kiếm với từ khóa khác')
    ).toBeInTheDocument()
  })

  it('renders action button and triggers callback', () => {
    const handleAction = vi.fn()
    render(
      <EmptyState
        title="Danh sách trống"
        actionLabel="Thêm mới"
        onAction={handleAction}
      />
    )

    const btn = screen.getByRole('button', { name: 'Thêm mới' })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })
})
