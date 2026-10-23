import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SplitPane } from './SplitPane'

describe('SplitPane Component', () => {
  it('renders master list and empty state message when no item is selected', () => {
    render(
      <SplitPane
        masterList={<div>Danh Sách Hội Viên</div>}
        detailPane={<div>Chi Tiết Hội Viên</div>}
        selectedId={null}
      />
    )

    expect(screen.getByText('Danh Sách Hội Viên')).toBeInTheDocument()
    expect(screen.getByText('Chọn một mục từ danh sách để xem chi tiết')).toBeInTheDocument()
    expect(screen.queryByText('Chi Tiết Hội Viên')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Danh sách các mục')).toBeInTheDocument()
    expect(screen.getByLabelText('Chi tiết mục đã chọn')).toBeInTheDocument()
  })

  it('renders detail content when selectedId is provided', () => {
    render(
      <SplitPane
        masterList={<div>Danh Sách Hội Viên</div>}
        detailPane={<div>Chi Tiết Hội Viên #123</div>}
        selectedId="123"
      />
    )

    expect(screen.getByText('Danh Sách Hội Viên')).toBeInTheDocument()
    expect(screen.getByText('Chi Tiết Hội Viên #123')).toBeInTheDocument()
    expect(screen.queryByText('Chọn một mục từ danh sách để xem chi tiết')).not.toBeInTheDocument()
  })

  it('triggers onBackToList callback when mobile back button is clicked', () => {
    const handleBack = vi.fn()
    render(
      <SplitPane
        masterList={<div>Danh Sách Hội Viên</div>}
        detailPane={<div>Chi Tiết Hội Viên #123</div>}
        selectedId="123"
        onBackToList={handleBack}
        backLabel="Quay lại"
      />
    )

    const backButton = screen.getByRole('button', { name: 'Quay lại' })
    expect(backButton).toBeInTheDocument()

    fireEvent.click(backButton)
    expect(handleBack).toHaveBeenCalledTimes(1)
  })

  it('renders custom empty detail message', () => {
    render(
      <SplitPane
        masterList={<div>Danh Sách</div>}
        detailPane={<div>Chi Tiết</div>}
        selectedId={null}
        emptyDetailMessage="Vui lòng chọn một bản ghi từ thanh bên trái"
      />
    )

    expect(screen.getByText('Vui lòng chọn một bản ghi từ thanh bên trái')).toBeInTheDocument()
  })
})
