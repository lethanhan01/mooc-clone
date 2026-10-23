import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function ProblemChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Component crashed intentionally')
  }
  return <div>Normal Child Content</div>
}

describe('ErrorBoundary Component', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('TC-EB-01: renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal Child Content')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('TC-EB-02: catches child render error and renders fallback UI with default messages', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByText(/Đã có sự cố xảy ra \/ An unexpected error occurred/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Đã xảy ra lỗi không mong muốn khi hiển thị nội dung này/i)
    ).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('TC-EB-03: renders custom fallbackTitle and fallbackMessage when provided', () => {
    render(
      <ErrorBoundary
        fallbackTitle="Custom Error Header"
        fallbackMessage="Custom detailed message explaining what failed"
      >
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom Error Header')).toBeInTheDocument()
    expect(
      screen.getByText('Custom detailed message explaining what failed')
    ).toBeInTheDocument()
  })

  it('TC-EB-04: calls onError callback prop with error and componentStack', () => {
    const onErrorMock = vi.fn()

    render(
      <ErrorBoundary onError={onErrorMock}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onErrorMock).toHaveBeenCalledTimes(1)
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })

  it('TC-EB-05: clicking Reload button triggers onReset and resets internal state', () => {
    const onResetMock = vi.fn()

    function StatefulTestApp() {
      const [shouldThrow, setShouldThrow] = useState(true)
      return (
        <ErrorBoundary
          onReset={() => {
            setShouldThrow(false)
            onResetMock()
          }}
        >
          <ProblemChild shouldThrow={shouldThrow} />
        </ErrorBoundary>
      )
    }

    render(<StatefulTestApp />)

    expect(screen.getByRole('alert')).toBeInTheDocument()

    const reloadButton = screen.getByRole('button', { name: /thử tải lại \/ reload/i })
    fireEvent.click(reloadButton)

    expect(onResetMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Normal Child Content')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('TC-EB-06: clicking Home button calls onNavigateHome callback prop', () => {
    const onNavigateHomeMock = vi.fn()

    render(
      <ErrorBoundary onNavigateHome={onNavigateHomeMock}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )

    const homeButton = screen.getByRole('button', { name: /về trang chủ \/ home/i })
    fireEvent.click(homeButton)

    expect(onNavigateHomeMock).toHaveBeenCalledTimes(1)
  })

  it('TC-EB-07: automatically resets error state when resetKeys change', () => {
    let shouldThrow = true

    const { rerender } = render(
      <ErrorBoundary resetKeys={['/member/workout/1']}>
        <ProblemChild shouldThrow={shouldThrow} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Route changed to /member/profile, and problem child now renders cleanly
    shouldThrow = false
    rerender(
      <ErrorBoundary resetKeys={['/member/profile']}>
        <ProblemChild shouldThrow={shouldThrow} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal Child Content')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('TC-EB-08: shows and hides collapsible dev stack trace when toggled', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )

    const toggleButton = screen.getByRole('button', {
      name: /chi tiết lỗi \(chỉ hiển thị ở chế độ dev\)/i,
    })
    expect(toggleButton).toBeInTheDocument()

    // Initially collapsed
    expect(screen.queryByText(/Component crashed intentionally/i)).not.toBeInTheDocument()

    // Click to expand
    fireEvent.click(toggleButton)
    expect(screen.getByText(/Component crashed intentionally/i)).toBeInTheDocument()

    // Click to collapse again
    fireEvent.click(toggleButton)
    expect(screen.queryByText(/Component crashed intentionally/i)).not.toBeInTheDocument()
  })
})
