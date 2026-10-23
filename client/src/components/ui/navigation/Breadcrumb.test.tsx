import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb'

describe('Breadcrumb Component', () => {
  it('renders breadcrumb items, links and current page', () => {
    render(
      <MemoryRouter>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to="/home">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="https://external.example.com">Tài liệu</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chi tiết</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </MemoryRouter>
    )

    expect(screen.getByText('Trang chủ')).toBeInTheDocument()
    expect(screen.getByText('Tài liệu')).toBeInTheDocument()
    expect(screen.getByText('Chi tiết')).toBeInTheDocument()

    const pageSpan = screen.getByText('Chi tiết')
    expect(pageSpan).toHaveAttribute('aria-current', 'page')
  })
})
