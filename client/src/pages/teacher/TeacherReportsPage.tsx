import { Card, StatCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockExamStore } from '@/stores/mockExamStore'
import { roomStatusLabel, roomStatusTone } from '@/lib/room-status'
import { DoorOpen, FileQuestion, Users, BarChart3 } from 'lucide-react'

export default function TeacherReportsPage() {
  const rooms = useMockExamStore((s) => s.rooms)
  const submissions = useMockExamStore((s) => s.submissions)
  const questionsByRoom = useMockExamStore((s) => s.questionsByRoom)
  const practiceHistory = useMockExamStore((s) => s.practiceHistory)

  const questionTotal = Object.values(questionsByRoom).reduce((n, list) => n + list.length, 0)
  const avgScore =
    submissions.length > 0
      ? Math.round((submissions.reduce((s, x) => s + x.score, 0) / submissions.length) * 100) / 100
      : 0
  const finished = rooms.filter((r) => r.status === 'finished').length
  const inProgress = rooms.filter((r) => r.status === 'in_progress').length

  const byRoom = rooms.map((room) => {
    const subs = submissions.filter((s) => s.roomId === room.id)
    const avg =
      subs.length > 0 ? Math.round((subs.reduce((a, b) => a + b.score, 0) / subs.length) * 100) / 100 : null
    return { room, subs: subs.length, avg }
  })

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-2xl font-extrabold">
            Báo cáo tổng hợp
          </Heading>
          <Text size="sm" tone="muted">
            Thống kê mock trên toàn bộ phòng thi và luyện tập
          </Text>
        </div>
        <ButtonLink to="/teacher/dashboard" variant="outline" size="sm">
          Về tổng quan
        </ButtonLink>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="KPI tổng hợp">
        <StatCard label="Tổng phòng" value={String(rooms.length)} icon={<DoorOpen size={20} />} hint={`${inProgress} đang thi · ${finished} đã đóng`} />
        <StatCard label="Câu hỏi" value={String(questionTotal)} icon={<FileQuestion size={20} />} />
        <StatCard label="Lượt nộp" value={String(submissions.length)} icon={<Users size={20} />} hint={`TB điểm ${avgScore}`} />
        <StatCard label="Luyện tập" value={String(practiceHistory.length)} icon={<BarChart3 size={20} />} />
      </section>

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Heading level={2} className="text-lg font-bold mb-3">
          Theo từng phòng
        </Heading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên phòng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Số câu</TableHead>
              <TableHead className="text-center">Bài nộp</TableHead>
              <TableHead className="text-right">Điểm TB</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byRoom.map(({ room, subs, avg }) => (
              <TableRow key={room.id}>
                <TableCell className="font-mono font-bold text-action-accent">{room.code}</TableCell>
                <TableCell>
                  <p className="font-medium">{room.name}</p>
                  <p className="text-xs text-text-muted">{room.topic}</p>
                </TableCell>
                <TableCell>
                  <Badge tone={roomStatusTone(room.status)} size="sm">
                    {roomStatusLabel(room.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{room.questionCount}</TableCell>
                <TableCell className="text-center">{subs}</TableCell>
                <TableCell className="text-right font-semibold">{avg ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
