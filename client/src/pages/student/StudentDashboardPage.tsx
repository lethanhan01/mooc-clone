import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, History, KeyRound } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { useMockExamStore } from '@/stores/mockExamStore'
import { roomStatusLabel, roomStatusTone } from '@/lib/room-status'
import { toast } from '@/lib/toast'

function modeCardClass(mode: 'official' | 'practice', status: string): string {
  if (status === 'finished') return 'border-line-subtle bg-surface-sunken/40'
  if (mode === 'official') return 'border-action-accent/40 bg-action-accent-soft/30'
  return 'border-status-warning-fg/30 bg-status-warning-bg/40'
}

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const rooms = useMockExamStore((s) => s.rooms)
  const joinRoomByPin = useMockExamStore((s) => s.joinRoomByPin)
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const activeRooms = rooms.filter((r) => r.status === 'waiting' || r.status === 'in_progress')

  function handleJoin() {
    if (!user || pin.trim().length < 4) {
      toast.error('Nhập mã PIN phòng thi hợp lệ')
      return
    }
    setLoading(true)
    try {
      const room = joinRoomByPin(
        pin.trim(),
        user.userId,
        user.studentId ?? 'SV000',
        user.fullName,
        user.email
      )
      if (!room) {
        toast.error('Không tìm thấy phòng hoặc phòng đã đóng')
        return
      }
      toast.success(`Đã vào phòng ${room.code}`)
      navigate(
        room.status === 'in_progress'
          ? `/student/rooms/${room.id}/exam`
          : `/student/rooms/${room.id}/waiting`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Xin chào, {user?.fullName ?? 'Học sinh'}
        </Heading>
        <Text size="sm" tone="muted">
          Tham gia phòng thi bằng PIN hoặc chọn phòng đang mở bên dưới
        </Text>
      </header>

      <Card as="section" className="p-5 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl">
        <Heading level={2} className="text-lg font-bold mb-3">
          Vào phòng bằng PIN
        </Heading>
        <Form onSubmit={handleJoin} noValidate className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <FormField id="join-pin" label="Mã PIN phòng thi" className="flex-1" required>
            <Input
              id="join-pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="VD: 882194"
              leftIcon={<KeyRound size={16} />}
              inputMode="numeric"
            />
          </FormField>
          <SubmitButton loading={loading} size="md" className="min-h-11">
            Tham gia
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
            Phòng chờ / đang thi
          </Heading>
          <ButtonLink to="/student/rooms" variant="ghost" size="sm">
            Xem tất cả
          </ButtonLink>
        </header>

        {activeRooms.length === 0 ? (
          <Text size="sm" tone="muted">
            Không có phòng đang mở. Dùng PIN hoặc luyện tập.
          </Text>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
            {activeRooms.map((room) => (
              <li key={room.id}>
                <Card
                  as="article"
                  className={`p-5 border shadow-card rounded-2xl space-y-3 ${modeCardClass(room.mode, room.status)}`}
                >
                  <header className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-text-primary leading-snug">{room.name}</p>
                    <Badge tone={roomStatusTone(room.status)} size="sm">
                      {roomStatusLabel(room.status)}
                    </Badge>
                  </header>
                  <p className="text-xs text-text-muted">
                    {room.code} · {room.topic} · {room.questionCount} câu · {room.durationMinutes} phút
                  </p>
                  <Badge tone={room.mode === 'official' ? 'danger' : 'warning'} size="sm">
                    {room.mode === 'official' ? 'Thi chính thức' : 'Luyện tập'}
                  </Badge>
                  <footer>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        navigate(
                          room.status === 'in_progress'
                            ? `/student/rooms/${room.id}/exam`
                            : `/student/rooms/${room.id}/waiting`
                        )
                      }
                    >
                      {room.status === 'in_progress' ? 'Vào làm bài' : 'Vào phòng chờ'}
                    </Button>
                  </footer>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
