import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { toast } from '@/lib/toast'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import type { RoomMode } from '@/mocks/teacher-workflow.fixtures'

function toDatetimeLocal(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function TeacherRoomCreatePage() {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const subjects = useMockTeacherStore((s) => s.subjects)
  const banks = useMockTeacherStore((s) => s.banks)
  const existing = useMockTeacherStore((s) => s.rooms.find((room) => room.id === roomId))
  const createRoom = useMockTeacherStore((s) => s.createRoom)
  const updateRoom = useMockTeacherStore((s) => s.updateRoom)
  const deleteRoom = useMockTeacherStore((s) => s.deleteRoom)
  const isEdit = Boolean(roomId)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [name, setName] = useState(existing?.name ?? 'Phòng thi cuối kỳ IT4549')
  const [classCode, setClassCode] = useState(existing?.classCode ?? 'IT4549-01')
  const [subjectId, setSubjectId] = useState(existing?.subjectId ?? subjects[0]?.id ?? '')
  const [questionBankId, setQuestionBankId] = useState(existing?.questionBankId ?? banks[0]?.id ?? '')
  const [mode, setMode] = useState<RoomMode>(existing?.mode ?? 'EXAM')
  const [capacity, setCapacity] = useState(existing?.capacity ?? 100)
  const [durationMinutes, setDurationMinutes] = useState(existing?.durationMinutes ?? 60)
  const [roomCount, setRoomCount] = useState(1)
  const [openAt, setOpenAt] = useState(() =>
    existing ? toDatetimeLocal(existing.openAt) : new Date().toISOString().slice(0, 16)
  )
  const [closeAt, setCloseAt] = useState(() => {
    if (existing) return toDatetimeLocal(existing.closeAt)
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
    if (!isEdit && roomCount < 1) next.roomCount = 'Ít nhất 1 phòng'
    if (!questionBankId) next.bank = 'Chọn ngân hàng câu hỏi'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const payload = {
      name: name.trim(),
      subjectId,
      classCode: classCode.trim(),
      examPaperIds: [] as string[],
      questionBankId,
      mode,
      capacity,
      openAt: new Date(openAt).toISOString(),
      closeAt: new Date(closeAt).toISOString(),
      durationMinutes,
    }

    if (isEdit && existing) {
      updateRoom(existing.id, payload)
      toast.success('Đã cập nhật phòng', {
        description: 'Số mã đề và tỉ lệ độ khó sẽ do backend tính khi phòng chạy',
      })
      navigate('/teacher/rooms')
      return
    }

    const createdIds: string[] = []
    for (let i = 0; i < roomCount; i++) {
      const suffix = roomCount > 1 ? ` · P${i + 1}` : ''
      const room = createRoom({
        ...payload,
        name: `${payload.name}${suffix}`,
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

  if (isEdit && !existing) return <Text tone="muted">Không tìm thấy phòng để chỉnh sửa.</Text>

  return (
    <Card as="article" className="space-y-6 rounded-2xl border-line-subtle bg-surface-card p-6 shadow-none sm:p-8">
      <header>
        <Heading level={1} className="text-xl font-extrabold sm:text-2xl">
          {isEdit ? 'Chỉnh sửa phòng thi' : 'Tạo phòng thi (mock)'}
        </Heading>
        <Text size="sm" tone="muted" className="mt-1">
          Chọn ngân hàng câu hỏi. Backend tự sinh số mã đề theo số sinh viên và giữ tỉ lệ câu dễ, trung bình, khó.
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
          <FormField
            id="room-bank"
            label="Ngân hàng câu hỏi"
            error={errors.bank}
            hint="Số đề sinh ra và tỉ lệ độ khó do backend tính theo số SV tham gia."
            required
          >
            <select
              id="room-bank"
              className="min-h-11 w-full rounded-lg border border-line-subtle bg-surface-card px-3"
              value={questionBankId}
              onChange={(e) => {
                setQuestionBankId(e.target.value)
                setErrors((prev) => ({ ...prev, bank: undefined }))
              }}
            >
              <option value="">— Chọn ngân hàng —</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name} · {bank.questionCount} câu
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
          {isEdit ? null : (
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
          )}
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

        <footer className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <ButtonLink to="/teacher/rooms" variant="outline" size="md">
            Hủy
          </ButtonLink>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Save and delete actions] */}
          <div className="flex flex-wrap gap-2">
            {isEdit ? <Button type="button" variant="danger" size="md" onClick={() => setConfirmDelete(true)}>Xóa</Button> : null}
            <SubmitButton variant="primary" size="md">
              {isEdit ? 'Lưu chỉnh sửa' : 'Lưu phòng mock »'}
            </SubmitButton>
          </div>
        </footer>
      </Form>
      <ConfirmDialog
        open={confirmDelete && Boolean(existing)}
        onClose={() => setConfirmDelete(false)}
        title="Xóa phòng thi?"
        description={existing ? `Phòng “${existing.name}” sẽ bị xóa khỏi danh sách mock.` : ''}
        confirmLabel="Xóa phòng"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={() => {
          if (!existing) return
          deleteRoom(existing.id)
          toast.success('Đã xóa phòng thi')
          navigate('/teacher/rooms')
        }}
      />
    </Card>
  )
}
