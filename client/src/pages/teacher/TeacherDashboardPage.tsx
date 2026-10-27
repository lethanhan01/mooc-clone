import { DoorOpen, FileQuestion, Users, Plus, RefreshCw } from 'lucide-react'
import { Card, StatCard, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useRoomsListQuery } from '@/hooks/queries'
import { roomStatusLabel, roomStatusTone } from '@/lib/room-status'

export default function TeacherDashboardPage() {
  const { data: rooms = [], isLoading, refetch } = useRoomsListQuery()

  const openCount = rooms.filter(
    (r) =>
      r.status?.toUpperCase() === 'WAITING' ||
      r.status?.toUpperCase() === 'RUNNING' ||
      r.status === 'waiting' ||
      r.status === 'in_progress'
  ).length
  const questionTotal = rooms.reduce((sum, r) => sum + (r.totalQuestions || 0), 0)
  const participantsTotal = rooms.reduce((sum, r) => sum + (r.participantsCount || 0), 0)
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
            Theo dõi phòng thi, đề đã soạn và lượt dự thi trong cơ sở dữ liệu
          </Text>
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header actions] */}
        <div className="flex flex-wrap gap-1.5">
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
          <ButtonLink to="/teacher/rooms/create" variant="primary" size="sm" leftIcon={<Plus size={14} />}>
            Tạo phòng thi mới
          </ButtonLink>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Thống kê nhanh">
        <StatCard label="Phòng đang mở" value={String(openCount)} icon={<DoorOpen size={16} />} hint="Chờ thi + Đang thi" />
        <StatCard label="Câu hỏi đã gắn đề" value={String(questionTotal)} icon={<FileQuestion size={16} />} hint="Tổng qua các phòng" />
        <StatCard label="Thí sinh tham gia" value={String(participantsTotal)} icon={<Users size={16} />} hint="Đang kết nối trong phòng" />
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
            {recent.map((room) => {
              const statusUpper = room.status?.toUpperCase()
              return (
                <TableRow key={room.id}>
                  <TableCell className="font-mono text-xs font-semibold text-action-accent">{room.roomCode}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-text-primary">{room.roomName}</p>
                    <p className="text-[11px] text-text-muted">{room.ownerDisplayName || 'Giáo viên'}</p>
                  </TableCell>
                  <TableCell className="text-center text-sm">{room.totalQuestions}</TableCell>
                  <TableCell className="text-center">
                    <Badge tone={roomStatusTone(room.status)} size="sm">
                      {roomStatusLabel(room.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {statusUpper === 'RUNNING' || room.status === 'in_progress' ? (
                      <ButtonLink to={`/teacher/rooms/${room.roomCode}/monitor`} variant="primary" size="sm">
                        Giám sát
                      </ButtonLink>
                    ) : statusUpper === 'ENDED' || room.status === 'finished' ? (
                      <ButtonLink to={`/teacher/rooms/${room.roomCode}/results`} variant="outline" size="sm">
                        Xem điểm
                      </ButtonLink>
                    ) : (
                      <ButtonLink to={`/teacher/rooms/${room.roomCode}/questions`} variant="outline" size="sm">
                        Soạn đề
                      </ButtonLink>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

    </div>
  )
}
