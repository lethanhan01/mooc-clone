import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Users, Activity, Clock, Ban, RefreshCw } from 'lucide-react'
import { Card, Badge, StatCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useRoomDetailQuery, useFinishRoomMutation } from '@/hooks/queries'
import { formatDuration, roomStatusLabel, roomStatusTone } from '@/lib/room-status'
import { toast } from '@/lib/toast'

export default function TeacherRoomMonitorPage() {
  const { roomId = '' } = useParams()
  const { data: room, isLoading, refetch } = useRoomDetailQuery(roomId)
  const finishRoomMutation = useFinishRoomMutation()
  const [confirmClose, setConfirmClose] = useState(false)

  if (isLoading) {
    return (
      <Card as="section" className="p-8 text-center bg-surface rounded-2xl">
        <Text tone="muted">Đang tải dữ liệu giám sát phòng thi...</Text>
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
  const isEnded = room.status?.toUpperCase() === 'ENDED' || room.status === 'finished'
  const serverNowMs = room.serverNow ? Date.parse(room.serverNow) : Date.now()
  const remain = isEnded
    ? 0
    : room.endsAt != null
      ? Math.max(0, Math.floor((new Date(room.endsAt).getTime() - serverNowMs) / 1000))
      : room.durationSeconds

  async function handleCloseRoom() {
    if (!room) return
    try {
      await finishRoomMutation.mutateAsync(room.roomCode)
      toast.success('Đã kết thúc phòng thi thành công')
      setConfirmClose(false)
    } catch {
      toast.error('Không thể kết thúc phòng thi')
    }
  }


  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-xl sm:text-2xl font-extrabold">
            Giám sát phòng thi · {room.roomCode}
          </Heading>
          <Text size="sm" tone="muted">
            {room.name} · Chủ phòng: {room.ownerDisplayName || 'Hệ thống'}
          </Text>
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header actions] */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />}
            onClick={() => refetch()}
          >
            Cập nhật
          </Button>
          <Badge tone={roomStatusTone(room.status)} size="sm">
            {roomStatusLabel(room.status)}
          </Badge>
          <ButtonLink to={`/teacher/rooms/${room.roomCode}/results`} variant="outline" size="sm">
            Xem kết quả
          </ButtonLink>
          <Button
            type="button"
            variant="danger"
            size="sm"
            leftIcon={<Ban size={14} />}
            disabled={isEnded}
            onClick={() => setConfirmClose(true)}
          >
            Đóng phòng
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="KPI giám sát">
        <StatCard label="Thí sinh tham gia" value={String(participants.length)} icon={<Users size={20} />} />
        <StatCard label="Tổng câu hỏi đề thi" value={String(room.easyCount + room.mediumCount + room.hardCount)} icon={<Activity size={20} />} />
        <StatCard label="Thời gian còn lại" value={formatDuration(remain)} icon={<Clock size={20} />} />
      </section>

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Heading level={2} className="text-lg font-bold mb-3">
          Danh sách thí sinh trong phòng ({participants.length})
        </Heading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên tài khoản thí sinh</TableHead>
              <TableHead className="text-center">Trạng thái kết nối</TableHead>
              <TableHead className="text-right">Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((username, idx) => (
              <TableRow key={username}>
                <TableCell className="font-mono text-sm">{idx + 1}</TableCell>
                <TableCell className="font-medium">{username}</TableCell>
                <TableCell className="text-center">
                  <Badge tone="accent" size="sm">
                    Đã vào phòng
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-text-muted">
                  Đồng bộ HTTP Polling
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {participants.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-6">
            Chưa có thí sinh tham gia phòng thi này.
          </Text>
        ) : null}
      </Card>

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Đóng phòng thi?"
        description="Khi đóng phòng, tất cả thí sinh sẽ bị thu bài và chuyển sang chế độ chấm điểm tức thì."
        confirmLabel="Đóng phòng"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleCloseRoom}
      />
    </div>
  )
}
