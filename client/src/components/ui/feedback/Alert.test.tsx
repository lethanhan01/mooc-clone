import { createRef } from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { Sparkles } from 'lucide-react'
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertIcon,
  AlertAction,
  AlertCloseButton,
  AlertProgressBar,
} from './Alert'

describe('Alert Component', () => {
  describe('Shorthand Props & Accessibility Roles', () => {
    it('renders alert with title and description using tone="danger"', () => {
      render(
        <Alert tone="danger">
          <AlertTitle>Lỗi hệ thống</AlertTitle>
          <AlertDescription>Không thể kết nối tới server</AlertDescription>
        </Alert>
      )

      const alertEl = screen.getByRole('alert')
      expect(alertEl).toBeInTheDocument()
      expect(alertEl).toHaveAttribute('aria-live', 'assertive')
      expect(screen.getByText('Lỗi hệ thống')).toBeInTheDocument()
      expect(screen.getByText('Không thể kết nối tới server')).toBeInTheDocument()
    })

    it('renders with different emphasis levels: subtle, solid, outline', () => {
      const { rerender } = render(
        <Alert tone="success" emphasis="subtle" title="Subtle Alert" />
      )
      let alertEl = screen.getByRole('status')
      expect(alertEl).toHaveClass('bg-status-success-bg', 'text-status-success-fg')

      rerender(<Alert tone="success" emphasis="solid" title="Solid Alert" />)
      alertEl = screen.getByRole('status')
      expect(alertEl).toHaveClass('bg-status-success-solid', 'text-status-success-on-solid')

      rerender(<Alert tone="success" emphasis="outline" title="Outline Alert" />)
      alertEl = screen.getByRole('status')
      expect(alertEl).toHaveClass('bg-transparent', 'border-status-success-border', 'text-status-success-fg')
    })

    it('renders danger tone with solid emphasis', () => {
      render(<Alert tone="danger" emphasis="solid" title="Filled Alert" />)
      const alertEl = screen.getByRole('alert')
      expect(alertEl).toHaveClass('bg-status-danger-solid', 'text-status-danger-on-solid')
    })

    it('allows custom role override', () => {
      render(<Alert tone="danger" role="region" title="Custom Region" />)
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('triggers onClose when close button is clicked in shorthand mode', () => {
      const onClose = vi.fn()
      render(
        <Alert tone="warning" title="Cảnh báo" onClose={onClose} closeAriaLabel="Đóng thông báo">
          Nội dung cảnh báo
        </Alert>
      )

      expect(screen.getByText('Nội dung cảnh báo')).toBeInTheDocument()
      const closeBtn = screen.getByRole('button', { name: 'Đóng thông báo' })
      fireEvent.click(closeBtn)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('renders custom icon prop when provided in shorthand mode', () => {
      render(
        <Alert
          tone="info"
          title="Thông báo"
          icon={<span data-testid="custom-shorthand-icon">🌟</span>}
        />
      )
      expect(screen.getByTestId('custom-shorthand-icon')).toBeInTheDocument()
    })

    it('renders action elements when provided in shorthand mode', () => {
      render(
        <Alert
          tone="info"
          title="Thông báo"
          action={<button type="button">Xác nhận ngay</button>}
        />
      )
      expect(screen.getByRole('button', { name: 'Xác nhận ngay' })).toBeInTheDocument()
    })
  })

  describe('Compound Sub-components & Auto-Inference', () => {
    it('auto-infers semantic icon from tone via <Alert.Icon />', () => {
      const { rerender } = render(
        <Alert tone="warning">
          <Alert.Icon data-testid="alert-icon" />
          <Alert.Title>Cảnh báo</Alert.Title>
        </Alert>
      )
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument()

      rerender(
        <Alert tone="success">
          <Alert.Icon data-testid="alert-icon" />
          <Alert.Title>Thành công</Alert.Title>
        </Alert>
      )
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
    })

    it('supports custom icon inside <Alert.Icon>', () => {
      render(
        <Alert tone="accent">
          <Alert.Icon>
            <Sparkles data-testid="custom-sparkle" size={20} />
          </Alert.Icon>
          <Alert.Title>Ưu đãi đặc biệt</Alert.Title>
        </Alert>
      )
      expect(screen.getByTestId('custom-sparkle')).toBeInTheDocument()
    })

    it('renders Compound Action, Title, Description, and CloseButton seamlessly', () => {
      const handleClose = vi.fn()
      render(
        <Alert tone="info" onClose={handleClose} closeAriaLabel="Tắt tin tức">
          <Alert.Icon />
          <div className="flex-1">
            <Alert.Title>Tin tức mới</Alert.Title>
            <Alert.Description>Phòng tập mở cửa cả tuần.</Alert.Description>
            <Alert.Action>
              <button type="button">Xem lịch</button>
            </Alert.Action>
          </div>
          <Alert.CloseButton />
        </Alert>
      )

      expect(screen.getByText('Tin tức mới')).toBeInTheDocument()
      expect(screen.getByText('Phòng tập mở cửa cả tuần.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Xem lịch' })).toBeInTheDocument()

      const closeBtn = screen.getByRole('button', { name: 'Tắt tin tức' })
      fireEvent.click(closeBtn)
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('allows custom onClick and children on <Alert.CloseButton>', () => {
      const handleClose = vi.fn()
      const customClick = vi.fn((e: React.MouseEvent) => {
        e.preventDefault()
      })

      render(
        <Alert tone="danger" onClose={handleClose}>
          <Alert.Title>Lỗi</Alert.Title>
          <Alert.CloseButton onClick={customClick}>
            <span>Đóng lại</span>
          </Alert.CloseButton>
        </Alert>
      )

      const closeBtn = screen.getByRole('button', { name: 'Close alert' })
      expect(screen.getByText('Đóng lại')).toBeInTheDocument()
      fireEvent.click(closeBtn)

      expect(customClick).toHaveBeenCalledTimes(1)
      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe('autoDismiss, Pause on Hover / Focus & ProgressBar', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('automatically calls onClose after autoDismiss timeout', () => {
      const handleClose = vi.fn()
      render(
        <Alert tone="warning" autoDismiss={3000} onClose={handleClose}>
          <Alert.Title>Tự đóng sau 3s</Alert.Title>
          <Alert.ProgressBar />
        </Alert>
      )

      expect(handleClose).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(2999)
      })
      expect(handleClose).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(2)
      })
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('pauses timer on mouseEnter and resumes on mouseLeave (WCAG 2.2.1)', () => {
      const handleClose = vi.fn()
      const { container } = render(
        <Alert tone="info" autoDismiss={4000} onClose={handleClose}>
          <Alert.Title>Tạm dừng khi di chuột</Alert.Title>
          <Alert.ProgressBar />
        </Alert>
      )
      const alertEl = container.firstElementChild as HTMLElement

      // Chạy 2 giây đầu
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(handleClose).not.toHaveBeenCalled()

      // Di chuột vào: Tạm dừng
      fireEvent.mouseEnter(alertEl)

      // Chờ thêm 5 giây trong khi đang hover -> không được tự đóng
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(handleClose).not.toHaveBeenCalled()

      // Rời chuột: Tiếp tục đếm 2 giây còn lại
      fireEvent.mouseLeave(alertEl)

      act(() => {
        vi.advanceTimersByTime(1999)
      })
      expect(handleClose).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(2)
      })
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('pauses timer on focus and resumes on blur (WCAG 2.2.1)', () => {
      const handleClose = vi.fn()
      const { container } = render(
        <Alert tone="danger" autoDismiss={3000} onClose={handleClose}>
          <Alert.Title>Tạm dừng khi bàn phím focus</Alert.Title>
          <button type="button">Nút tương tác</button>
          <Alert.ProgressBar />
        </Alert>
      )
      const alertEl = container.firstElementChild as HTMLElement

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(handleClose).not.toHaveBeenCalled()

      // Focus vào Alert
      fireEvent.focus(alertEl)

      act(() => {
        vi.advanceTimersByTime(4000)
      })
      expect(handleClose).not.toHaveBeenCalled()

      // Blur khỏi Alert
      fireEvent.blur(alertEl)

      act(() => {
        vi.advanceTimersByTime(2001)
      })
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('renders progress bar with custom duration override', () => {
      render(
        <Alert tone="success">
          <Alert.Title>Tiến trình tùy chỉnh</Alert.Title>
          <Alert.ProgressBar duration={6000} data-testid="custom-bar" />
        </Alert>
      )

      const bar = screen.getByTestId('custom-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveStyle({
        animation: 'alert-progress-shrink 6000ms linear forwards',
      })
    })

    it('automatically renders progress bar in shorthand mode when showProgressBar is true', () => {
      render(
        <Alert
          tone="info"
          title="Shorthand Progress"
          autoDismiss={5000}
          showProgressBar
        />
      )

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('supports custom event handlers onMouseEnter, onMouseLeave, onFocus, and onBlur', () => {
      const onMouseEnter = vi.fn()
      const onMouseLeave = vi.fn()
      const onFocus = vi.fn()
      const onBlur = vi.fn()

      const { container } = render(
        <Alert
          tone="info"
          autoDismiss={2000}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          Nội dung
        </Alert>
      )
      const el = container.firstElementChild as HTMLElement

      fireEvent.mouseEnter(el)
      expect(onMouseEnter).toHaveBeenCalled()

      fireEvent.mouseLeave(el)
      expect(onMouseLeave).toHaveBeenCalled()

      fireEvent.focus(el)
      expect(onFocus).toHaveBeenCalled()

      fireEvent.blur(el)
      expect(onBlur).toHaveBeenCalled()
    })

    it('returns null for AlertProgressBar when duration is 0 or undefined', () => {
      const { container } = render(
        <Alert tone="info">
          <AlertProgressBar duration={0} />
        </Alert>
      )
      expect(container.querySelector('progress')).toBeNull()
    })

    it('clears timer properly on unmount', () => {
      const handleClose = vi.fn()
      const { unmount } = render(
        <Alert tone="warning" autoDismiss={4000} onClose={handleClose}>
          Tạm biệt
        </Alert>
      )
      unmount()
      // Advancing timer after unmount should not trigger callback
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe('forwardRef Support for All Components', () => {
    it('supports forwardRef for Alert, AlertTitle, AlertDescription, AlertIcon, AlertAction, AlertCloseButton, and AlertProgressBar', () => {
      const alertRef = createRef<HTMLElement>()
      const titleRef = createRef<HTMLHeadingElement>()
      const descRef = createRef<HTMLParagraphElement>()
      const iconRef = createRef<HTMLElement>()
      const actionRef = createRef<HTMLElement>()
      const closeRef = createRef<HTMLButtonElement>()
      const progressRef = createRef<HTMLProgressElement>()

      render(
        <Alert ref={alertRef} tone="success" autoDismiss={5000}>
          <AlertIcon ref={iconRef} />
          <AlertTitle ref={titleRef}>Thành công</AlertTitle>
          <AlertDescription ref={descRef}>Đã lưu dữ liệu</AlertDescription>
          <AlertAction ref={actionRef}>
            <span>Hành động</span>
          </AlertAction>
          <AlertCloseButton ref={closeRef} />
          <AlertProgressBar ref={progressRef} />
        </Alert>
      )

      expect(alertRef.current).toBeInstanceOf(HTMLElement)
      expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement)
      expect(descRef.current).toBeInstanceOf(HTMLParagraphElement)
      expect(iconRef.current).toBeInstanceOf(HTMLElement)
      expect(actionRef.current).toBeInstanceOf(HTMLElement)
      expect(closeRef.current).toBeInstanceOf(HTMLButtonElement)
      expect(progressRef.current).toBeInstanceOf(HTMLProgressElement)
    })
  })
})


