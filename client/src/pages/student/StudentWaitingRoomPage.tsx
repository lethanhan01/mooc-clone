import { useNavigate, useParams } from 'react-router-dom'

import { Clock, ListChecks, Shield } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useRoomDetailQuery, useStartAttemptMutation } from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'
import { formatDuration, roomStatusLabel, roomStatusTone } from '@/lib/room-status'
import { toast } from '@/lib/toast'

export default function StudentWaitingRoomPage() {
  const { roomId = '' } = useParams()
  const { data: room, isLoading } = useRoomDetailQuery(roomId)
  const startAttemptMutation = useStartAttemptMutation()
  const startSession = useExamStore((s) => s.startSession)
  const navigate = useNavigate()


  if (isLoading) {
    return (
      <Card as="section" className="p-8 bg-surface border-line-subtle shadow-card rounded-2xl text-center space-y-3">
        <Text tone="muted">Đang tải thông tin phòng chờ thi...</Text>
      </Card>
    )
  }

  if (!room) {
    return (
      <Card as="section" className="p-8 bg-surface border-line-subtle shadow-card rounded-2xl text-center space-y-3">
        <Heading level={1} className="text-xl font-bold">
          Không tìm thấy phòng thi
        </Heading>
        <ButtonLink to="/student/rooms" variant="outline">
          Quay lại danh sách
        </ButtonLink>
      </Card>
    )
  }

  async function beginNow() {
    try {
      const attempt = await startAttemptMutation.mutateAsync({
        roomCode: room!.roomCode,
        mode: 'EXAM',
      })
      startSession({
        attemptId: attempt.attemptId,
        roomCode: room!.roomCode,
        durationSeconds: room!.durationSeconds,
        endsAt: room!.endsAt,
        serverNow: room!.serverNow,
      })
      toast.success('Bắt đầu làm bài thi chính thức')
      navigate(`/student/rooms/${room!.roomCode}/exam`)
    } catch {
      toast.error('Không thể bắt đầu lượt thi. Vui lòng thử lại.')
    }
  }

  const isRunning = room.status?.toUpperCase() === 'RUNNING' || room.status === 'in_progress'

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="space-y-2">
        <Badge tone={roomStatusTone(room.status)} size="sm">
          {roomStatusLabel(room.status)}
        </Badge>
        <Heading level={1} className="text-2xl font-extrabold text-text-primary">
          {room.name}
        </Heading>
        <Text size="sm" tone="muted">
          Mã phòng: {room.roomCode} · Giáo viên: {room.ownerDisplayName || 'Hệ thống'}
        </Text>
      </header>

      <Card as="section" className="p-6 bg-surface border-line-subtle shadow-card rounded-2xl space-y-4">
        <header className="flex items-center gap-2">
          <Clock size={18} className="text-action-accent" aria-hidden />
          <Heading level={2} className="text-lg font-bold">
            Thời lượng & Cấu hình bài thi
          </Heading>
        </header>
        <p className="text-4xl font-mono font-extrabold text-action-accent tabular-nums" aria-live="polite">
          {formatDuration(room.durationSeconds)}
        </p>
        <Text size="sm" tone="muted">
          Tổng số câu hỏi: {room.easyCount + room.mediumCount + room.hardCount} câu (Dễ: {room.easyCount}, Trung bình: {room.mediumCount}, Khó: {room.hardCount})
        </Text>
      </Card>

      <Card as="section" className="p-6 bg-surface border-line-subtle shadow-card rounded-2xl space-y-3">
        <header className="flex items-center gap-2">
          <ListChecks size={18} className="text-text-secondary" aria-hidden />
          <Heading level={2} className="text-lg font-bold">
            Quy định phòng thi trực tuyến
          </Heading>
        </header>
        <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
          <li>Không chuyển tab hoặc thoát toàn màn hình trong quá trình làm bài.</li>
          <li>Khi hết thời gian quy định, hệ thống sẽ tự động thu bài và chấm điểm tức thì.</li>
          <li>Chủ đề kiến thức: {room.topic || 'Tổng hợp'}</li>
        </ul>
        <p className="flex items-center gap-2 text-sm text-status-warning-fg">
          <Shield size={14} aria-hidden />
          Chế độ giám sát thi trực tuyến thời gian thực đang kích hoạt.
        </p>
      </Card>

      <footer className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={startAttemptMutation.isPending}
          onClick={beginNow}
        >
          {isRunning ? 'Vào làm bài thi ngay' : 'Bắt đầu làm bài thi'}
        </Button>
        <ButtonLink to="/student/rooms" variant="outline" size="md">
          Quay lại danh sách
        </ButtonLink>
      </footer>
    </div>
  )
}
