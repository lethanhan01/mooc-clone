import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import { toast } from '@/lib/toast'

const SAMPLE = `username,fullName,email
20236001,Lê Văn C,c.lv236001@sis.hust.edu.vn
20236002,Phạm Thị D,d.pt236002@sis.hust.edu.vn`

function parseAssigneeCsv(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1)
    .map((line) => {
      const [username = '', fullName = '', email = ''] = line.split(',').map((cell) => cell.trim())
      return { username, fullName, email }
    })
    .filter((row) => row.username || row.email)
}

export default function TeacherRoomAssignPage() {
  const { roomId = '' } = useParams()
  const room = useMockTeacherStore((s) => s.rooms.find((r) => r.id === roomId))
  const students = useMockTeacherStore((s) => s.students)
  const setRoomAssignees = useMockTeacherStore((s) => s.setRoomAssignees)
  const importRoomAssignees = useMockTeacherStore((s) => s.importRoomAssignees)
  const [selected, setSelected] = useState<string[]>(room?.assigneeIds ?? [])
  const [csv, setCsv] = useState(SAMPLE)

  if (!room) return <Text tone="muted">Không tìm thấy phòng mock.</Text>

  const modeLabel = room.mode === 'PRACTICE' ? 'Luyện tập' : 'Thi chính thức'

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header>
        <Heading level={1} className="text-lg font-bold">
          Phân sinh viên vào phòng
        </Heading>
        <Text size="sm" tone="muted">
          {room.name} · {modeLabel} · chọn từ danh sách đã import hoặc nạp CSV cho phòng này
        </Text>
      </header>

      <Card as="section" className="border border-line-subtle bg-surface-card p-4 shadow-none">
        <Heading level={2} className="mb-3 text-sm font-bold">
          Danh sách đã có trong hệ thống
        </Heading>
        <ul className="m-0 list-none space-y-2 p-0">
          {students.map((stu) => {
            const checked = selected.includes(stu.id)
            return (
              <li key={stu.id}>
                <label className="flex min-h-11 items-center gap-3 rounded-lg border border-line-subtle px-3 py-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelected((prev) => (checked ? prev.filter((id) => id !== stu.id) : [...prev, stu.id]))
                    }
                  />
                  <span className="text-sm">
                    {stu.fullName} · {stu.username} · {stu.email}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
        <footer className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setRoomAssignees(room.id, selected)
              toast.success(`Đã lưu ${selected.length} sinh viên vào phòng (mock)`)
            }}
          >
            Lưu danh sách đã chọn
          </Button>
          <ButtonLink to="/teacher/rooms" variant="outline" size="sm">
            Về phòng thi
          </ButtonLink>
          <ButtonLink to={`/teacher/rooms/${room.id}/logs`} variant="ghost" size="sm">
            Xem log phòng
          </ButtonLink>
        </footer>
      </Card>

      <Card as="section" className="space-y-3 border border-line-subtle bg-surface-card p-4 shadow-none">
        <Heading level={2} className="text-sm font-bold">
          Nạp CSV riêng cho phòng
        </Heading>
        <Text size="xs" tone="muted">
          Cột: username,fullName,email. Tài khoản đã có thì gắn vào phòng; chưa có thì tạo mới rồi gắn.
        </Text>
        <label htmlFor="room-assignee-csv" className="sr-only">
          CSV phân sinh viên
        </label>
        <textarea
          id="room-assignee-csv"
          className="min-h-32 w-full rounded-lg border border-line-subtle bg-action-accent-soft p-3 font-mono text-sm"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => {
            const rows = parseAssigneeCsv(csv)
            if (rows.length === 0) {
              toast.error('CSV không có dòng dữ liệu')
              return
            }
            const result = importRoomAssignees(room.id, rows)
            const nextIds = useMockTeacherStore.getState().rooms.find((r) => r.id === room.id)?.assigneeIds ?? []
            setSelected(nextIds)
            toast.success(`Đã gắn ${result.assigned} SV (${result.created} tài khoản mới)`)
          }}
        >
          Gắn CSV vào phòng
        </Button>
      </Card>
    </div>
  )
}
