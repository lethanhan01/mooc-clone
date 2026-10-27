import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { auditService } from '@/services/audit.service'

export function useAuditLogsQuery() {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(),
    queryFn: () => auditService.getLogs(),
  })
}
