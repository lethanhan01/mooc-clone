import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { StructuredLogger } from './logger'

interface LogPayload {
  level?: string
  message?: string
  context?: Record<string, unknown>
  data?: Record<string, unknown>
  error?: Record<string, unknown>
  timestamp?: string
}

describe('Structured Logger (logger.ts)', () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('outputs structured info log with timestamp and message', () => {
    const logger = new StructuredLogger({ userId: 'user-01' })
    logger.info('User completed check-in', { branch: 'Hanoi' })

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
    const [msg, payload] = consoleInfoSpy.mock.calls[0] as [string, LogPayload]
    expect(msg).toBe('[INFO] User completed check-in')
    expect(payload.level).toBe('info')
    expect(payload.context?.userId).toBe('user-01')
    expect(payload.data?.branch).toBe('Hanoi')
    expect(payload.timestamp).toBeDefined()
  })

  it('automatically redacts sensitive fields like passwords and tokens', () => {
    const logger = new StructuredLogger()
    logger.warn('Auth attempt', {
      username: 'admin',
      password: 'super-secret-password',
      accessToken: 'jwt-token-12345',
    })

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
    const [, payload] = consoleWarnSpy.mock.calls[0] as [string, LogPayload]
    expect(payload.data?.username).toBe('admin')
    expect(payload.data?.password).toBe('[REDACTED]')
    expect(payload.data?.accessToken).toBe('[REDACTED]')
  })

  it('enriches error logs with stack trace and message', () => {
    const logger = new StructuredLogger()
    const err = new Error('Network timeout during sync')
    logger.error('Failed sync', err, { retryCount: 3 })

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    const [, payload] = consoleErrorSpy.mock.calls[0] as [string, LogPayload]
    expect(payload.error?.message).toBe('Network timeout during sync')
    expect(payload.error?.name).toBe('Error')
    expect(payload.data?.retryCount).toBe(3)
  })

  it('creates an immutable child logger with withContext', () => {
    const baseLogger = new StructuredLogger({ service: 'client' })
    const childLogger = baseLogger.withContext({ route: '/dashboard' })

    childLogger.info('Route navigated')
    const [, payload] = consoleInfoSpy.mock.calls[0] as [string, LogPayload]
    expect(payload.context?.service).toBe('client')
    expect(payload.context?.route).toBe('/dashboard')
  })
})
