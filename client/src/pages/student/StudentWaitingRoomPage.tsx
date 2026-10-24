import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Clock, ListChecks, Shield } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { useMockExamStore } from '@/stores/mockExamStore'
import { formatDuration, roomStatusLabel, roomStatusTone } from '@/lib/room-status'
import { toast } from '@/lib/toast'

export default function StudentWaitingRoomPage() {
  const { roomId = '' } = useParams()
  const user = useAuthStore((s) => s.user)
  const room = useMockExamStore((s) => s.rooms.find((r) => r.id === roomId))
  const startExam = useMockExamStore((s) => s.startExam)
  const navigate = useNavigate()
  const [remainSec, setRemainSec] = useState(0)

  useEffect(() => {
    if (!room?.opensAt) return
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(room.opensAt).getTime() - Date.now()) / 1000))
      setRemainSec(diff)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [room?.opensAt])

  if (!room) {
    return (
      <Card as="section" className="p-8 bg-surface border-line-subtle shadow-card rounded-2xl text-center space-y-3">
        <Heading level={1} className="text-xl font-bold">
          Không tìm thấy phòng
        </Heading>
        <ButtonLink to="/student/rooms" variant="outline">
          Quay lại danh sách
        </ButtonLink>
      </Card>
    )
  }

  function beginNow() {
    if (!user) return
    const session = startExam(room!.id, user.userId)
    if (!session) {
      toast.error('Không thể bắt đầu bài thi (thiếu câu hỏi)')
      return
    }
    toast.success('Bắt đầu làm bài')
    navigate(`/student/rooms/${room!.id}/exam`)
  }

  const canStart = room.status === 'in_progress' || remainSec === 0 || room.status === 'waiting'

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
          {room.code} · PIN {room.pin} · GV {room.teacherName}
        </Text>
      </header>

      <Card as="section" className="p-6 bg-surface border-line-subtle shadow-card rounded-2xl space-y-4">
        <header className="flex items-center gap-2">
          <Clock size={18} className="text-action-accent" aria-hidden />
          <Heading level={2} className="text-lg font-bold">
            Đếm ngược mở phòng
          </Heading>
        </header>
        <p className="text-4xl font-mono font-extrabold text-action-accent tabular-nums" aria-live="polite">
          {formatDuration(remainSec)}
        </p>
        <Text size="sm" tone="muted">
          Thời lượng làm bài: {room.durationMinutes} phút · {room.questionCount} câu hỏi
        </Text>
      </Card>

      <Card as="section" className="p-6 bg-surface border-line-subtle shadow-card rounded-2xl space-y-3">
        <header className="flex items-center gap-2">
          <ListChecks size={18} className="text-text-secondary" aria-hidden />
          <Heading level={2} className="text-lg font-bold">
            Quy định phòng thi
          </Heading>
        </header>
        <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
          <li>Không thoát toàn màn hình / chuyển tab nếu bật khóa thiết bị.</li>
          <li>Hết giờ hệ thống tự nộp bài.</li>
          <li>
            {room.options.showAnswersAfterSubmit
              ? 'Được xem đáp án sau khi nộp.'
              : 'Không xem đáp án ngay sau khi nộp.'}
          </li>
          <li>Chủ đề: {room.topics.join(', ') || room.topic}</li>
        </ul>
        {room.options.lockDevice ? (
          <p className="flex items-center gap-2 text-sm text-status-warning-fg">
            <Shield size={14} aria-hidden />
            Chế độ khóa thiết bị đang bật (mock)
          </p>
        ) : null}
      </Card>

      <footer className="flex flex-wrap gap-3">
        <Button type="button" variant="primary" size="md" disabled={!canStart} onClick={beginNow}>
          Bắt đầu làm bài ngay
        </Button>
        <ButtonLink to="/student/rooms" variant="outline" size="md">
          Quay lại
        </ButtonLink>
      </footer>
    </div>
  )
}
