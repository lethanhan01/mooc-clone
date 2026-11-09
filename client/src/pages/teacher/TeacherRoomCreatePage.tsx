import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { toast } from '@/lib/toast'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import type { RoomMode } from '@/mocks/teacher-workflow.fixtures'

export default function TeacherRoomCreatePage() {
  const navigate = useNavigate()
  const subjects = useMockTeacherStore((s) => s.subjects)
  const exams = useMockTeacherStore((s) => s.exams)
  const createRoom = useMockTeacherStore((s) => s.createRoom)

  const [name, setName] = useState('Phòng thi cuối kỳ IT4549')
  const [classCode, setClassCode] = useState('IT4549-01')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '')
  const [examPaperId, setExamPaperId] = useState(exams[0]?.id ?? '')
  const [mode, setMode] = useState<RoomMode>('EXAM')
  const [capacity, setCapacity] = useState(100)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [roomCount, setRoomCount] = useState(1)
  const [openAt, setOpenAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [closeAt, setCloseAt] = useState(() => {
    const d = new Date()
    d.setHours(d.getHours() + 3)
    return d.toISOString().slice(0, 16)
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string | undefined> = {}
    if (!name.trim()) next.name = 'Nhập tên phòng'
    if (!classCode.trim()) next.classCode = 'Nhập mã lớp'
    if (!subjectId) next.subjectId = 'Chọn môn'
    if (capacity < 1) next.capacity = 'Sức chứa tối thiểu 1'
    if (durationMinutes < 1) next.duration = 'Thời lượng tối thiểu 1 phút'
    if (roomCount < 1) next.roomCount = 'Ít nhất 1 phòng'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const createdIds: string[] = []
    for (let i = 0; i < roomCount; i++) {
      const suffix = roomCount > 1 ? ` · P${i + 1}` : ''
      const room = createRoom({
        name: `${name.trim()}${suffix}`,
        subjectId,
        classCode: classCode.trim(),
        examPaperIds: examPaperId ? [examPaperId] : [],
        mode,
        capacity,
        openAt: new Date(openAt).toISOString(),
        closeAt: new Date(closeAt).toISOString(),
        durationMinutes,
        status: 'OPEN',
      })
      createdIds.push(room.id)
    }

    const modeLabel = mode === 'PRACTICE' ? 'luyện tập' : 'thi chính thức'
    toast.success(roomCount > 1 ? `Đã tạo ${roomCount} phòng mock` : 'Đã tạo phòng mock', {
      description: `Loại phòng: ${modeLabel} · SV vào theo danh sách được phân`,
    })
    navigate(createdIds[0] ? `/teacher/rooms/${createdIds[0]}/assign` : '/teacher/rooms')
  }

  return (
    <Card as="article" className="space-y-6 rounded-2xl border-line-subtle bg-surface-card p-6 shadow-none sm:p-8">
      <header>
        <Heading level={1} className="text-xl font-extrabold sm:text-2xl">
          Tạo phòng thi (mock)
        </Heading>
        <Text size="sm" tone="muted" className="mt-1">
          Chưa gọi backend — lưu vào mock store để gắn đề, mode EXAM/PRACTICE và phân SV.
        </Text>
      </header>

      <Form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField id="room-name" label="Tên phòng thi" error={errors.name} required>
          <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Create-room meta grid] */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField id="room-class" label="Mã lớp" error={errors.classCode} required>
            <Input id="room-class" value={classCode} onChange={(e) => setClassCode(e.target.value)} />
          </FormField>
          <FormField id="room-subject" label="Môn thi" error={errors.subjectId} required>
            <select
              id="room-subject"
              className="min-h-11 w-full rounded-lg border border-line-subtle bg-surface-card px-3"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="room-exam" label="Đề gắn phòng">
            <select
              id="room-exam"
              className="min-h-11 w-full rounded-lg border border-line-subtle bg-surface-card px-3"
              value={examPaperId}
              onChange={(e) => setExamPaperId(e.target.value)}
            >
              <option value="">— Chưa chọn —</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="room-mode" label="Chế độ phòng" required>
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Mode toggle] */}
            <div className="flex flex-wrap gap-2">
              {(['EXAM', 'PRACTICE'] as const).map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={mode === m ? 'primary' : 'outline'}
                  onClick={() => setMode(m)}
                >
                  {m === 'EXAM' ? 'Thi chính thức' : 'Luyện tập'}
                </Button>
              ))}
            </div>
          </FormField>
          <FormField id="room-capacity" label="Sức chứa (số thí sinh)" error={errors.capacity} required>
            <Input
              id="room-capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </FormField>
          <FormField id="room-count" label="Số lượng phòng tạo lần này" error={errors.roomCount} required>
            <Input
              id="room-count"
              type="number"
              min={1}
              max={20}
              value={roomCount}
              onChange={(e) => setRoomCount(Number(e.target.value))}
            />
          </FormField>
          <FormField id="room-duration" label="Thời lượng làm bài (phút)" error={errors.duration} required>
            <Input
              id="room-duration"
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </FormField>
          <FormField id="room-open" label="Mở phòng từ">
            <Input id="room-open" type="datetime-local" value={openAt} onChange={(e) => setOpenAt(e.target.value)} />
          </FormField>
          <FormField id="room-close" label="Đóng phòng lúc">
            <Input id="room-close" type="datetime-local" value={closeAt} onChange={(e) => setCloseAt(e.target.value)} />
          </FormField>
        </div>

        <footer className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
          <ButtonLink to="/teacher/rooms" variant="outline" size="md">
            Hủy
          </ButtonLink>
          <SubmitButton variant="primary" size="md">
            Lưu phòng mock »
          </SubmitButton>
        </footer>
      </Form>
    </Card>
  )
}
