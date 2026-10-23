import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounceValue, useDebouncedCallback } from './useDebounce'

describe('useDebounce Hooks (useDebounce.ts)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useDebounceValue', () => {
    it('returns initial value immediately and delays updates until timer fires', () => {
      const { result, rerender } = renderHook(({ val }) => useDebounceValue(val, 300), {
        initialProps: { val: 'initial' },
      })

      expect(result.current).toBe('initial')

      rerender({ val: 'updated' })
      expect(result.current).toBe('initial')

      act(() => {
        vi.advanceTimersByTime(299)
      })
      expect(result.current).toBe('initial')

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(result.current).toBe('updated')
    })
  })

  describe('useDebouncedCallback', () => {
    it('executes callback only once after the quiet period', () => {
      const fn = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(fn, 200))

      act(() => {
        result.current('a')
        result.current('b')
        result.current('c')
      })

      expect(fn).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('c')
    })
  })
})
