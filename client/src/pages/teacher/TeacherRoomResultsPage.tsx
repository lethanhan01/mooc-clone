import { useParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockExamStore } from '@/stores/mockExamStore'
import { formatDuration } from '@/lib/room-status'
import { toast } from '@/lib/toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function TeacherRoomResultsPage() {
  const { roomId = '' } = useParams()
  const room = useMockExamStore((s) => s.rooms.find((r) => r.id === roomId))
  const submissions = useMockExamStore((s) =>
    [...s.submissions.filter((x) => x.roomId === roomId)].sort((a, b) => b.score - a.score)
  )

  if (!room) {
    return (
      <Card as="section" className="p-8 text-center bg-surface rounded-2xl">
        <Text tone="muted">Không tìm thấy phòng</Text>
        <ButtonLink to="/teacher/rooms" variant="outline" className="mt-3">
          Quay lại
        </ButtonLink>
      </Card>
    )
  }

  const chartData = submissions.map((s, i) => ({
    name: s.studentId || `#${i + 1}`,
    score: s.score,
  }))

  function exportCsv() {
    toast.success('Đã tạo file CSV (mock)', {
      description: `${room!.code} · ${submissions.length} dòng`,
    })
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-xl sm:text-2xl font-extrabold">
            Bảng điểm · {room.code}
          </Heading>
          <Text size="sm" tone="muted">
            {room.name} · {submissions.length} bài nộp
          </Text>
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Actions] */}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={exportCsv}>
            Xuất CSV
          </Button>
          <ButtonLink to={`/teacher/rooms/${roomId}/monitor`} variant="ghost" size="sm">
            Giám sát
          </ButtonLink>
        </div>
      </header>

      {chartData.length > 0 ? (
        <Card as="section" className="p-5 bg-surface border-line-subtle shadow-card rounded-2xl">
          <Heading level={2} className="text-lg font-bold mb-4">
            Phân bố điểm
          </Heading>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Recharts bar container] */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="var(--color-action-accent, #06c384)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>MSSV</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead className="text-center">Điểm</TableHead>
              <TableHead className="text-center">Đúng / Sai / Bỏ</TableHead>
              <TableHead className="text-right">Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((s, i) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Badge tone={i < 3 ? 'accent' : 'neutral'} size="sm">
                    {i + 1}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">{s.studentId}</TableCell>
                <TableCell className="font-medium">{s.fullName}</TableCell>
                <TableCell className="text-center font-bold text-action-accent">{s.score}</TableCell>
                <TableCell className="text-center text-sm">
                  {s.correctCount} / {s.wrongCount} / {s.unansweredCount}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{formatDuration(s.durationSeconds)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {submissions.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-8">
            Chưa có bài nộp
          </Text>
        ) : null}
      </Card>
    </div>
  )
}
