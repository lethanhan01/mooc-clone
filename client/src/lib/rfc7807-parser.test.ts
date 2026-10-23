import { describe, it, expect } from 'vitest'
import {
  parseProblemDetails,
  getFriendlyErrorMessage,
  ProblemDetailsError,
} from './rfc7807-parser'

describe('RFC 7807 Problem Details Parser (rfc7807-parser.ts)', () => {
  it('parses valid RFC 7807 structure from Axios-like response', () => {
    const axiosError = {
      response: {
        status: 400,
        data: {
          type: 'https://api.rogym.com/errors/invalid-booking',
          title: 'Khung giờ không hợp lệ',
          status: 400,
          detail: 'Huấn luyện viên đã có lịch tập vào khung giờ này.',
          code: 'BOOKING_SLOT_CONFLICT',
          errors: {
            slotTime: ['Khung giờ 09:00 - 10:00 đã kín'],
          },
        },
      },
    }

    const parsed = parseProblemDetails(axiosError)
    expect(parsed).not.toBeNull()
    expect(parsed?.status).toBe(400)
    expect(parsed?.title).toBe('Khung giờ không hợp lệ')
    expect(parsed?.detail).toBe('Huấn luyện viên đã có lịch tập vào khung giờ này.')
    expect(parsed?.code).toBe('BOOKING_SLOT_CONFLICT')
    expect(parsed?.errors?.slotTime).toEqual(['Khung giờ 09:00 - 10:00 đã kín'])
  })

  it('constructs ProblemDetailsError with getters correctly', () => {
    const err = new ProblemDetailsError({
      title: 'Hết hạn gói tập',
      detail: 'Gói tập VIP của bạn đã hết hạn vào ngày hôm qua.',
      status: 403,
      code: 'SUBSCRIPTION_EXPIRED',
    })

    expect(err.message).toBe('Gói tập VIP của bạn đã hết hạn vào ngày hôm qua.')
    expect(err.status).toBe(403)
    expect(err.code).toBe('SUBSCRIPTION_EXPIRED')
  })

  it('returns friendly message extracting from validation errors first', () => {
    const errorWithFields = {
      response: {
        data: {
          title: 'Lỗi xác thực dữ liệu',
          detail: 'Vui lòng kiểm tra lại các trường thông tin.',
          errors: {
            phone: ['Số điện thoại phải đủ 10 số'],
          },
        },
      },
    }

    const msg = getFriendlyErrorMessage(errorWithFields)
    expect(msg).toBe('Số điện thoại phải đủ 10 số')
  })

  it('falls back to detail, then standard Error message, then fallback string', () => {
    const errorWithDetail = {
      response: {
        data: {
          detail: 'Không tìm thấy hội viên tương ứng.',
        },
      },
    }
    expect(getFriendlyErrorMessage(errorWithDetail)).toBe('Không tìm thấy hội viên tương ứng.')

    const genericError = new Error('Lỗi kết nối máy chủ')
    expect(getFriendlyErrorMessage(genericError)).toBe('Lỗi kết nối máy chủ')

    expect(getFriendlyErrorMessage(null, 'Lỗi mặc định')).toBe('Lỗi mặc định')
  })
})
