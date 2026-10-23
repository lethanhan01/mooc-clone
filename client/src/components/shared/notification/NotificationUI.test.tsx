import { fireEvent, render, screen } from '@testing-library/react'
import { Check } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { NotificationAlert, NotificationPanel, NotificationToast } from './NotificationUI'

describe('NotificationUI', () => {
  it('renders a success toast with optional icon, action, and close control', () => {
    const onClose = vi.fn()

    render(
      <NotificationToast
        tone="success"
        message="Payment complete"
        icon={<Check data-testid="toast-icon" />}
        action={<button type="button">View</button>}
        onClose={onClose}
      />
    )

    const toast = screen.getByRole('status')
    expect(toast).toHaveClass('rogym-notification-toast')
    expect(toast).toHaveAttribute('data-tone', 'success')
    expect(screen.getByText('Payment complete')).toBeVisible()
    expect(screen.getByTestId('toast-icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View' })).toBeVisible()
    expect(screen.getByText('Payment complete')).toHaveClass('rogym-notification-toast__message')
    expect(screen.getByRole('button', { name: 'View' }).parentElement).toHaveClass(
      'rogym-notification-toast__action'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close notification' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses alert semantics for danger alerts', () => {
    render(<NotificationAlert tone="danger" title="Failed" message="Try again" />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('rogym-notification-alert')
    expect(alert).toHaveAttribute('data-tone', 'danger')
    expect(screen.getByText('Failed')).toBeVisible()
    expect(screen.getByText('Try again')).toBeVisible()
  })

  it('renders a labelled notification panel surface', () => {
    render(
      <NotificationPanel titleId="panel-title">
        <h2 id="panel-title">Notifications</h2>
      </NotificationPanel>
    )

    expect(screen.getByRole('region', { name: 'Notifications' })).toHaveClass(
      'rogym-notification-panel'
    )
  })
})
