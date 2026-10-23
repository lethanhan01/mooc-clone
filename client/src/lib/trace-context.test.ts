import { describe, it, expect } from 'vitest'
import {
  generateTraceId,
  generateSpanId,
  createTraceHeaders,
} from './trace-context'

describe('Trace Context Utility (trace-context.ts)', () => {
  it('generates a 32-character hexadecimal trace ID', () => {
    const traceId = generateTraceId()
    expect(traceId).toHaveLength(32)
    expect(/^[0-9a-f]{32}$/.test(traceId)).toBe(true)
  })

  it('generates a 16-character hexadecimal span ID', () => {
    const spanId = generateSpanId()
    expect(spanId).toHaveLength(16)
    expect(/^[0-9a-f]{16}$/.test(spanId)).toBe(true)
  })

  it('creates valid W3C traceparent header payload of exactly 55 characters', () => {
    const headers = createTraceHeaders()

    expect(headers['X-Correlation-ID']).toHaveLength(32)
    expect(headers.traceparent).toHaveLength(55)

    // Format: 00-{traceId:32}-{spanId:16}-01
    const parts = headers.traceparent.split('-')
    expect(parts).toHaveLength(4)
    expect(parts[0]).toBe('00')
    expect(parts[1]).toHaveLength(32)
    expect(parts[2]).toHaveLength(16)
    expect(parts[3]).toBe('01')

    // Correlation ID should match the trace ID part
    expect(headers['X-Correlation-ID']).toBe(parts[1])
  })

  it('reuses existing traceId when passed as parameter', () => {
    const customTraceId = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'
    const headers = createTraceHeaders(customTraceId)

    expect(headers['X-Correlation-ID']).toBe(customTraceId)
    expect(headers.traceparent.startsWith(`00-${customTraceId}-`)).toBe(true)
  })
})
