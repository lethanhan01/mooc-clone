import { useParams } from 'react-router-dom'
import { Card, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import { formatDateTime } from '@/utils/date'

const EVENT_LABEL: Record<string, string> = {
  JOIN: 'Vào phòng',
  START: 'Bắt đầu',
  ANSWER_CHANGE: 'Đổi đáp án',
  SUBMIT: 'Nộp bài',
  LEAVE: 'Thoát',
  TIMEOUT: 'Hết giờ',
}

export default function TeacherRoomLogsPage() {
  const { roomId = '' } = useParams()
  const room = useMockTeacherStore((s) => s.rooms.find((r) => r.id === roomId))
  const logs = useMockTeacherStore((s) => s.roomLogs.filter((l) => l.roomId === roomId))

  if (!room) return <Text tone="muted">Không tìm thấy phòng mock.</Text>

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-lg font-bold">
            Log phòng thi
          </Heading>
          <Text size="sm" tone="muted">
            {room.name} · chỉ chủ phòng xem (mock)
          </Text>
        </div>
        <ButtonLink to={`/teacher/rooms/${room.id}/assign`} variant="outline" size="sm">
          Phân SV
        </ButtonLink>
      </header>

      <ul className="m-0 list-none space-y-2 p-0">
        {logs.map((log) => (
          <li key={log.id}>
            <Card as="article" className="border border-line-subtle bg-surface-card p-3 shadow-none">
              <header className="mb-1 flex flex-wrap items-center gap-2">
                <Badge tone="info" size="sm">
                  {EVENT_LABEL[log.event] ?? log.event}
                </Badge>
                <Text size="xs" tone="muted">
                  {formatDateTime(log.at)}
                </Text>
              </header>
              <Text size="sm">
                <strong>{log.actorName}</strong> — {log.detail}
              </Text>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
