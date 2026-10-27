import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Select, Input } from '@/components/ui/forms'
import { ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useQuestionsListQuery, useStartAttemptMutation } from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'
import { toast } from '@/lib/toast'

const DEFAULT_PRACTICE_TOPICS = [
  'Mạng máy tính',
  'Cơ sở dữ liệu',
  'Kiến trúc máy tính',
  'Lập trình Web',
  'An toàn thông tin',
]

const DIFFS = [
  { value: 'MIXED', label: 'Hỗn hợp' },
  { value: 'EASY', label: 'Dễ (EASY)' },
  { value: 'MEDIUM', label: 'Trung bình (MEDIUM)' },
  { value: 'HARD', label: 'Khó (HARD)' },
]

export default function StudentPracticeTopicsPage() {
  const { data: allQuestions = [] } = useQuestionsListQuery()
  const startAttemptMutation = useStartAttemptMutation()
  const startSession = useExamStore((s) => s.startSession)
  const navigate = useNavigate()

  // Distinct topics from actual database questions
  const availableTopics = useMemo(() => {
    const fromDb = Array.from(new Set(allQuestions.map((q) => q.topic).filter(Boolean)))
    return fromDb.length > 0 ? fromDb : DEFAULT_PRACTICE_TOPICS
  }, [allQuestions])

  const [topic, setTopic] = useState<string>(availableTopics[0] || 'Mạng máy tính')
  const [difficulty, setDifficulty] = useState<string>('MIXED')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  async function handleStart() {
    const next: Record<string, string> = {}
    if (!topic) next.topic = 'Vui lòng chọn chủ đề luyện tập'
    if (count < 1 || count > 20) next.count = 'Số câu hỏi từ 1 đến 20'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    setLoading(true)
    try {
      const attempt = await startAttemptMutation.mutateAsync({
        mode: 'PRACTICE',
      })
      startSession({
        attemptId: attempt.attemptId,
        roomCode: null,
        durationSeconds: count * 120, // 2 minutes per question
      })
      sessionStorage.setItem('mooc-practice-meta', JSON.stringify({ topic, difficulty, count }))
      toast.success('Bắt đầu phiên luyện tập')
      navigate('/student/practice/exam')
    } catch {
      toast.error('Không thể khởi tạo phiên luyện tập')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6 max-w-xl mx-auto">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Luyện tập theo chủ đề (Database Sync)
        </Heading>
        <Text size="sm" tone="muted">
          Chọn chủ đề, độ khó và số câu hỏi trực tiếp từ ngân hàng câu hỏi
        </Text>
      </header>

      <Card as="section" className="p-6 bg-surface border-line-subtle shadow-card rounded-2xl">
        <Form onSubmit={handleStart} noValidate className="space-y-4">
          <FormField id="prac-topic" label="Chủ đề kiến thức" error={errors.topic} required>
            <Select
              id="prac-topic"
              value={topic}
              onValueChange={(v) => {
                setTopic(v)
                setErrors((p) => ({ ...p, topic: undefined }))
              }}
              placeholder="Chọn chủ đề"
              options={availableTopics.map((t) => ({ value: t, label: t }))}
            />
          </FormField>

          <FormField id="prac-diff" label="Mức độ khó" required>
            <Select
              id="prac-diff"
              value={difficulty}
              onValueChange={(v) => setDifficulty(v)}
              placeholder="Độ khó"
              options={DIFFS.map((d) => ({ value: d.value, label: d.label }))}
            />
          </FormField>

          <FormField id="prac-count" label="Số lượng câu hỏi (1 - 20)" error={errors.count} required>
            <Input
              id="prac-count"
              type="number"
              min={1}
              max={20}
              value={String(count)}
              onChange={(e) => {
                setCount(Number(e.target.value) || 0)
                setErrors((p) => ({ ...p, count: undefined }))
              }}
            />
          </FormField>

          <footer className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-2">
            <ButtonLink to="/student/dashboard" variant="outline">
              Quay lại
            </ButtonLink>
            <SubmitButton loading={loading} variant="primary">
              Bắt đầu luyện tập »
            </SubmitButton>
          </footer>
        </Form>
      </Card>
    </div>
  )
}
