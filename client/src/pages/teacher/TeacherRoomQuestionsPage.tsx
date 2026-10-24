import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Upload } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Form, FormField, Input, Textarea, Checkbox } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useMockExamStore } from '@/stores/mockExamStore'
import { SEED_QUESTION_BANK, type Difficulty, type MockQuestion } from '@/services/mockData'
import { toast } from '@/lib/toast'

function emptyQuestion(): MockQuestion {
  const id = `q_${Date.now()}`
  return {
    id,
    content: '',
    topic: 'Mạng máy tính',
    difficulty: 'EASY',
    explanation: '',
    options: (['A', 'B', 'C', 'D'] as const).map((label) => ({
      id: `${id}_${label}`,
      label,
      text: '',
      isCorrect: label === 'A',
    })),
  }
}

export default function TeacherRoomQuestionsPage() {
  const { roomId = '' } = useParams()
  const navigate = useNavigate()
  const room = useMockExamStore((s) => s.rooms.find((r) => r.id === roomId))
  const questions = useMockExamStore((s) => s.questionsByRoom[roomId] ?? [])
  const addQuestion = useMockExamStore((s) => s.addQuestion)
  const updateQuestion = useMockExamStore((s) => s.updateQuestion)
  const deleteQuestion = useMockExamStore((s) => s.deleteQuestion)
  const importQuestions = useMockExamStore((s) => s.importQuestions)
  const startRoomByTeacher = useMockExamStore((s) => s.startRoomByTeacher)

  const [selectedId, setSelectedId] = useState<string | null>(questions[0]?.id ?? null)
  const [draft, setDraft] = useState<MockQuestion | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selected = useMemo(
    () => draft ?? questions.find((q) => q.id === selectedId) ?? null,
    [draft, questions, selectedId]
  )

  if (!room) {
    return (
      <Card as="section" className="p-8 text-center rounded-2xl bg-surface space-y-3">
        <Text tone="muted">Không tìm thấy phòng</Text>
        <ButtonLink to="/teacher/rooms" variant="outline">Quay lại</ButtonLink>
      </Card>
    )
  }

  function pick(q: MockQuestion) {
    setSelectedId(q.id)
    setDraft({ ...q, options: q.options.map((o) => ({ ...o })) })
  }

  function patchDraft(patch: Partial<MockQuestion>) {
    setDraft((d) => ({ ...(d ?? selected!), ...patch }))
  }

  function handleSave() {
    if (!selected) return
    const data = draft ?? selected
    if (!data.content.trim()) {
      toast.error('Nhập nội dung câu hỏi')
      return
    }
    setSaving(true)
    try {
      if (questions.some((q) => q.id === data.id)) updateQuestion(roomId, data.id, data)
      else addQuestion(roomId, data)
      toast.success('Đã lưu câu hỏi')
      setSelectedId(data.id)
      setDraft(null)
    } finally {
      setSaving(false)
    }
  }

  function handleImport() {
    const batch = SEED_QUESTION_BANK.slice(0, 5).map((q) => ({
      ...q,
      id: `${q.id}_imp_${Date.now()}`,
      options: q.options.map((o) => ({ ...o, id: `${o.id}_${Date.now()}` })),
    }))
    importQuestions(roomId, batch)
    toast.success(`Đã import ${batch.length} câu từ ngân hàng mock`)
  }

  const editing = draft ?? selected

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Two-column editor page] */
    <div className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title stack] */}
        <div>
          <Heading level={1} className="text-xl font-extrabold">Soạn đề · {room.code}</Heading>
          <Text size="sm" tone="muted">{room.name} · {questions.length} câu</Text>
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Toolbar] */}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" leftIcon={<Upload size={14} />} onClick={handleImport}>
            Import mock JSON
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            leftIcon={<Plus size={14} />}
            onClick={() => {
              const q = emptyQuestion()
              setDraft(q)
              setSelectedId(q.id)
            }}
          >
            Thêm câu
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              startRoomByTeacher(roomId)
              toast.success('Đã mở phòng thi')
              navigate(`/teacher/rooms/${roomId}/monitor`)
            }}
          >
            Mở phòng
          </Button>
        </div>
      </header>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Editor columns] */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <aside className="space-y-2 max-h-[70vh] overflow-y-auto" aria-label="Danh sách câu hỏi">
          {questions.map((q, i) => (
            <Button
              key={q.id}
              type="button"
              variant={selectedId === q.id ? 'primary' : 'outline'}
              className="w-full justify-start h-auto py-3 text-left whitespace-normal"
              onClick={() => pick(q)}
            >
              {i + 1}. {q.content.slice(0, 56)}
              {q.content.length > 56 ? '…' : ''}
            </Button>
          ))}
          {questions.length === 0 ? <Text size="sm" tone="muted">Chưa có câu — thêm hoặc import.</Text> : null}
        </aside>

        <Card as="section" className="p-5 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl">
          {!editing ? (
            <Text tone="muted">Chọn hoặc thêm câu hỏi để chỉnh sửa</Text>
          ) : (
            <Form onSubmit={handleSave} noValidate className="space-y-4">
              <FormField id="q-content" label="Nội dung câu hỏi" required>
                <Textarea id="q-content" rows={3} value={editing.content} onChange={(e) => patchDraft({ content: e.target.value })} />
              </FormField>
              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Meta grid] */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField id="q-topic" label="Chủ đề">
                  <Input id="q-topic" value={editing.topic} onChange={(e) => patchDraft({ topic: e.target.value })} />
                </FormField>
                <FormField id="q-diff" label="Độ khó (EASY/MEDIUM/HARD)">
                  <Input
                    id="q-diff"
                    value={editing.difficulty}
                    onChange={(e) => patchDraft({ difficulty: e.target.value as Difficulty })}
                  />
                </FormField>
              </div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium mb-1">Đáp án</legend>
                {editing.options.map((opt, oi) => (
                  /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Option editor row] */
                  <div key={opt.id} className="flex gap-2 items-start">
                    <Badge tone="neutral" size="sm" className="mt-2">{opt.label}</Badge>
                    <Input
                      aria-label={`Đáp án ${opt.label}`}
                      value={opt.text}
                      className="flex-1"
                      onChange={(e) => {
                        const options = editing.options.map((o, j) => (j === oi ? { ...o, text: e.target.value } : o))
                        patchDraft({ options })
                      }}
                    />
                    <Checkbox
                      label="Đúng"
                      checked={opt.isCorrect}
                      onCheckedChange={(checked) => {
                        const options = editing.options.map((o, j) => ({ ...o, isCorrect: j === oi ? checked : false }))
                        patchDraft({ options })
                      }}
                    />
                  </div>
                ))}
              </fieldset>
              <FormField id="q-exp" label="Giải thích">
                <Textarea id="q-exp" rows={2} value={editing.explanation ?? ''} onChange={(e) => patchDraft({ explanation: e.target.value })} />
              </FormField>
              <footer className="flex flex-wrap gap-2">
                <SubmitButton loading={saving}>Lưu câu hỏi</SubmitButton>
                {questions.some((q) => q.id === editing.id) ? (
                  <Button type="button" variant="danger" size="md" leftIcon={<Trash2 size={14} />} onClick={() => setDeleteId(editing.id)}>
                    Xóa
                  </Button>
                ) : null}
              </footer>
            </Form>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Xóa câu hỏi?"
        description="Thao tác không hoàn tác trong phiên mock hiện tại."
        variant="danger"
        onConfirm={() => {
          if (!deleteId) return
          deleteQuestion(roomId, deleteId)
          toast.success('Đã xóa câu hỏi')
          setDeleteId(null)
          setDraft(null)
          setSelectedId(null)
        }}
      />
    </div>
  )
}
