import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Form, FormField, Input, Textarea } from '@/components/ui/forms'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import type { Difficulty, QuestionType } from '@/mocks/teacher-workflow.fixtures'
import { toast } from '@/lib/toast'

export default function TeacherQuestionFormPage() {
  const { bankId = '' } = useParams()
  const navigate = useNavigate()
  const addQuestion = useMockTeacherStore((s) => s.addQuestion)
  const bank = useMockTeacherStore((s) => s.banks.find((b) => b.id === bankId))

  const [type, setType] = useState<QuestionType>('SINGLE')
  const [content, setContent] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY')
  const [topic, setTopic] = useState('')
  const [options, setOptions] = useState([
    { content: '', isCorrect: true },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
  ])
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  if (!bank) return <Text tone="muted">Không tìm thấy bộ câu hỏi.</Text>

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string | undefined> = {}
    if (!content.trim()) next.content = 'Nhập nội dung câu hỏi'
    if (!topic.trim()) next.topic = 'Nhập chủ đề'
    if (type !== 'FILL' && options.every((o) => !o.content.trim())) next.options = 'Nhập ít nhất một lựa chọn'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    addQuestion({
      bankId,
      type,
      content: content.trim(),
      difficulty,
      topic: topic.trim(),
      options:
        type === 'FILL'
          ? [{ content: options[0]?.content || '', isCorrect: true }]
          : options.filter((o) => o.content.trim()),
    })
    toast.success('Đã thêm câu hỏi (mock)')
    navigate(`/teacher/question-banks/${bankId}`)
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header>
        <Heading level={1} className="text-lg font-bold">
          Thêm câu hỏi
        </Heading>
        <Text size="sm" tone="muted">
          Bộ {bank.name}
        </Text>
      </header>

      <Card as="section" className="border border-line-subtle bg-surface-card p-4 shadow-none">
        <Form onSubmit={handleSubmit} noValidate className="space-y-3">
          <FormField id="q-type" label="Loại câu hỏi" required>
            <select
              id="q-type"
              className="min-h-11 w-full rounded-lg border border-line-subtle bg-surface-card px-3"
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
            >
              <option value="SINGLE">Trắc nghiệm 1 đáp án</option>
              <option value="MULTI">Nhiều đáp án</option>
              <option value="FILL">Điền khuyết</option>
            </select>
          </FormField>
          <FormField id="q-content" label="Nội dung câu hỏi" error={errors.content} required>
            <Textarea
              id="q-content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setErrors((p) => ({ ...p, content: undefined }))
              }}
              rows={3}
            />
          </FormField>
          <FormField id="q-diff" label="Độ khó" required>
            <select
              id="q-diff"
              className="min-h-11 w-full rounded-lg border border-line-subtle bg-surface-card px-3"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
          </FormField>
          <FormField id="q-topic" label="Chủ đề" error={errors.topic} required>
            <Input
              id="q-topic"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value)
                setErrors((p) => ({ ...p, topic: undefined }))
              }}
            />
          </FormField>

          <fieldset className="space-y-2 rounded-lg border border-line-subtle p-3">
            <legend className="px-1 text-sm font-medium">{type === 'FILL' ? 'Đáp án điền' : 'Các lựa chọn'}</legend>
            {errors.options ? <Text size="xs" className="text-status-danger-fg">{errors.options}</Text> : null}
            {(type === 'FILL' ? options.slice(0, 1) : options).map((opt, index) => (
              /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Option row] */
              <div key={`opt-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  aria-label={`Lựa chọn ${index + 1}`}
                  value={opt.content}
                  onChange={(e) => {
                    const next = [...options]
                    next[index] = { ...next[index], content: e.target.value }
                    setOptions(next)
                    setErrors((p) => ({ ...p, options: undefined }))
                  }}
                  placeholder={type === 'FILL' ? 'Đáp án đúng' : `Đáp án ${String.fromCodePoint(65 + index)}`}
                />
                {type !== 'FILL' ? (
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type={type === 'MULTI' ? 'checkbox' : 'radio'}
                      name="correct-option"
                      checked={opt.isCorrect}
                      onChange={() => {
                        if (type === 'SINGLE') {
                          setOptions(options.map((o, i) => ({ ...o, isCorrect: i === index })))
                        } else {
                          const next = [...options]
                          next[index] = { ...next[index], isCorrect: !next[index].isCorrect }
                          setOptions(next)
                        }
                      }}
                    />
                    Đúng
                  </label>
                ) : null}
              </div>
            ))}
          </fieldset>

          <footer className="flex flex-wrap gap-2">
            <SubmitButton>Lưu câu hỏi</SubmitButton>
            <ButtonLink to={`/teacher/question-banks/${bankId}`} variant="outline" size="md">
              Hủy
            </ButtonLink>
          </footer>
        </Form>
      </Card>
    </div>
  )
}
