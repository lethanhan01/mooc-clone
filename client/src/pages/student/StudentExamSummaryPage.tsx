import { useParams } from 'react-router-dom'
import { Trophy, CheckCircle2, XCircle } from 'lucide-react'
import { Card, Badge, StatCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { useMockExamStore } from '@/stores/mockExamStore'
import { formatDuration } from '@/lib/room-status'

export default function StudentExamSummaryPage() {
  const { roomId = '' } = useParams()
  const user = useAuthStore((s) => s.user)
  const room = useMockExamStore((s) => s.rooms.find((r) => r.id === roomId))
  const submissions = useMockExamStore((s) => s.submissions.filter((x) => x.roomId === roomId))
  const mine =
    submissions.find((s) => s.userId === user?.userId) ??
    submissions[0]

  const board = [...submissions].sort((a, b) => b.score - a.score || a.durationSeconds - b.durationSeconds)

  if (!room) {
    return (
      <Card as="section" className="p-8 text-center bg-surface border-line-subtle rounded-2xl">
        <Text tone="muted">Không tìm thấy phòng thi</Text>
        <ButtonLink to="/student/rooms" variant="outline" className="mt-4">
          Danh sách phòng
        </ButtonLink>
      </Card>
    )
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Kết quả bài thi
        </Heading>
        <Text size="sm" tone="muted">
          {room.name} · {room.code}
        </Text>
      </header>

      {mine ? (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Điểm của bạn">
          <StatCard label="Điểm số" value={String(mine.score)} icon={<Trophy size={20} />} hint="/ 10" />
          <StatCard
            label="Đúng"
            value={String(mine.correctCount)}
            icon={<CheckCircle2 size={20} />}
            hint={`/${mine.totalQuestions}`}
          />
          <StatCard
            label="Sai / bỏ"
            value={`${mine.wrongCount} / ${mine.unansweredCount}`}
            icon={<XCircle size={20} />}
            hint={formatDuration(mine.durationSeconds)}
          />
        </section>
      ) : (
        <Card as="section" className="p-5 bg-surface border-line-subtle rounded-2xl">
          <Text size="sm" tone="muted">
            Bạn chưa có bài nộp trong phòng này (hiển thị bảng điểm chung).
          </Text>
        </Card>
      )}

      <Card as="section" className="p-5 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Heading level={2} className="text-lg font-bold mb-4">
          Bảng xếp hạng
        </Heading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Học sinh</TableHead>
              <TableHead className="text-center">Điểm</TableHead>
              <TableHead className="text-center">Đúng</TableHead>
              <TableHead className="text-right">Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {board.map((row, i) => (
              <TableRow key={row.id} className={row.userId === user?.userId ? 'bg-action-accent-soft/40' : undefined}>
                <TableCell>
                  <Badge tone={i < 3 ? 'accent' : 'neutral'} size="sm">
                    {i + 1}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{row.fullName}</p>
                  <p className="text-xs text-text-muted">{row.studentId}</p>
                </TableCell>
                <TableCell className="text-center font-bold text-action-accent">{row.score}</TableCell>
                <TableCell className="text-center">
                  {row.correctCount}/{row.totalQuestions}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{formatDuration(row.durationSeconds)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {board.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-6">
            Chưa có bài nộp
          </Text>
        ) : null}
      </Card>

      <footer className="flex flex-wrap gap-2">
        <ButtonLink to={`/student/rooms/${roomId}/review`} variant="primary">
          Xem lại bài làm
        </ButtonLink>
        <ButtonLink to="/student/rooms" variant="outline">
          Danh sách phòng
        </ButtonLink>
      </footer>
    </div>
  )
}
