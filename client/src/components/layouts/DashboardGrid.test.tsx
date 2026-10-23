import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardGrid } from './DashboardGrid'

describe('DashboardGrid Component', () => {
  it('renders core landmarks and sections', () => {
    render(
      <DashboardGrid
        header={<h1>Tổng Quan Hệ Thống</h1>}
        kpiCards={<div>KPI Cards Content</div>}
        primaryChart={<div>Primary Revenue Chart</div>}
        recentActivity={<div>Recent Activities Stream</div>}
      />
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Tổng Quan Hệ Thống' })).toBeInTheDocument()
    expect(screen.getByText('KPI Cards Content')).toBeInTheDocument()
    expect(screen.getByText('Primary Revenue Chart')).toBeInTheDocument()
    expect(screen.getByText('Recent Activities Stream')).toBeInTheDocument()

    // Default landmark section labels
    expect(screen.getByLabelText('Chỉ số hiệu suất chính')).toBeInTheDocument()
    expect(screen.getByLabelText('Biểu đồ phân tích')).toBeInTheDocument()
    expect(screen.getByLabelText('Hoạt động gần đây')).toBeInTheDocument()
  })

  it('renders asymmetric chart grid when secondaryChart is provided', () => {
    render(
      <DashboardGrid
        header={<h1>Dashboard</h1>}
        kpiCards={<div>KPI</div>}
        primaryChart={<div>Chart 1</div>}
        secondaryChart={<div>Chart 2</div>}
        recentActivity={<div>Activity</div>}
      />
    )

    const chartSection = screen.getByLabelText('Biểu đồ phân tích')
    expect(chartSection).toHaveClass('grid-cols-1 lg:grid-cols-3')
    expect(screen.getByText('Chart 2')).toBeInTheDocument()
  })

  it('renders quickActions slot when provided', () => {
    render(
      <DashboardGrid
        header={<h1>Dashboard</h1>}
        kpiCards={<div>KPI</div>}
        primaryChart={<div>Chart</div>}
        recentActivity={<div>Activity</div>}
        quickActions={<button type="button">Tạo Hóa Đơn</button>}
      />
    )

    expect(screen.getByLabelText('Thao tác nhanh')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tạo Hóa Đơn' })).toBeInTheDocument()
  })

  it('allows custom aria labels for all landmark sections', () => {
    render(
      <DashboardGrid
        header={<h1>Executive View</h1>}
        kpiCards={<div>KPI</div>}
        primaryChart={<div>Chart</div>}
        recentActivity={<div>Activity</div>}
        kpiAriaLabel="Custom KPI Region"
        chartsAriaLabel="Custom Chart Region"
        activityAriaLabel="Custom Activity Region"
      />
    )

    expect(screen.getByLabelText('Custom KPI Region')).toBeInTheDocument()
    expect(screen.getByLabelText('Custom Chart Region')).toBeInTheDocument()
    expect(screen.getByLabelText('Custom Activity Region')).toBeInTheDocument()
  })
})
