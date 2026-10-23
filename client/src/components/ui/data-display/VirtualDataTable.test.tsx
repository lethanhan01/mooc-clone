import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VirtualDataTable, ColumnDef } from './VirtualDataTable'

interface MockMember {
  id: string
  name: string
  package: string
}

describe('VirtualDataTable Component (VirtualDataTable.tsx)', () => {
  const columns: ColumnDef<MockMember>[] = [
    { key: 'name', header: 'Họ và tên', render: (row) => row.name },
    { key: 'package', header: 'Gói tập', render: (row) => row.package },
  ]

  it('renders empty message when data is an empty array', () => {
    render(
      <VirtualDataTable
        data={[]}
        columns={columns}
        emptyMessage="Không tìm thấy hội viên nào."
      />
    )

    expect(screen.getByText('Không tìm thấy hội viên nào.')).toBeInTheDocument()
  })

  it('renders table headers and virtualized row elements correctly', () => {
    const mockData: MockMember[] = [
      { id: '1', name: 'Nguyễn Văn A', package: 'VIP Gold' },
      { id: '2', name: 'Trần Thị B', package: 'Standard' },
    ]

    render(
      <VirtualDataTable
        data={mockData}
        columns={columns}
        getRowId={(row) => row.id}
      />
    )

    expect(screen.getByText('Họ và tên')).toBeInTheDocument()
    expect(screen.getByText('Gói tập')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.getByText('VIP Gold')).toBeInTheDocument()
  })
})
