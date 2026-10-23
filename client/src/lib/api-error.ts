import axios from 'axios'
import i18n from './i18n'

interface ApiErrorPayload {
  code?: string
  message?: string | string[]
}

export function isNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  return (
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ECONNREFUSED' ||
    error.message?.includes('Network Error') ||
    !error.response ||
    (typeof error.response?.status === 'number' && [502, 503, 504].includes(error.response.status))
  )
}

export function getApiError(error: unknown, fallback?: string): string {
  const defaultFallback = fallback ?? i18n.t('error.unknown', { ns: 'common' })
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return error instanceof Error ? error.message : defaultFallback
  }

  if (isNetworkError(error) && !error.response?.data?.message && !error.response?.data?.code) {
    return i18n.t('error.network', { ns: 'common' }) || fallback || defaultFallback
  }

  const payload = error.response?.data
  if (payload?.code && i18n.exists(`error.api.${payload.code}`, { ns: 'common' })) {
    return i18n.t(`error.api.${payload.code}`, payload.code, { ns: 'common' })
  }

  const message = payload?.message
  if (Array.isArray(message) && message.length > 0) return message.join(', ')
  if (typeof message === 'string' && message.trim().length > 0) return message

  if (fallback) return fallback

  return defaultFallback
}

export function getApiErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) return undefined
  return error.response?.data?.code
}

export function isApiConflict(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409
}
