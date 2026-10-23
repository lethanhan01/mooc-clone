import { describe, it, expect } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { getApiError, isNetworkError, isApiConflict, getApiErrorCode } from './api-error'

function createAxiosError(status?: number, data?: unknown, code?: string): AxiosError {
  const headers = new AxiosHeaders()
  const error = new AxiosError('Request failed', code, undefined, undefined, status ? {
    status,
    statusText: 'Error',
    headers: {},
    config: { headers },
    data,
  } : undefined)
  return error
}

describe('api-error utility', () => {
  it('returns fallback or network translation when server connection fails (ERR_NETWORK / no response)', () => {
    const networkErr = createAxiosError(undefined, undefined, 'ERR_NETWORK')
    expect(isNetworkError(networkErr)).toBe(true)
    const message = getApiError(networkErr)
    expect(message).toBe('Không thể kết nối. Kiểm tra mạng và thử lại.')
  })

  it('identifies 502/503/504 proxy/gateway errors as network errors', () => {
    const gatewayErr = createAxiosError(502)
    expect(isNetworkError(gatewayErr)).toBe(true)
    expect(getApiError(gatewayErr)).toBe('Không thể kết nối. Kiểm tra mạng và thử lại.')
  })

  it('returns payload message for normal business errors (400 / 422)', () => {
    const bizErr = createAxiosError(400, { message: 'Dữ liệu không hợp lệ' })
    expect(isNetworkError(bizErr)).toBe(false)
    expect(getApiError(bizErr)).toBe('Dữ liệu không hợp lệ')
  })

  it('returns array payload messages joined by comma', () => {
    const bizErr = createAxiosError(400, { message: ['Tên không được để trống', 'Email sai định dạng'] })
    expect(getApiError(bizErr)).toBe('Tên không được để trống, Email sai định dạng')
  })

  it('identifies 409 conflict correctly', () => {
    const conflictErr = createAxiosError(409, { code: 'EMAIL_IN_USE' })
    expect(isApiConflict(conflictErr)).toBe(true)
    expect(getApiErrorCode(conflictErr)).toBe('EMAIL_IN_USE')
  })

  it('prefers payload message over generic fallback when available', () => {
    const bizErr = createAxiosError(400, { message: 'Email đã tồn tại trong hệ thống' })
    expect(getApiError(bizErr, 'Lỗi tạo tài khoản')).toBe('Email đã tồn tại trong hệ thống')
  })
})
