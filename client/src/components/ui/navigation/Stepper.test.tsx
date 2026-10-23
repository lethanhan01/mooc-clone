import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Stepper, type StepItem } from './Stepper'

describe('Stepper Component', () => {
  const steps: StepItem[] = [
    { title: 'Thông tin cá nhân', description: 'Họ tên & Email' },
    { title: 'Chọn gói tập', description: 'Gói VIP 12 tháng' },
    { title: 'Thanh toán', description: 'Quét mã QR' },
  ]

  it('renders steps with active and completed status', () => {
    render(<Stepper steps={steps} activeStep={1} />)

    expect(screen.getByText('Thông tin cá nhân')).toBeInTheDocument()
    expect(screen.getByText('Chọn gói tập')).toBeInTheDocument()
    expect(screen.getByText('Thanh toán')).toBeInTheDocument()

    const stepButtons = screen.getAllByRole('button')
    expect(stepButtons[1]).toHaveAttribute('aria-current', 'step')
  })

  it('triggers onStepClick when clickable is true', () => {
    const onStepClick = vi.fn()
    render(<Stepper steps={steps} activeStep={2} clickable onStepClick={onStepClick} />)

    const step0Button = screen.getAllByRole('button')[0]
    fireEvent.click(step0Button)

    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it('renders vertical orientation', () => {
    render(<Stepper steps={steps} activeStep={0} orientation="vertical" />)
    expect(screen.getByText('Họ tên & Email')).toBeInTheDocument()
  })

  it('supports forwardRef', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Stepper ref={ref} steps={steps} activeStep={1} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

