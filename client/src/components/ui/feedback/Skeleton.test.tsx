import { createRef } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton, SkeletonText, SkeletonCircle } from './Skeleton'

describe('Skeleton Component', () => {
  it('renders base skeleton with pulse animation and dimensions', () => {
    const { container } = render(<Skeleton width={200} height={40} rounded="lg" />)
    const skeleton = container.firstElementChild
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-lg')
    expect(skeleton).toHaveStyle({ width: '200px', height: '40px' })
  })

  it('renders SkeletonText with specified line count', () => {
    const { container } = render(<SkeletonText lines={4} />)
    const lines = container.querySelectorAll('.animate-pulse')
    expect(lines).toHaveLength(4)
  })

  it('renders SkeletonCircle with circular rounded styling', () => {
    const { container } = render(<SkeletonCircle size={48} />)
    const circle = container.firstElementChild
    expect(circle).toHaveClass('rounded-full')
    expect(circle).toHaveStyle({ width: '48px', height: '48px' })
  })

  it('supports forwardRef for Skeleton, SkeletonText, and SkeletonCircle', () => {
    const skeletonRef = createRef<HTMLDivElement>()
    const textRef = createRef<HTMLDivElement>()
    const circleRef = createRef<HTMLDivElement>()

    render(
      <div>
        <Skeleton ref={skeletonRef} width={100} height={20} />
        <SkeletonText ref={textRef} lines={2} />
        <SkeletonCircle ref={circleRef} size={32} />
      </div>
    )

    expect(skeletonRef.current).toBeInstanceOf(HTMLDivElement)
    expect(textRef.current).toBeInstanceOf(HTMLDivElement)
    expect(circleRef.current).toBeInstanceOf(HTMLDivElement)
  })
})

