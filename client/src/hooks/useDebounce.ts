import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useDebounceValue Hook (PERF-005)
 * Delays updating the state value until a given delay has passed without updates.
 */
export function useDebounceValue<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delayMs])

  return debouncedValue
}

/**
 * useDebouncedCallback Hook (PERF-005)
 * Returns a debounced version of the callback function that delays execution until after delayMs.
 */
export function useDebouncedCallback<Args extends unknown[], R = void>(
  callback: (...args: Args) => R,
  delayMs = 300
): (...args: Args) => void {
  const callbackRef = useRef(callback)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Args) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delayMs)
    },
    [delayMs]
  )
}
