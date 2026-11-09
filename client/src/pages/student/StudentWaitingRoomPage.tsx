import { useNavigate, useParams } from 'react-router-dom'
import { Clock, ListChecks, Shield } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { InfoNoticeBanner } from '@/components/student/InfoNoticeBanner'
import { useRoomDetailQuery, useStartAttemptMutation } from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'
import { formatDuration, roomStatusLabel, roomStatusTone } from '@/lib/room-status'
import { formatDateTime } from '@/utils/date'
import { toast } from '@/lib/toast'
import { MOCK_ROOMS, MOCK_SUBJECTS } from '@/mocks/teacher-workflow.fixtures'

export default function StudentWaitingRoomPage() {
  const { roomId = '' } = useParams()
  const { data: room, isLoading } = useRoomDetailQuery(roomId)
  const startAttemptMutation = useStartAttemptMutation()
  const startSession = useExamStore((s) => s.startSession)
  const navigate = useNavigate()

  const mockRoom = MOCK_ROOMS.find((r) => r.id === roomId)
  const mockSubject = MOCK_SUBJECTS.find((s) => s.id === mockRoom?.subjectId)

  if (isLoading && !mockRoom) {
    return (
      <Card as="section" className="space-y-3 rounded-xl border-line-subtle bg-surface-card p-8 text-center shadow-none">
        <Text tone="muted">Đang tải thông tin phòng chờ thi...</Text>
      </Card>
    )
  }

  if (!room && !mockRoom) {
    return (
      <Card as="section" className="space-y-3 rounded-xl border-line-subtle bg-surface-card p-8 text-center shadow-none">
        <Heading level={1} className="text-xl font-bold">
          Không tìm thấy phòng thi
        </Heading>
        <ButtonLink to="/student/dashboard" variant="outline">
          Quay lại khóa học của tôi
        </ButtonLink>
      </Card>
    )
  }

  async function beginNow() {
    if (mockRoom && !room) {
      startSession({
        attemptId: -1,
        roomCode: mockRoom.id,
        durationSeconds: mockRoom.durationMinutes * 60,
        endsAt: new Date(Date.now() + mockRoom.durationMinutes * 60 * 1000).toISOString(),
        serverNow: new Date().toISOString(),
      })
      toast.success(mockRoom.mode === 'PRACTICE' ? 'Bắt đầu luyện tập (mock)' : 'Bắt đầu làm bài (mock)')
      navigate(`/student/rooms/${mockRoom.id}/exam`)
      return
    }
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

  const title = room?.name ?? mockRoom?.name ?? 'Phòng thi'
  const status = room?.status ?? mockRoom?.status ?? 'OPEN'
  const duration = room ? formatDuration(room.durationSeconds) : `${mockRoom?.durationMinutes ?? 60} phút`
  const modeLabel = mockRoom?.mode === 'PRACTICE' ? 'Luyện tập' : 'Thi chính thức'
  const openAt = mockRoom?.openAt ?? room?.serverNow
  const closeAt = mockRoom?.closeAt ?? room?.endsAt
  const durationMinutes = mockRoom?.durationMinutes ?? Math.round((room?.durationSeconds ?? 3600) / 60)
  const milestones = [
    { label: 'Mở phòng', at: openAt, hint: 'Phòng bắt đầu nhận sinh viên đã được phân' },
    { label: 'Được vào', at: openAt, hint: 'Mỗi SV có thể vào lệch giờ trong khung mở–đóng' },
    { label: 'Bắt đầu làm bài', at: openAt, hint: `Thời lượng làm bài giống nhau: ${durationMinutes} phút` },
    { label: 'Hết giờ đóng', at: closeAt, hint: 'Hết khung vào phòng, hệ thống thu bài' },
  ]

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Waiting layout] */
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <main className="space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
          <div>
            <Heading level={1} className="text-xl font-bold sm:text-2xl">
              {title}
            </Heading>
            <Text size="sm" tone="muted">
              {mockSubject ? `${mockSubject.code} · ${mockSubject.name}` : room?.topic}
            </Text>
          </div>
          <Button type="button" variant="primary" size="md" onClick={beginNow}>
            Bắt đầu học →
          </Button>
        </header>

        <InfoNoticeBanner title="Sinh viên đọc kỹ trước khi làm bài thi">
          <Text size="sm" className="block space-y-2">
            <span className="block">
              1. Chọn đáp án rồi đợi thông báo <strong>Đã ghi nhận đáp án</strong> (Answer submitted).
            </span>
            <span className="block">
              2. Ô điều hướng câu sẽ đổi từ <span className="text-status-success-fg">xanh lá</span> sang{' '}
              <span className="text-action-primary">xanh dương</span> khi máy chủ xác nhận.
            </span>
            <span className="block">3. Nộp bài trước khi hết giờ. Hệ thống tự thu bài khi hết thời gian.</span>
          </Text>
        </InfoNoticeBanner>

        <Card as="section" className="border border-line-subtle bg-surface-sunken p-4 shadow-none">
          <Button type="button" variant="ghost" className="h-auto w-full justify-between px-0 py-1 text-left text-sm font-semibold">
            {title}
            <ListChecks size={16} aria-hidden />
          </Button>
          <ul className="mt-3 m-0 list-none space-y-2 p-0">
            <li>
              <ButtonLink to={`/student/rooms/${roomId}/summary`} variant="ghost" size="sm">
                Thống kê bài làm
              </ButtonLink>
            </li>
          </ul>
        </Card>
      </main>

      <aside className="space-y-4">
        <Card as="section" className="space-y-3 border border-line-subtle bg-surface-card p-4 shadow-none">
          <Heading level={2} className="text-sm font-bold">
            Công cụ khóa học
          </Heading>
          <ul className="m-0 list-none space-y-2 p-0 text-sm">
            <li className="flex items-center gap-2 text-fg-secondary">
              <Shield size={14} className="text-action-primary" aria-hidden />
              Chế độ: {modeLabel}
            </li>
            <li className="flex items-center gap-2 text-fg-secondary">
              <Clock size={14} className="text-action-primary" aria-hidden />
              Thời gian làm bài: {duration}
            </li>
          </ul>
          <Badge tone={room ? roomStatusTone(room.status) : 'info'} size="sm">
            {room ? roomStatusLabel(room.status) : String(status)}
          </Badge>
        </Card>
        <Card as="section" className="border border-line-subtle bg-surface-card p-4 shadow-none">
          <Heading level={2} className="mb-3 text-sm font-bold">
            Mốc thời gian
          </Heading>
          <ol className="m-0 list-none space-y-3 p-0">
            {milestones.map((step, index) => (
              <li key={step.label} className="border-l-2 border-action-primary pl-3">
                <Text size="xs" tone="muted" className="block">
                  {index + 1}. {step.label}
                </Text>
                <Text size="sm" className="font-semibold">
                  {formatDateTime(step.at)}
                </Text>
                <Text size="xs" tone="muted" className="mt-0.5 block">
                  {step.hint}
                </Text>
              </li>
            ))}
          </ol>
        </Card>
      </aside>
    </div>
  )
}
