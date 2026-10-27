/**
 * audit.ts - Kiểu dữ liệu Nhật ký kiểm toán hệ thống đồng bộ với Server DTOs.
 */

export interface AuditLogResponse {
  id: number
  actorUserId?: number | null
  actorDisplayName?: string | null
  action: string
  entityType: string
  entityId?: number | null
  ipAddress?: string | null
  metadata?: string | null
  occurredAt: string
}
