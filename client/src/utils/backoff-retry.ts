/**
 * Exponential Backoff with Full Jitter Utility (API-004)
 * Automatically retries transient network failures or 5xx server glitches.
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  factor?: number
  jitter?: boolean
  shouldRetry?: (error: unknown, attempt: number) => boolean
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getSecureRandomRatio(): number {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const uint32Array = new Uint32Array(1)
    globalThis.crypto.getRandomValues(uint32Array)
    return (uint32Array[0] ?? 0) / (0xffffffff + 1)
  }
  return 0.5
}

export async function retryWithBackoff<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 300,
    maxDelayMs = 5000,
    factor = 2,
    jitter = true,
    shouldRetry = () => true,
  } = options

  async function executeAttempt(attempt: number): Promise<T> {
    try {
      return await operation(attempt)
    } catch (error) {
      if (attempt > maxRetries || !shouldRetry(error, attempt)) {
        throw error
      }

      // Calculate exponential backoff delay: initialDelay * factor^(attempt - 1)
      const calculatedDelay = initialDelayMs * Math.pow(factor, attempt - 1)
      const cappedDelay = Math.min(calculatedDelay, maxDelayMs)

      // Apply Full Jitter: random between 0 and cappedDelay using secure PRNG
      const actualDelay = jitter
        ? Math.floor(getSecureRandomRatio() * cappedDelay)
        : cappedDelay

      await sleep(actualDelay)
      return executeAttempt(attempt + 1)
    }
  }

  return executeAttempt(1)
}
