import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
  TableEmpty,
} from './Table'

describe('Table Primitive', () => {
  it('renders complete semantic table structure', () => {
    render(
      <TableContainer>
        <Table>
          <TableCaption>Danh sách học viên</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Tên học viên</TableHead>
              <TableHead>Gói tập</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Nguyễn Văn A</TableCell>
              <TableCell>Gói VIP</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Tổng: 1 học viên</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Tên học viên')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.getByText('Tổng: 1 học viên')).toBeInTheDocument()
    expect(screen.getByText('Danh sách học viên')).toBeInTheDocument()
  })

  it('supports striped and compact variants', () => {
    const { rerender } = render(
      <Table variant="striped" data-testid="test-table">
        <TableBody>
          <TableRow>
            <TableCell>Item 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByTestId('test-table')).toHaveClass('[&_tbody_tr:nth-child(even)]:bg-surface-sunken/40')

    rerender(
      <Table variant="compact" data-testid="test-table">
        <TableBody>
          <TableRow>
            <TableCell>Item 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByTestId('test-table')).toHaveClass('text-xs')
  })

  it('renders TableEmpty row correctly', () => {
    render(
      <Table>
        <TableBody>
          <TableEmpty colSpan={3}>Không tìm thấy kết quả nào</TableEmpty>
        </TableBody>
      </Table>
    )

    expect(screen.getByText('Không tìm thấy kết quả nào')).toBeInTheDocument()
  })
})
