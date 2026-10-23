/**
 * W3C Distributed Trace Context Utility (OBS-003)
 * Implements W3C Trace Context recommendation for distributed request tracing
 * between the frontend client and backend microservices.
 */

export interface TraceHeaderPayload {
  traceparent: string
  'X-Correlation-ID': string
}

function randomHex(bytesLength: number): string {
  const bytes = new Uint8Array(bytesLength)
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generates a 32-hex-character W3C trace-id (16 bytes)
 */
export function generateTraceId(): string {
  let traceId = randomHex(16)
  // Trace-id must not be all zeros
  if (/^0+$/.test(traceId)) {
    traceId = `1${traceId.slice(1)}`
  }
  return traceId
}

/**
 * Generates a 16-hex-character W3C span-id / parent-id (8 bytes)
 */
export function generateSpanId(): string {
  let spanId = randomHex(8)
  if (/^0+$/.test(spanId)) {
    spanId = `1${spanId.slice(1)}`
  }
  return spanId
}

/**
 * Creates W3C `traceparent` and correlation headers for outgoing HTTP requests.
 * Format: 00-{trace_id}-{parent_id}-{trace_flags}
 * Example: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
 */
export function createTraceHeaders(existingTraceId?: string): TraceHeaderPayload {
  const traceId = existingTraceId || generateTraceId()
  const spanId = generateSpanId()
  const traceFlags = '01' // sampled

  const traceparent = `00-${traceId}-${spanId}-${traceFlags}`

  return {
    traceparent,
    'X-Correlation-ID': traceId,
  }
}
