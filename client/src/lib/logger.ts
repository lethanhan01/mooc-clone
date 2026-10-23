/**
 * Structured Logger (OBS-001, OBS-008)
 * Enterprise-grade structured logging utility with automatic PII/credential sanitization,
 * context enrichment, and environment-aware log level filtering.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  userId?: string
  route?: string
  action?: string
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  data?: unknown
  error?: {
    name?: string
    message?: string
    stack?: string
  }
}

const BLOCKED_SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'accesstoken',
  'refreshtoken',
  'auth',
  'authorization',
  'credential',
])

function sanitizeLogData(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data
  if (Array.isArray(data)) {
    return data.map(sanitizeLogData)
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z]/g, '')
    if (BLOCKED_SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeLogData(val)
    } else {
      sanitized[key] = val
    }
  }
  return sanitized
}

export class StructuredLogger {
  constructor(private context: LogContext = {}) {}

  public withContext(extra: LogContext): StructuredLogger {
    return new StructuredLogger({
      ...this.context,
      ...extra,
    })
  }

  private isProduction(): boolean {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.MODE === 'production'
    }
    return process.env.NODE_ENV === 'production'
  }

  private formatEntry(level: LogLevel, message: string, data?: unknown, err?: unknown): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    }

    if (Object.keys(this.context).length > 0) {
      entry.context = sanitizeLogData(this.context) as LogContext
    }

    if (data !== undefined) {
      entry.data = sanitizeLogData(data)
    }

    if (err instanceof Error) {
      entry.error = {
        name: err.name,
        message: err.message,
        stack: err.stack,
      }
    } else if (err !== undefined) {
      entry.error = {
        message: String(err),
      }
    }

    return entry
  }

  public debug(message: string, data?: unknown): void {
    if (this.isProduction()) return
    const entry = this.formatEntry('debug', message, data)
    // Structured console output for development tools
    console.debug(`[DEBUG] ${entry.message}`, entry)
  }

  public info(message: string, data?: unknown): void {
    const entry = this.formatEntry('info', message, data)
    console.info(`[INFO] ${entry.message}`, entry)
  }

  public warn(message: string, data?: unknown): void {
    const entry = this.formatEntry('warn', message, data)
    console.warn(`[WARN] ${entry.message}`, entry)
  }

  public error(message: string, error?: unknown, data?: unknown): void {
    const entry = this.formatEntry('error', message, data, error)
    console.error(`[ERROR] ${entry.message}`, entry)
  }
}

export const logger = new StructuredLogger()
