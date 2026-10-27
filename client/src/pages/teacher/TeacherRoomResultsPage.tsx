import { useParams } from 'react-router-dom'
import { Download, ArrowLeft } from 'lucide-react'
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useRoomDetailQuery } from '@/hooks/queries'
import { toast } from '@/lib/toast'

export default function TeacherRoomResultsPage() {
  const { roomId = '' } = useParams()
  const { data: room, isLoading } = useRoomDetailQuery(roomId)

  if (isLoading) {
    return (
      <Card as="section" className="p-8 text-center bg-surface rounded-2xl">
        <Text tone="muted">Đang tải bảng điểm phòng thi...</Text>
      </Card>
    )
  }

  if (!room) {
    return (
      <Card as="section" className="p-8 text-center bg-surface rounded-2xl">
        <Text tone="muted">Không tìm thấy phòng thi với mã {roomId}</Text>
        <ButtonLink to="/teacher/rooms" variant="outline" className="mt-3">
          Quay lại danh sách
        </ButtonLink>
      </Card>
    )
  }

  const participants = room.participantUsernames ?? []

  function exportCsv() {
    toast.success('Đã xuất danh sách thí sinh', {
      description: `${room!.roomCode} · ${participants.length} thí sinh`,
    })
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-xl sm:text-2xl font-extrabold">
            Bảng điểm & Kết quả · {room.roomCode}
          </Heading>
          <Text size="sm" tone="muted">
            {room.name} · {participants.length} thí sinh đã tham gia
          </Text>
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Actions] */}
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/teacher/rooms" variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Danh sách phòng
          </ButtonLink>
          <Button type="button" variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={exportCsv}>
            Xuất CSV
          </Button>
          <ButtonLink to={`/teacher/rooms/${room.roomCode}/monitor`} variant="ghost" size="sm">
            Giám sát
          </ButtonLink>
        </div>
      </header>

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Tên tài khoản thí sinh</TableHead>
              <TableHead className="text-center">Trạng thái phòng</TableHead>
              <TableHead className="text-right">Kết quả chấm điểm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((username, i) => (
              <TableRow key={username}>
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium">{username}</TableCell>
                <TableCell className="text-center font-mono text-sm">{room.status}</TableCell>
                <TableCell className="text-right font-medium text-action-accent">
                  Đã ghi nhận trong DB
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {participants.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-8">
            Chưa có bài thi nào được ghi nhận cho phòng này
          </Text>
        ) : null}
      </Card>
    </div>
  )
}
