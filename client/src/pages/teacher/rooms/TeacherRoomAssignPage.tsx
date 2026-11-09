import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Input } from '@/components/ui/forms'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
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
  const removeStudent = useMockTeacherStore((s) => s.removeStudent)
  const [selected, setSelected] = useState<string[]>(room?.assigneeIds ?? [])
  const [csv, setCsv] = useState(SAMPLE)
  const [keyword, setKeyword] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (!room) return <Text tone="muted">Không tìm thấy phòng mock.</Text>

  const modeLabel = room.mode === 'PRACTICE' ? 'Luyện tập' : 'Thi chính thức'
  const query = appliedQuery.trim().toLowerCase()
  const visibleStudents = students.filter((stu) => {
    if (!query) return true
    return stu.fullName.toLowerCase().includes(query) || stu.username.toLowerCase().includes(query)
  })
  const studentToDelete = students.find((stu) => stu.id === deleteId) ?? null

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
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Search row] */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <Input
            id="assignee-search"
            aria-label="Tìm sinh viên theo tên hoặc MSSV"
            placeholder="Tên hoặc MSSV"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            leftIcon={<Search size={14} />}
            className="min-h-11 sm:flex-1"
          />
          <Button type="button" variant="primary" size="sm" className="min-h-11" onClick={() => setAppliedQuery(keyword)}>
            Tìm kiếm
          </Button>
          {appliedQuery ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11"
              onClick={() => {
                setKeyword('')
                setAppliedQuery('')
              }}
            >
              Xóa lọc
            </Button>
          ) : null}
        </div>
        <ul className="m-0 list-none space-y-2 p-0">
          {visibleStudents.map((stu) => {
            const checked = selected.includes(stu.id)
            return (
              <li key={stu.id}>
                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Student row] */}
                <div className="flex min-h-11 items-center gap-3 rounded-lg border border-line-subtle px-3 py-2">
                  <label className="flex min-h-11 flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelected((prev) => (checked ? prev.filter((id) => id !== stu.id) : [...prev, stu.id]))
                      }
                    />
                    <span className="text-sm">
                      {stu.fullName} · MSSV {stu.username} · {stu.email}
                    </span>
                  </label>
                  <Button type="button" variant="danger" size="sm" className="min-h-11" onClick={() => setDeleteId(stu.id)}>
                    Xóa
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
        {visibleStudents.length === 0 ? (
          <Text size="sm" tone="muted">
            Không có sinh viên khớp tên hoặc MSSV.
          </Text>
        ) : null}
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

      <ConfirmDialog
        open={Boolean(studentToDelete)}
        onClose={() => setDeleteId(null)}
        title="Xóa sinh viên?"
        description={
          studentToDelete
            ? `${studentToDelete.fullName} (MSSV ${studentToDelete.username}) sẽ bị xóa khỏi danh sách và khỏi mọi phòng mock.`
            : ''
        }
        confirmLabel="Xóa sinh viên"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={() => {
          if (!studentToDelete) return
          removeStudent(studentToDelete.id)
          setSelected((prev) => prev.filter((id) => id !== studentToDelete.id))
          setDeleteId(null)
          toast.success('Đã xóa sinh viên')
        }}
      />
    </div>
  )
}
