import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Badge } from '@/components/ui/data-display'
import { ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Form, FormField, Input, Textarea } from '@/components/ui/forms'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import type { Difficulty, QuestionType } from '@/mocks/teacher-workflow.fixtures'
import { toast } from '@/lib/toast'

export default function TeacherQuestionEditPage() {
  const { bankId = '', questionId = '' } = useParams()
  const navigate = useNavigate()
  const question = useMockTeacherStore((s) => s.questions.find((item) => item.id === questionId && item.bankId === bankId))
  const bank = useMockTeacherStore((s) => s.banks.find((item) => item.id === bankId))
  const updateQuestion = useMockTeacherStore((s) => s.updateQuestion)

  const [type, setType] = useState<QuestionType>(question?.type ?? 'SINGLE')
  const [content, setContent] = useState(question?.content ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty>(question?.difficulty ?? 'EASY')
  const [topic, setTopic] = useState(question?.topic ?? '')
  const [options, setOptions] = useState(
    question?.options.map((option) => ({ content: option.content, isCorrect: option.isCorrect })) ?? [
      { content: '', isCorrect: true },
    ]
  )
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  if (!bank || !question) return <Text tone="muted">Không tìm thấy câu hỏi.</Text>

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const next: Record<string, string | undefined> = {}
    if (!content.trim()) next.content = 'Nhập nội dung câu hỏi'
    if (!topic.trim()) next.topic = 'Nhập chủ đề'
    if (type !== 'FILL' && options.every((option) => !option.content.trim())) next.options = 'Nhập ít nhất một đáp án'
    if (type !== 'FILL' && options.every((option) => !option.isCorrect)) next.options = 'Chọn ít nhất một đáp án đúng'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    updateQuestion(questionId, {
      type,
      content: content.trim(),
      difficulty,
      topic: topic.trim(),
      options:
        type === 'FILL'
          ? [{ content: options[0]?.content.trim() || '', isCorrect: true }]
          : options.filter((option) => option.content.trim()),
    })
    toast.success('Đã cập nhật câu hỏi')
    navigate(`/teacher/question-banks/${bankId}`)
  }

  const visibleOptions = type === 'FILL' ? options.slice(0, 1) : options

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-2">
        <Heading level={1} className="text-lg font-bold">
          Chi tiết câu hỏi
        </Heading>
        <Badge tone="info" size="sm">
          {question.type}
        </Badge>
        <Badge tone="neutral" size="sm">
          {question.difficulty}
        </Badge>
      </header>
      <Text size="sm" tone="muted">
        {bank.name} · sửa nội dung câu hỏi và đáp án rồi lưu.
      </Text>

      <Card as="section" className="border border-line-subtle bg-surface-card p-4 shadow-none">
        <Form onSubmit={handleSubmit} noValidate className="space-y-3">
          <FormField id="q-content" label="Nội dung câu hỏi" error={errors.content} required>
            <Textarea
              id="q-content"
              value={content}
              rows={3}
              onChange={(event) => {
                setContent(event.target.value)
                setErrors((prev) => ({ ...prev, content: undefined }))
              }}
            />
          </FormField>
          <FormField id="q-type" label="Loại câu hỏi" required>
            <select
              id="q-type"
              className="min-h-11 w-full rounded-lg border border-line-subtle bg-surface-card px-3"
              value={type}
              onChange={(event) => setType(event.target.value as QuestionType)}
            >
              <option value="SINGLE">Trắc nghiệm 1 đáp án</option>
              <option value="MULTI">Nhiều đáp án</option>
              <option value="FILL">Điền khuyết</option>
            </select>
          </FormField>
          <FormField id="q-diff" label="Độ khó" required>
            <select
              id="q-diff"
              className="min-h-11 w-full rounded-lg border border-line-subtle bg-surface-card px-3"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty)}
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
              onChange={(event) => {
                setTopic(event.target.value)
                setErrors((prev) => ({ ...prev, topic: undefined }))
              }}
            />
          </FormField>

          <fieldset className="space-y-2 rounded-lg border border-line-subtle p-3">
            <legend className="px-1 text-sm font-medium">{type === 'FILL' ? 'Đáp án đúng' : 'Các đáp án'}</legend>
            {errors.options ? <Text size="xs" className="text-status-danger-fg">{errors.options}</Text> : null}
            {visibleOptions.map((option, index) => (
              /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Answer row] */
              <div key={`answer-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  aria-label={type === 'FILL' ? 'Đáp án đúng' : `Đáp án ${String.fromCodePoint(65 + index)}`}
                  value={option.content}
                  onChange={(event) => {
                    const next = [...options]
                    next[index] = { ...next[index], content: event.target.value }
                    setOptions(next)
                    setErrors((prev) => ({ ...prev, options: undefined }))
                  }}
                />
                {type === 'FILL' ? null : (
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type={type === 'MULTI' ? 'checkbox' : 'radio'}
                      name="correct-answer"
                      checked={option.isCorrect}
                      onChange={() => {
                        if (type === 'SINGLE') {
                          setOptions(options.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === index })))
                          return
                        }
                        const next = [...options]
                        next[index] = { ...next[index], isCorrect: !next[index].isCorrect }
                        setOptions(next)
                      }}
                    />
                    Đúng
                  </label>
                )}
              </div>
            ))}
          </fieldset>

          <footer className="flex flex-wrap gap-2">
            <SubmitButton>Lưu chỉnh sửa</SubmitButton>
            <ButtonLink to={`/teacher/question-banks/${bankId}`} variant="outline" size="md">
              Quay lại ngân hàng
            </ButtonLink>
          </footer>
        </Form>
      </Card>
    </div>
  )
}
