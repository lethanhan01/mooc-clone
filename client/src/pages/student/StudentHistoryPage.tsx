import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useRoomsListQuery } from '@/hooks/queries'
import { formatDuration, roomStatusLabel, roomStatusTone } from '@/lib/room-status'

export default function StudentHistoryPage() {
  const { data: rooms = [], isLoading } = useRoomsListQuery()

  function renderStatusMessage() {
    if (isLoading) {
      return (
        <Text size="sm" tone="muted" className="text-center py-6">
          Đang tải dữ liệu lịch sử thi từ máy chủ...
        </Text>
      )
    }
    if (rooms.length === 0) {
      return (
        <Text size="sm" tone="muted" className="text-center py-6">
          Chưa có bài thi nào được ghi nhận.
        </Text>
      )
    }
    return null
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Lịch sử làm bài & phòng thi trực tuyến
        </Heading>
        <Text size="sm" tone="muted">
          Theo dõi trạng thái và kết quả các bài thi đã tham gia trong hệ thống
        </Text>
      </header>

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Heading level={2} className="text-lg font-bold mb-3">
          Danh sách phòng thi & bài làm
        </Heading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã phòng</TableHead>
              <TableHead>Tên phòng thi</TableHead>
              <TableHead className="text-center">Số câu</TableHead>
              <TableHead>Thời lượng</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Xem lại</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-mono font-bold text-action-accent">{room.roomCode}</TableCell>
                <TableCell>
                  <p className="font-medium">{room.roomName}</p>
                  <p className="text-xs text-text-muted">Chủ phòng: {room.ownerDisplayName || 'Hệ thống'}</p>
                </TableCell>
                <TableCell className="text-center">{room.totalQuestions}</TableCell>
                <TableCell className="text-sm text-text-secondary">{formatDuration(room.durationSeconds)}</TableCell>
                <TableCell className="text-center">
                  <Badge tone={roomStatusTone(room.status)} size="sm">
                    {roomStatusLabel(room.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ButtonLink to={`/student/rooms/${room.roomCode}/summary`} variant="ghost" size="sm">
                    Chi tiết
                  </ButtonLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {renderStatusMessage()}
      </Card>
    </div>
  )
}
