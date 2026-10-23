import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/lib/i18n'
import { PageErrorState } from './PageUI'

describe('PageErrorState', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('vi')
  })

  it('preserves message and retry behavior with the responsive layout classes', () => {
    const onRetry = vi.fn()
    const { container } = render(<PageErrorState message="Không thể tải dữ liệu" onRetry={onRetry} />)

    expect(screen.getByText('Không thể tải dữ liệu')).toBeVisible()
    expect(container.firstElementChild).toHaveClass('flex-col', 'sm:flex-row')

    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
