/**
 * RFC 7807 / RFC 9457 Problem Details Parser (STD-ERR-001, API-002)
 * Standardizes API error payload parsing across the application.
 */

export interface ProblemDetailsPayload {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  code?: string
  errors?: Record<string, string[]>
  [key: string]: unknown
}

export class ProblemDetailsError extends Error {
  constructor(public readonly payload: ProblemDetailsPayload) {
    super(payload.detail || payload.title || 'Đã xảy ra lỗi không xác định')
    this.name = 'ProblemDetailsError'
  }

  get code(): string | undefined {
    return this.payload.code
  }

  get status(): number | undefined {
    return this.payload.status
  }

  get validationErrors(): Record<string, string[]> | undefined {
    return this.payload.errors
  }
}

/**
 * Parses an unknown error (such as an Axios error or fetch error) into a ProblemDetailsPayload if applicable.
 */
export function parseProblemDetails(error: unknown): ProblemDetailsPayload | null {
  if (!error || typeof error !== 'object') return null

  // If already an instance of ProblemDetailsError
  if (error instanceof ProblemDetailsError) {
    return error.payload
  }

  // Axios-like error structure: error.response.data
  const errObj = error as Record<string, unknown>
  const response = errObj.response as Record<string, unknown> | undefined
  const data = (response?.data || errObj.data || errObj) as Record<string, unknown>

  if (!data || typeof data !== 'object') return null

  // Check if it conforms to RFC 7807 (at least has status, title, detail, or code)
  if (
    'title' in data ||
    'detail' in data ||
    'status' in data ||
    'code' in data ||
    'errors' in data
  ) {
    return {
      type: typeof data.type === 'string' ? data.type : undefined,
      title: typeof data.title === 'string' ? data.title : undefined,
      status: typeof data.status === 'number' ? data.status : (response?.status as number | undefined),
      detail: typeof data.detail === 'string' ? data.detail : undefined,
      instance: typeof data.instance === 'string' ? data.instance : undefined,
      code: typeof data.code === 'string' ? data.code : undefined,
      errors: typeof data.errors === 'object' && data.errors !== null ? (data.errors as Record<string, string[]>) : undefined,
      ...data,
    }
  }

  return null
}

/**
 * Extracts a user-friendly error message from an unknown error or Problem Details object.
 */
export function getFriendlyErrorMessage(
  error: unknown,
  fallback = 'Đã có lỗi xảy ra, vui lòng thử lại sau.'
): string {
  if (typeof error === 'string') return error

  const problem = parseProblemDetails(error)
  if (problem) {
    // 1. If there are field errors, pick the first error message
    if (problem.errors && typeof problem.errors === 'object') {
      const firstField = Object.keys(problem.errors)[0]
      if (firstField && Array.isArray(problem.errors[firstField]) && problem.errors[firstField].length > 0) {
        return problem.errors[firstField][0]
      }
    }

    // 2. Otherwise return detail
    if (problem.detail) return problem.detail

    // 3. Otherwise return title
    if (problem.title) return problem.title
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
