import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Input } from '@/components/ui/forms'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockExamStore } from '@/stores/mockExamStore'
import type { MockSystemLog } from '@/services/mockData'

type LevelFilter = 'all' | MockSystemLog['level']

const LEVELS: Array<{ id: LevelFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'info', label: 'Info' },
  { id: 'success', label: 'Success' },
  { id: 'warning', label: 'Warning' },
  { id: 'danger', label: 'Danger' },
]

function levelTone(level: MockSystemLog['level']): 'neutral' | 'accent' | 'warning' | 'danger' {
  switch (level) {
    case 'success':
      return 'accent'
    case 'warning':
      return 'warning'
    case 'danger':
      return 'danger'
    default:
      return 'neutral'
  }
}

function fmt(iso: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function TeacherSystemLogsPage() {
  const rooms = useMockExamStore((s) => s.rooms)
  const systemLogs = useMockExamStore((s) => s.systemLogs)
  const [level, setLevel] = useState<LevelFilter>('all')
  const [query, setQuery] = useState('')

  const filtered = systemLogs.filter((log) => {
    if (level !== 'all' && log.level !== level) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      log.actor.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.detail.toLowerCase().includes(q) ||
      (log.studentId?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="space-y-3">
        <Heading level={1} className="text-2xl font-extrabold">
          Nhật ký hệ thống
        </Heading>
        <Text size="sm" tone="muted">
          Theo dõi tạo phòng, nộp bài, đóng phòng và sự kiện mock khác
        </Text>
        <Input
          id="log-search"
          aria-label="Tìm nhật ký"
          placeholder="Tìm theo actor, hành động, MSSV..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search size={16} />}
          className="sm:max-w-md"
        />
      </header>

      <nav aria-label="Lọc mức độ" className="flex flex-wrap gap-2">
        {LEVELS.map((f) => (
          <Button
            key={f.id}
            type="button"
            size="sm"
            variant={level === f.id ? 'primary' : 'outline'}
            onClick={() => setLevel(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </nav>

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Mức</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Chi tiết</TableHead>
              <TableHead>Phòng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-text-muted whitespace-nowrap">{fmt(log.at)}</TableCell>
                <TableCell>
                  <Badge tone={levelTone(log.level)} size="sm">
                    {log.level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{log.actor}</p>
                  {log.studentId ? <p className="text-xs text-text-muted">{log.studentId}</p> : null}
                </TableCell>
                <TableCell className="text-sm font-semibold">{log.action}</TableCell>
                <TableCell className="text-sm text-text-secondary max-w-xs">{log.detail}</TableCell>
                <TableCell className="font-mono text-xs text-action-accent">
                  {rooms.find((r) => r.id === log.roomId)?.code ?? log.roomId?.slice(0, 8) ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-8">
            Không có nhật ký khớp bộ lọc
          </Text>
        ) : null}
      </Card>
    </div>
  )
}
