import { describe, it, expect, vi } from 'vitest'
import { retryWithBackoff } from './backoff-retry'

describe('Exponential Backoff Retry Utility (backoff-retry.ts)', () => {
  it('returns immediately on first attempt when operation succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await retryWithBackoff(fn, { maxRetries: 3 })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries when operation fails until it succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network glitch'))
      .mockResolvedValueOnce('recovered')

    const result = await retryWithBackoff(fn, {
      maxRetries: 3,
      initialDelayMs: 10,
      jitter: false,
    })

    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('throws error after exhausting maxRetries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Persistent 500'))

    await expect(
      retryWithBackoff(fn, {
        maxRetries: 2,
        initialDelayMs: 10,
        jitter: false,
      })
    ).rejects.toThrow('Persistent 500')

    // 1 initial attempt + 2 retries = 3 calls
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('halts retry immediately if shouldRetry returns false', async () => {
    class ClientError extends Error {
      status = 401
    }

    const fn = vi.fn().mockRejectedValue(new ClientError('Unauthorized'))

    await expect(
      retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelayMs: 10,
        shouldRetry: (err) => (err as ClientError).status !== 401,
      })
    ).rejects.toThrow('Unauthorized')

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
