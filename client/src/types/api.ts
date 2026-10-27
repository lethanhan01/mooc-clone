/**
 * api.ts - Chuẩn hóa khung dữ liệu phản hồi (Response Envelope) từ Spring Boot Backend RESTful API.
 */

export interface FieldErrorDto {
  field: string
  message: string
}

export interface ApiResponse<T> {
  code: number
  status: string
  message: string
  data: T
  errors?: FieldErrorDto[] | null
  timestamp?: string
}

export interface ApiErrorResponse {
  code: number
  status: string
  message: string
  errors?: FieldErrorDto[] | null
  timestamp?: string
}
