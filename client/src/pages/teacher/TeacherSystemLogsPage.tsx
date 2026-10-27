import { useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Input } from '@/components/ui/forms'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuditLogsQuery } from '@/hooks/queries'

function fmt(iso: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function TeacherSystemLogsPage() {
  const { data: auditLogs = [], isLoading, refetch } = useAuditLogsQuery()
  const [query, setQuery] = useState('')

  const filtered = auditLogs.filter((log) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      (log.actorDisplayName && log.actorDisplayName.toLowerCase().includes(q)) ||
      log.action.toLowerCase().includes(q) ||
      (log.entityType && log.entityType.toLowerCase().includes(q)) ||
      (log.metadata && log.metadata.toLowerCase().includes(q))
    )
  })

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="space-y-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header bar] */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Heading level={1} className="text-2xl font-extrabold">
              Nhật ký kiểm toán hệ thống (Audit Logs)
            </Heading>
            <Text size="sm" tone="muted">
              Ghi nhận các hoạt động đăng nhập, tạo phòng, nộp bài từ CSDL máy chủ
            </Text>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            leftIcon={<RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />}
            onClick={() => refetch()}
          >
            Làm mới
          </Button>
        </div>

        <Input
          id="log-search"
          aria-label="Tìm nhật ký"
          placeholder="Tìm theo người dùng, hành động, entity..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search size={16} />}
          className="sm:max-w-md"
        />
      </header>

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Chi tiết metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-text-muted whitespace-nowrap">{fmt(log.occurredAt)}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{log.actorDisplayName || `User #${log.actorUserId || 'N/A'}`}</p>
                </TableCell>
                <TableCell>
                  <Badge tone="accent" size="sm">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                </TableCell>
                <TableCell className="font-mono text-xs text-text-muted">{log.ipAddress || '127.0.0.1'}</TableCell>
                <TableCell className="text-sm text-text-secondary max-w-xs truncate">{log.metadata || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-8">
            Không có nhật ký nào phù hợp bộ lọc
          </Text>
        ) : null}
      </Card>
    </div>
  )
}
