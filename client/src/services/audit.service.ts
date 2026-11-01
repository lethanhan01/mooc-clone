import { gatewayClient, GATEWAY_OPCODES } from './gatewayClient'
import type { AuditLogResponse } from '@/types'

export const auditService = {
  async getLogs(): Promise<AuditLogResponse[]> {
    return gatewayClient.request<AuditLogResponse[]>(GATEWAY_OPCODES.ROOM_LIST_REQ, { type: 'audit-logs' })
  },
}
