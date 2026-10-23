import { Suspense } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { lazyWithRetry } from './lazyWithRetry'

const DummyComponent = () => <div>Loaded Chunk Content</div>

describe('Lazy Loading with Retry (lazyWithRetry.tsx)', () => {
  it('renders successfully on first load', async () => {
    const importFn = vi.fn().mockResolvedValue({ default: DummyComponent })
    const LazyComp = lazyWithRetry(importFn)

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComp />
      </Suspense>
    )

    expect(await screen.findByText('Loaded Chunk Content')).toBeInTheDocument()
    expect(importFn).toHaveBeenCalledTimes(1)
  })

  it('retries when first import fails and succeeds on second attempt', async () => {
    let callCount = 0
    const importFn = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.reject(new Error('Failed to fetch dynamically imported module'))
      }
      return Promise.resolve({ default: DummyComponent })
    })

    const LazyComp = lazyWithRetry(importFn, 2, 50)

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComp />
      </Suspense>
    )

    expect(await screen.findByText('Loaded Chunk Content')).toBeInTheDocument()
    expect(importFn).toHaveBeenCalledTimes(2)
  })
})
