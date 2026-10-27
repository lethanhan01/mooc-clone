import api from './api'
import type { ApiResponse, AuditLogResponse } from '@/types'

export const auditService = {
  async getLogs(): Promise<AuditLogResponse[]> {
    const response = await api.get<ApiResponse<AuditLogResponse[]>>('/audit-logs')
    return response.data.data
  },
}
