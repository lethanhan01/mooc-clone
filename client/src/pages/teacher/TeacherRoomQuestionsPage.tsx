import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft, Play } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Form, FormField, Input, Textarea, Checkbox } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import {
  useRoomDetailQuery,
  useQuestionsListQuery,
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useStartRoomMutation,
} from '@/hooks/queries'
import type { QuestionResponse, DifficultyLevel } from '@/types'
import { toast } from '@/lib/toast'

interface DraftQuestion {
  id?: number
  content: string
  topic: string
  difficulty: DifficultyLevel
  options: Array<{
    id?: number
    content: string
    position: number
    isCorrect: boolean
  }>
}

function emptyDraft(topic = 'Mạng máy tính'): DraftQuestion {
  return {
    content: '',
    topic,
    difficulty: 'EASY',
    options: [
      { content: '', position: 1, isCorrect: true },
      { content: '', position: 2, isCorrect: false },
      { content: '', position: 3, isCorrect: false },
      { content: '', position: 4, isCorrect: false },
    ],
  }
}

export default function TeacherRoomQuestionsPage() {
  const { roomId = '' } = useParams()
  const navigate = useNavigate()

  const { data: room, isLoading: isRoomLoading } = useRoomDetailQuery(roomId)
  const { data: allQuestions = [], isLoading: isQuestionsLoading } = useQuestionsListQuery()
  const createQuestionMutation = useCreateQuestionMutation()
  const deleteQuestionMutation = useDeleteQuestionMutation()
  const startRoomMutation = useStartRoomMutation()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draft, setDraft] = useState<DraftQuestion | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const roomTopic = room?.topic
  const questions = useMemo(() => {
    if (!roomTopic) return allQuestions
    const matching = allQuestions.filter((q) => q.topic.toLowerCase().includes(roomTopic.toLowerCase()))
    return matching.length > 0 ? matching : allQuestions
  }, [allQuestions, roomTopic])


  const selected = useMemo(() => {
    if (draft) return draft
    if (!selectedId) return questions[0] ? toDraft(questions[0]) : null
    const found = questions.find((q) => q.id === selectedId)
    return found ? toDraft(found) : null
  }, [draft, questions, selectedId])

  function toDraft(q: QuestionResponse): DraftQuestion {
    return {
      id: q.id,
      content: q.content,
      topic: q.topic,
      difficulty: q.difficulty,
      options: q.options.map((o, idx) => ({
        id: o.id,
        content: o.content,
        position: o.position ?? idx + 1,
        isCorrect: Boolean(o.isCorrect),
      })),
    }
  }

  function patchDraft(patch: Partial<DraftQuestion>) {
    setDraft((prev) => ({ ...(prev ?? selected ?? emptyDraft(room?.topic)), ...patch }))
  }

  async function handleSave() {
    if (!selected) return
    if (!selected.content.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi')
      return
    }
    const hasValidOption = selected.options.some((o) => o.content.trim() !== '')
    if (!hasValidOption) {
      toast.error('Vui lòng nhập nội dung cho ít nhất một đáp án')
      return
    }

    setSaving(true)
    try {
      await createQuestionMutation.mutateAsync({
        topic: selected.topic || room?.topic || 'Tổng hợp',
        difficulty: selected.difficulty,
        questionType: 'SINGLE_CHOICE',
        content: selected.content.trim(),
        options: selected.options.map((o, i) => ({
          content: o.content.trim() || `Phương án ${i + 1}`,
          position: o.position ?? i + 1,
          isCorrect: o.isCorrect,
        })),
      })
      toast.success('Đã lưu câu hỏi mới vào ngân hàng câu hỏi')
      setDraft(null)
    } catch {
      toast.error('Không thể lưu câu hỏi vào cơ sở dữ liệu')
    } finally {
      setSaving(false)
    }
  }

  async function handleStartRoom() {
    if (!room) return
    try {
      await startRoomMutation.mutateAsync(room.roomCode)
      toast.success('Đã mở phòng thi thành công')
      navigate(`/teacher/rooms/${room.roomCode}/monitor`)
    } catch {
      toast.error('Không thể mở phòng thi. Vui lòng kiểm tra quyền hạn.')
    }
  }

  if (isRoomLoading || isQuestionsLoading) {
    return (
      <Card as="section" className="p-8 text-center rounded-2xl bg-surface space-y-3">
        <Text tone="muted">Đang tải dữ liệu phòng thi từ máy chủ...</Text>
      </Card>
    )
  }

  if (!room) {
    return (
      <Card as="section" className="p-8 text-center rounded-2xl bg-surface space-y-3">
        <Text tone="muted">Không tìm thấy phòng thi với mã {roomId}</Text>
        <ButtonLink to="/teacher/rooms" variant="outline">
          Quay lại danh sách
        </ButtonLink>
      </Card>
    )
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Two-column editor page] */
    <div className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title stack] */}
        <div>
          <Heading level={1} className="text-xl font-extrabold">
            Soạn đề & Quản lý câu hỏi · {room.roomCode}
          </Heading>
          <Text size="sm" tone="muted">
            {room.name} · Ngân hàng hiện có {questions.length} câu phù hợp
          </Text>
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Toolbar] */}
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/teacher/rooms" variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Quay lại
          </ButtonLink>
          <Button
            type="button"
            size="sm"
            variant="primary"
            leftIcon={<Plus size={14} />}
            onClick={() => {
              const q = emptyDraft(room.topic)
              setDraft(q)
              setSelectedId(null)
            }}
          >
            Thêm câu mới
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            leftIcon={<Play size={14} />}
            onClick={handleStartRoom}
          >
            Mở phòng thi
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
              variant={selected?.id === q.id ? 'primary' : 'outline'}
              className="w-full justify-start h-auto py-3 text-left whitespace-normal"
              onClick={() => {
                setSelectedId(q.id)
                setDraft(null)
              }}
            >
              {i + 1}. {q.content.slice(0, 56)}
              {q.content.length > 56 ? '…' : ''}
            </Button>
          ))}
          {questions.length === 0 ? (
            <Text size="sm" tone="muted">
              Chưa có câu hỏi trong CSDL — hãy bấm Thêm câu mới.
            </Text>
          ) : null}
        </aside>

        <Card as="section" className="p-5 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl">
          {!selected ? (
            <Text tone="muted">Chọn hoặc thêm câu hỏi để cấu hình</Text>
          ) : (
            <Form onSubmit={handleSave} noValidate className="space-y-4">
              <FormField id="q-content" label="Nội dung câu hỏi trắc nghiệm" required>
                <Textarea
                  id="q-content"
                  rows={3}
                  value={selected.content}
                  onChange={(e) => patchDraft({ content: e.target.value })}
                />
              </FormField>

              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Meta grid] */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField id="q-topic" label="Chủ đề kiến thức">
                  <Input
                    id="q-topic"
                    value={selected.topic}
                    onChange={(e) => patchDraft({ topic: e.target.value })}
                  />
                </FormField>
                <FormField id="q-diff" label="Độ khó (EASY / MEDIUM / HARD)">
                  <Input
                    id="q-diff"
                    value={selected.difficulty}
                    onChange={(e) => patchDraft({ difficulty: e.target.value as DifficultyLevel })}
                  />
                </FormField>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium mb-1">Phương án lựa chọn</legend>
                {selected.options.map((opt, oi) => (
                  /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Option editor row] */
                  <div key={opt.id ?? oi} className="flex gap-2 items-start">
                    <Badge tone="neutral" size="sm" className="mt-2">
                      {String.fromCharCode(65 + oi)}
                    </Badge>
                    <Input
                      aria-label={`Đáp án ${String.fromCharCode(65 + oi)}`}
                      value={opt.content}
                      className="flex-1"
                      onChange={(e) => {
                        const options = selected.options.map((o, j) =>
                          j === oi ? { ...o, content: e.target.value } : o
                        )
                        patchDraft({ options })
                      }}
                    />
                    <Checkbox
                      label="Đáp án đúng"
                      checked={opt.isCorrect}
                      onCheckedChange={(checked) => {
                        const options = selected.options.map((o, j) => ({
                          ...o,
                          isCorrect: j === oi ? Boolean(checked) : false,
                        }))
                        patchDraft({ options })
                      }}
                    />
                  </div>
                ))}
              </fieldset>

              <footer className="flex flex-wrap gap-2 pt-2">
                <SubmitButton loading={saving}>Lưu câu hỏi vào CSDL</SubmitButton>
                {selected.id ? (
                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => setDeleteId(selected.id!)}
                  >
                    Xóa câu hỏi
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
        title="Xóa câu hỏi khỏi cơ sở dữ liệu?"
        description="Thao tác này sẽ xóa vĩnh viễn câu hỏi khỏi ngân hàng đề thi."
        variant="danger"
        onConfirm={async () => {
          if (!deleteId) return
          try {
            await deleteQuestionMutation.mutateAsync(deleteId)
            toast.success('Đã xóa câu hỏi khỏi cơ sở dữ liệu')
            setDeleteId(null)
            setDraft(null)
            setSelectedId(null)
          } catch {
            toast.error('Không thể xóa câu hỏi')
          }
        }}
      />
    </div>
  )
}
