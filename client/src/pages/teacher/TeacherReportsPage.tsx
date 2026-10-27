import { Card, StatCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useRoomsListQuery, useQuestionsListQuery } from '@/hooks/queries'
import { roomStatusLabel, roomStatusTone, formatDuration } from '@/lib/room-status'
import { DoorOpen, FileQuestion, Users, BarChart3 } from 'lucide-react'

export default function TeacherReportsPage() {
  const { data: rooms = [] } = useRoomsListQuery()
  const { data: questions = [] } = useQuestionsListQuery()

  const questionTotal = questions.length
  const finished = rooms.filter((r) => r.status?.toUpperCase() === 'ENDED' || r.status === 'finished').length
  const inProgress = rooms.filter((r) => r.status?.toUpperCase() === 'RUNNING' || r.status === 'in_progress').length
  const totalParticipants = rooms.reduce((sum, r) => sum + (r.participantsCount || 0), 0)

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-2xl font-extrabold">
            Báo cáo tổng hợp hệ thống
          </Heading>
          <Text size="sm" tone="muted">
            Dữ liệu thống kê thời gian thực từ PostgreSQL Database
          </Text>
        </div>
        <ButtonLink to="/teacher/dashboard" variant="outline" size="sm">
          Về tổng quan
        </ButtonLink>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="KPI tổng hợp">
        <StatCard
          label="Tổng phòng thi"
          value={String(rooms.length)}
          icon={<DoorOpen size={20} />}
          hint={`${inProgress} đang thi · ${finished} đã đóng`}
        />
        <StatCard label="Ngân hàng câu hỏi" value={String(questionTotal)} icon={<FileQuestion size={20} />} />
        <StatCard label="Thí sinh tham gia" value={String(totalParticipants)} icon={<Users size={20} />} hint="Đang kết nối qua các phòng" />
        <StatCard label="Phòng hoạt động" value={String(inProgress)} icon={<BarChart3 size={20} />} />
      </section>

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Heading level={2} className="text-lg font-bold mb-3">
          Thống kê chi tiết theo từng phòng thi
        </Heading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã phòng</TableHead>
              <TableHead>Tên phòng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Số câu</TableHead>
              <TableHead className="text-center">Thí sinh</TableHead>
              <TableHead className="text-right">Thời lượng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-mono font-bold text-action-accent">{room.roomCode}</TableCell>
                <TableCell>
                  <p className="font-medium">{room.roomName}</p>
                  <p className="text-xs text-text-muted">Chủ phòng: {room.ownerDisplayName || 'Giáo viên'}</p>
                </TableCell>
                <TableCell>
                  <Badge tone={roomStatusTone(room.status)} size="sm">
                    {roomStatusLabel(room.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{room.totalQuestions}</TableCell>
                <TableCell className="text-center">{room.participantsCount}</TableCell>
                <TableCell className="text-right font-semibold">{formatDuration(room.durationSeconds)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
