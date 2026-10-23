import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnalyticsPanel } from './AnalyticsPanel'

describe('AnalyticsPanel Component', () => {
  it('renders standard data-dense layout with title, table, and pagination', () => {
    render(
      <AnalyticsPanel
        title="Lịch Sử Điểm Danh"
        description="Xem và đối soát dữ liệu ra vào phòng tập"
        actions={<button type="button">Xuất Excel</button>}
        table={<table><tbody><tr><td>Hội viên A</td></tr></tbody></table>}
        pagination={<nav aria-label="Phân trang">Trang 1 / 10</nav>}
      />
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Lịch Sử Điểm Danh' })).toBeInTheDocument()
    expect(screen.getByText('Xem và đối soát dữ liệu ra vào phòng tập')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất Excel' })).toBeInTheDocument()
    expect(screen.getByText('Hội viên A')).toBeInTheDocument()
    expect(screen.getByText('Trang 1 / 10')).toBeInTheDocument()
    expect(screen.getByLabelText('Bảng dữ liệu phân tích')).toBeInTheDocument()
  })

  it('renders custom header when provided', () => {
    render(
      <AnalyticsPanel
        header={<div>Custom Header Area</div>}
        table={<div>Table Content</div>}
      />
    )

    expect(screen.getByText('Custom Header Area')).toBeInTheDocument()
    expect(screen.getByText('Table Content')).toBeInTheDocument()
  })

  it('renders toolbar and filters with semantic landmark', () => {
    render(
      <AnalyticsPanel
        title="Báo Cáo"
        toolbar={<div>Toolbar Actions</div>}
        filters={<div>Filter Chips</div>}
        table={<div>Data Table</div>}
      />
    )

    expect(screen.getByLabelText('Bộ lọc và tìm kiếm')).toBeInTheDocument()
    expect(screen.getByText('Toolbar Actions')).toBeInTheDocument()
    expect(screen.getByText('Filter Chips')).toBeInTheDocument()
  })

  it('renders bulkActions inside polite live region for screen readers', () => {
    render(
      <AnalyticsPanel
        title="Giao Dịch"
        bulkActions={<div>Đã chọn 5 mục. <button type="button">Xóa tất cả</button></div>}
        table={<div>Data Table</div>}
      />
    )

    const bulkRegion = screen.getByRole('region', { name: 'Thao tác hàng loạt' })
    expect(bulkRegion).toBeInTheDocument()
    expect(bulkRegion).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: 'Xóa tất cả' })).toBeInTheDocument()
  })

  it('renders emptyState when isEmpty is true', () => {
    render(
      <AnalyticsPanel
        title="Danh Sách Trống"
        table={<div>Table Content</div>}
        isEmpty={true}
        emptyState={<div>Không có bản ghi nào phù hợp</div>}
      />
    )

    expect(screen.getByText('Không có bản ghi nào phù hợp')).toBeInTheDocument()
    expect(screen.queryByText('Table Content')).not.toBeInTheDocument()
  })

  it('supports polymorphic root component', () => {
    const { container } = render(
      <AnalyticsPanel
        as="section"
        title="Section Panel"
        table={<div>Data</div>}
      />
    )

    expect(container.querySelector('section')).toBeInTheDocument()
    expect(screen.queryByRole('main')).not.toBeInTheDocument()
  })
})
