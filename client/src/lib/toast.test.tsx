import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const sonnerMock = vi.hoisted(() => ({
  custom: vi.fn(),
  dismiss: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: sonnerMock,
}))

import { toast } from './toast'

describe('toast', () => {
  it('renders a long error with action and dismisses it from either control', () => {
    const retry = vi.fn()
    sonnerMock.custom.mockImplementation((renderToast: (id: string) => ReactNode) => {
      render(renderToast('toast-1'))
      return 'toast-1'
    })

    toast.error('Không thể cập nhật phản hồi vì máy chủ đang tạm thời không phản hồi.', {
      action: { label: 'Thử lại', onClick: retry },
    })

    expect(sonnerMock.custom).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({
      className: 'rogym-sonner-toast',
    }))
    expect(screen.getByRole('alert')).toHaveTextContent('Không thể cập nhật phản hồi')
    expect(screen.getByRole('button', { name: 'Thử lại' }).parentElement).toHaveClass('rogym-notification-toast__action')

    fireEvent.click(screen.getByText('Thử lại'))
    expect(retry).toHaveBeenCalledTimes(1)
    expect(sonnerMock.dismiss).toHaveBeenCalledWith('toast-1')

    fireEvent.click(screen.getByRole('button', { name: 'Close notification' }))
    expect(sonnerMock.dismiss).toHaveBeenCalledTimes(2)
  })
})
