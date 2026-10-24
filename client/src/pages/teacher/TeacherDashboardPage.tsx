import { DoorOpen, FileQuestion, Users, Plus, RotateCcw } from 'lucide-react'
import { Card, StatCard, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockExamStore } from '@/stores/mockExamStore'
import { roomStatusLabel, roomStatusTone } from '@/lib/room-status'
import { toast } from '@/lib/toast'

export default function TeacherDashboardPage() {
  const rooms = useMockExamStore((s) => s.rooms)
  const submissions = useMockExamStore((s) => s.submissions)
  const resetMockData = useMockExamStore((s) => s.resetMockData)

  const openCount = rooms.filter((r) => r.status === 'waiting' || r.status === 'in_progress').length
  const questionTotal = rooms.reduce((sum, r) => sum + r.questionCount, 0)
  const todaySubs = submissions.length
  const recent = rooms.slice(0, 5)

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page vertical stack] */
    <div className="space-y-4">
      <header className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title stack] */}
        <div>
          <Heading level={1} className="text-lg font-bold text-text-primary">
            Tổng quan Giáo viên
          </Heading>
          <Text size="xs" tone="muted">
            Theo dõi phòng thi, đề đã soạn và lượt dự thi
          </Text>
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header actions] */}
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw size={13} />}
            onClick={() => {
              resetMockData()
              toast.info('Đã khôi phục dữ liệu mock ban đầu')
            }}
          >
            Reset mock
          </Button>
          <ButtonLink to="/teacher/rooms/create" variant="primary" size="sm" leftIcon={<Plus size={14} />}>
            Tạo phòng thi mới
          </ButtonLink>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Thống kê nhanh">
        <StatCard label="Phòng đang mở" value={String(openCount)} icon={<DoorOpen size={16} />} hint="Chờ thi + Đang thi" />
        <StatCard label="Câu hỏi đã gắn đề" value={String(questionTotal)} icon={<FileQuestion size={16} />} hint="Tổng qua các phòng" />
        <StatCard label="Lượt nộp bài (mock)" value={String(todaySubs)} icon={<Users size={16} />} hint="Trong bộ nhớ demo" />
      </section>

      <Card as="section" className="rounded-lg border-line-subtle bg-surface p-3 shadow-none sm:p-4">
        <header className="mb-3 flex items-center justify-between gap-2">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Section title stack] */}
          <div>
            <Heading level={2} className="text-sm font-bold">
              Phòng thi gần đây
            </Heading>
            <Text size="xs" tone="muted">
              Nhấn để quản lý chi tiết
            </Text>
          </div>
          <ButtonLink to="/teacher/rooms" variant="ghost" size="sm">
            Xem tất cả
          </ButtonLink>
        </header>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên phòng</TableHead>
              <TableHead className="text-center">Số câu</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-mono text-xs font-semibold text-action-accent">{room.code}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-text-primary">{room.name}</p>
                  <p className="text-[11px] text-text-muted">{room.topic}</p>
                </TableCell>
                <TableCell className="text-center text-sm">{room.questionCount}</TableCell>
                <TableCell className="text-center">
                  <Badge tone={roomStatusTone(room.status)} size="sm">
                    {roomStatusLabel(room.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {room.status === 'in_progress' ? (
                    <ButtonLink to={`/teacher/rooms/${room.id}/monitor`} variant="primary" size="sm">
                      Giám sát
                    </ButtonLink>
                  ) : room.status === 'finished' ? (
                    <ButtonLink to={`/teacher/rooms/${room.id}/results`} variant="outline" size="sm">
                      Xem điểm
                    </ButtonLink>
                  ) : (
                    <ButtonLink to={`/teacher/rooms/${room.id}/questions`} variant="outline" size="sm">
                      Soạn đề
                    </ButtonLink>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
