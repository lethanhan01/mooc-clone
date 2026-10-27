import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, History, KeyRound } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { useRoomsListQuery, useJoinRoomMutation } from '@/hooks/queries'
import { roomStatusLabel, roomStatusTone, formatDuration } from '@/lib/room-status'
import { toast } from '@/lib/toast'

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: rooms = [], isLoading } = useRoomsListQuery()
  const joinRoomMutation = useJoinRoomMutation()
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const activeRooms = rooms.filter((r) => {
    const s = r.status?.toUpperCase()
    return s === 'WAITING' || s === 'RUNNING' || r.status === 'waiting' || r.status === 'in_progress'
  })

  async function handleJoin() {
    const code = roomCode.trim().toUpperCase()
    if (!code) {
      toast.error('Nhập mã phòng thi hợp lệ')
      return
    }
    setLoading(true)
    try {
      const room = await joinRoomMutation.mutateAsync(code)
      toast.success(`Đã vào phòng thi ${room.roomCode}`)
      const s = room.status?.toUpperCase()
      navigate(s === 'RUNNING' || room.status === 'in_progress' ? `/student/rooms/${room.roomCode}/exam` : `/student/rooms/${room.roomCode}/waiting`)
    } catch {
      toast.error('Không tìm thấy phòng thi hoặc không thể tham gia')
    } finally {
      setLoading(false)
    }
  }

  function renderActiveRoomsContent() {
    if (isLoading) {
      return (
        <Text size="sm" tone="muted">
          Đang tải danh sách phòng thi...
        </Text>
      )
    }
    if (activeRooms.length === 0) {
      return (
        <Text size="sm" tone="muted">
          Hiện không có phòng thi nào đang mở. Thử nhập mã phòng hoặc chọn luyện tập tự do.
        </Text>
      )
    }
    return (
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
        {activeRooms.map((room) => {
          const isRunning = room.status?.toUpperCase() === 'RUNNING' || room.status === 'in_progress'
          return (
            <li key={room.id}>
              <Card as="article" className="p-5 border border-line-subtle bg-surface shadow-card rounded-2xl space-y-3">
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-text-primary leading-snug">{room.roomName}</p>
                  <Badge tone={roomStatusTone(room.status)} size="sm">
                    {roomStatusLabel(room.status)}
                  </Badge>
                </header>
                <p className="text-xs text-text-muted">
                  Mã: {room.roomCode} · {room.totalQuestions} câu · {formatDuration(room.durationSeconds)} · {room.participantsCount} thí sinh
                </p>
                <Badge tone={isRunning ? 'accent' : 'warning'} size="sm">
                  {isRunning ? 'Đang diễn ra' : 'Đang chờ thí sinh'}
                </Badge>
                <footer>
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(isRunning ? `/student/rooms/${room.roomCode}/exam` : `/student/rooms/${room.roomCode}/waiting`)}
                  >
                    {isRunning ? 'Vào làm bài thi' : 'Vào phòng chờ'}
                  </Button>
                </footer>
              </Card>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Xin chào, {user?.fullName ?? 'Học sinh'}
        </Heading>
        <Text size="sm" tone="muted">
          Tham gia phòng thi bằng Mã phòng hoặc chọn phòng đang mở bên dưới
        </Text>
      </header>

      <Card as="section" className="p-5 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl">
        <Heading level={2} className="text-lg font-bold mb-3">
          Vào phòng thi nhanh
        </Heading>
        <Form onSubmit={handleJoin} noValidate className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <FormField id="join-room-code" label="Mã phòng thi (VD: NET-WAIT01, DB-RUN001)" className="flex-1" required>
            <Input
              id="join-room-code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="VD: NET-WAIT01"
              leftIcon={<KeyRound size={16} />}
            />
          </FormField>
          <SubmitButton loading={loading} size="md" className="min-h-11">
            Tham gia phòng
          </SubmitButton>
        </Form>
      </Card>

      <nav aria-label="Lối tắt" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ButtonLink to="/student/practice" variant="outline" size="md" leftIcon={<BookOpen size={16} />}>
          Luyện tập theo chủ đề
        </ButtonLink>
        <ButtonLink to="/student/history" variant="outline" size="md" leftIcon={<History size={16} />}>
          Lịch sử làm bài
        </ButtonLink>
      </nav>

      <section aria-label="Phòng đang mở" className="space-y-3">
        <header className="flex items-center justify-between gap-2">
          <Heading level={2} className="text-lg font-bold">
            Phòng chờ & đang thi trực tuyến
          </Heading>
          <ButtonLink to="/student/rooms" variant="ghost" size="sm">
            Xem tất cả
          </ButtonLink>
        </header>

        {renderActiveRoomsContent()}
      </section>
    </div>
  )
}
