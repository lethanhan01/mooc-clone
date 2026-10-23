import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickComponentFinder } from './QuickComponentFinder'

describe('QuickComponentFinder Component', () => {
  const onSelectMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search trigger button with Ctrl+K shortcut cue', () => {
    render(<QuickComponentFinder onSelectComponent={onSelectMock} />)
    expect(screen.getByText('Tìm nhanh Component / Flow...')).toBeVisible()
    expect(screen.getByText('⌘ / Ctrl')).toBeVisible()
  })

  it('opens search palette dialog upon clicking the trigger button', async () => {
    const user = userEvent.setup()
    render(<QuickComponentFinder onSelectComponent={onSelectMock} />)

    await user.click(screen.getByRole('button', { name: /Tìm nhanh Component/i }))

    expect(screen.getByRole('dialog', { name: 'Tìm kiếm component' })).toBeVisible()
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Nhập tên component/i)).toHaveFocus()
    })
  })

  it('opens and closes palette using keyboard shortcut Ctrl+K and Escape', async () => {
    const user = userEvent.setup()
    render(<QuickComponentFinder onSelectComponent={onSelectMock} />)

    await user.keyboard('{Control>}k{/Control}')
    expect(screen.getByRole('dialog', { name: 'Tìm kiếm component' })).toBeVisible()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Tìm kiếm component' })).not.toBeInTheDocument()
  })

  it('filters components dynamically and allows selecting an item', async () => {
    const user = userEvent.setup()
    render(<QuickComponentFinder onSelectComponent={onSelectMock} />)

    await user.click(screen.getByRole('button', { name: /Tìm nhanh Component/i }))
    const input = screen.getByPlaceholderText(/Nhập tên component/i)
    await user.type(input, 'Button')

    const buttonResult = await screen.findByText('Button')
    expect(buttonResult).toBeVisible()

    await user.click(buttonResult)
    expect(onSelectMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Button' })
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('clears query when clicking the X clear button', async () => {
    const user = userEvent.setup()
    render(<QuickComponentFinder onSelectComponent={onSelectMock} />)

    await user.click(screen.getByRole('button', { name: /Tìm nhanh Component/i }))
    const input = screen.getByPlaceholderText(/Nhập tên component/i)
    await user.type(input, 'table')

    const clearBtn = screen.getByRole('button', { name: 'Xóa nội dung' })
    await user.click(clearBtn)

    expect(input).toHaveValue('')
  })

  it('closes dialog when clicking outside on the backdrop', async () => {
    const user = userEvent.setup()
    render(<QuickComponentFinder onSelectComponent={onSelectMock} />)

    await user.click(screen.getByRole('button', { name: /Tìm nhanh Component/i }))
    const dialog = screen.getByRole('dialog', { name: 'Tìm kiếm component' })
    expect(dialog).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Đóng tìm kiếm' }))
    expect(screen.queryByRole('dialog', { name: 'Tìm kiếm component' })).not.toBeInTheDocument()
  })
})
