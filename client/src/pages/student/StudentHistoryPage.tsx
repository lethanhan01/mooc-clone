import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockExamStore } from '@/stores/mockExamStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDuration } from '@/lib/room-status'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function fmt(iso: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function StudentHistoryPage() {
  const user = useAuthStore((s) => s.user)
  const rooms = useMockExamStore((s) => s.rooms)
  const submissions = useMockExamStore((s) =>
    s.submissions.filter((x) => !user || x.userId === user.userId)
  )
  const practiceHistory = useMockExamStore((s) => s.practiceHistory)

  const chartData = [...submissions]
    .slice(0, 12)
    .reverse()
    .map((s, i) => ({
      name: `#${i + 1}`,
      score: s.score,
      label: rooms.find((r) => r.id === s.roomId)?.code ?? s.roomId.slice(0, 6),
    }))

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Lịch sử làm bài
        </Heading>
        <Text size="sm" tone="muted">
          Bài thi chính thức và các lần luyện tập
        </Text>
      </header>

      {chartData.length > 1 ? (
        <Card as="section" className="p-5 bg-surface border-line-subtle shadow-card rounded-2xl">
          <Heading level={2} className="text-lg font-bold mb-4">
            Xu hướng điểm thi
          </Heading>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Recharts container] */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-line-subtle" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="var(--color-action-accent, #06c384)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Heading level={2} className="text-lg font-bold mb-3">
          Bài thi phòng
        </Heading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phòng</TableHead>
              <TableHead>Điểm</TableHead>
              <TableHead>Đúng</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Nộp lúc</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((s) => {
              const room = rooms.find((r) => r.id === s.roomId)
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium">{room?.code ?? s.roomId}</p>
                    <p className="text-xs text-text-muted truncate max-w-48">{room?.name}</p>
                  </TableCell>
                  <TableCell className="font-bold text-action-accent">{s.score}</TableCell>
                  <TableCell>
                    {s.correctCount}/{s.totalQuestions}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{formatDuration(s.durationSeconds)}</TableCell>
                  <TableCell className="text-sm text-text-muted">{fmt(s.submittedAt)}</TableCell>
                  <TableCell className="text-right">
                    <ButtonLink to={`/student/rooms/${s.roomId}/review`} variant="ghost" size="sm">
                      Xem lại
                    </ButtonLink>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {submissions.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-6">
            Chưa có bài nộp
          </Text>
        ) : null}
      </Card>

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Heading level={2} className="text-lg font-bold mb-3">
          Luyện tập
        </Heading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chủ đề</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Điểm</TableHead>
              <TableHead>Đúng</TableHead>
              <TableHead>Thời điểm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {practiceHistory.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.topic}</TableCell>
                <TableCell>
                  <Badge tone="neutral" size="sm">
                    {p.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-action-accent">{p.score}</TableCell>
                <TableCell>
                  {p.correctCount}/{p.totalQuestions}
                </TableCell>
                <TableCell className="text-sm text-text-muted">{fmt(p.submittedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {practiceHistory.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-6">
            Chưa có lần luyện tập
          </Text>
        ) : null}
      </Card>
    </div>
  )
}
