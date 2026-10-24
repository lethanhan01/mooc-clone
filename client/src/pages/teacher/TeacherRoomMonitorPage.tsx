import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Users, Activity, Clock, Ban } from 'lucide-react'
import { Card, Badge, StatCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useMockExamStore } from '@/stores/mockExamStore'
import { formatDuration, roomStatusLabel, roomStatusTone } from '@/lib/room-status'
import { toast } from '@/lib/toast'

export default function TeacherRoomMonitorPage() {
  const { roomId = '' } = useParams()
  const room = useMockExamStore((s) => s.rooms.find((r) => r.id === roomId))
  const submissions = useMockExamStore((s) => s.submissions.filter((x) => x.roomId === roomId))
  const closeRoomByTeacher = useMockExamStore((s) => s.closeRoomByTeacher)
  const [confirmClose, setConfirmClose] = useState(false)

  if (!room) {
    return (
      <Card as="section" className="p-8 text-center bg-surface rounded-2xl">
        <Text tone="muted">Không tìm thấy phòng</Text>
        <ButtonLink to="/teacher/rooms" variant="outline" className="mt-3">
          Quay lại
        </ButtonLink>
      </Card>
    )
  }

  const online = room.members.filter((m) => m.online).length
  const remain =
    room.endsAt != null
      ? Math.max(0, Math.floor((new Date(room.endsAt).getTime() - Date.now()) / 1000))
      : room.durationMinutes * 60

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-xl sm:text-2xl font-extrabold">
            Giám sát · {room.code}
          </Heading>
          <Text size="sm" tone="muted">
            {room.name}
          </Text>
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header actions] */}
        <div className="flex flex-wrap gap-2 items-center">
          <Badge tone={roomStatusTone(room.status)} size="sm">
            {roomStatusLabel(room.status)}
          </Badge>
          <ButtonLink to={`/teacher/rooms/${roomId}/results`} variant="outline" size="sm">
            Xem kết quả
          </ButtonLink>
          <Button
            type="button"
            variant="danger"
            size="sm"
            leftIcon={<Ban size={14} />}
            disabled={room.status === 'finished'}
            onClick={() => setConfirmClose(true)}
          >
            Đóng phòng
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="KPI giám sát">
        <StatCard label="Học sinh online" value={`${online}/${room.members.length}`} icon={<Users size={20} />} />
        <StatCard label="Đã nộp bài" value={String(submissions.length)} icon={<Activity size={20} />} />
        <StatCard label="Thời gian còn" value={formatDuration(remain)} icon={<Clock size={20} />} />
      </section>

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Heading level={2} className="text-lg font-bold mb-3">
          Tiến độ học sinh
        </Heading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>MSSV</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead className="text-center">Online</TableHead>
              <TableHead className="text-center">Câu hiện tại</TableHead>
              <TableHead className="text-center">Đã trả lời</TableHead>
              <TableHead className="text-right">Nộp bài</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {room.members.map((m) => {
              const sub = submissions.find((s) => s.userId === m.userId)
              return (
                <TableRow key={m.userId}>
                  <TableCell className="font-mono text-sm">{m.studentId}</TableCell>
                  <TableCell className="font-medium">{m.fullName}</TableCell>
                  <TableCell className="text-center">
                    <Badge tone={m.online ? 'accent' : 'neutral'} size="sm">
                      {m.online ? 'Online' : 'Offline'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{m.currentQuestion ?? '—'}</TableCell>
                  <TableCell className="text-center">
                    {m.answeredCount ?? 0}/{room.questionCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {sub ? (
                      <Badge tone="accent" size="sm">
                        {sub.score}/10
                      </Badge>
                    ) : (
                      <p className="text-xs text-text-muted">Chưa nộp</p>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {room.members.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-6">
            Chưa có học sinh trong phòng
          </Text>
        ) : null}
      </Card>

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Cưỡng chế đóng phòng?"
        description="Mọi phiên thi đang mở sẽ bị kết thúc. Học sinh chưa nộp sẽ không lưu thêm câu trả lời."
        variant="danger"
        confirmLabel="Đóng phòng"
        onConfirm={() => {
          closeRoomByTeacher(roomId)
          setConfirmClose(false)
          toast.warning('Đã đóng phòng thi')
        }}
      />
    </div>
  )
}
