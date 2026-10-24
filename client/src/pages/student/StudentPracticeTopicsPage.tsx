import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Select, Input } from '@/components/ui/forms'
import { ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { useMockExamStore } from '@/stores/mockExamStore'
import { PRACTICE_TOPICS, type Difficulty } from '@/services/mockData'
import { toast } from '@/lib/toast'

const DIFFS: Array<{ value: Difficulty | 'MIXED'; label: string }> = [
  { value: 'MIXED', label: 'Hỗn hợp' },
  { value: 'EASY', label: 'Dễ' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
]

export default function StudentPracticeTopicsPage() {
  const user = useAuthStore((s) => s.user)
  const startPractice = useMockExamStore((s) => s.startPractice)
  const navigate = useNavigate()
  const [topic, setTopic] = useState<string>(PRACTICE_TOPICS[0])
  const [difficulty, setDifficulty] = useState<Difficulty | 'MIXED'>('MIXED')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  function handleStart() {
    const next: Record<string, string> = {}
    if (!topic) next.topic = 'Chọn chủ đề'
    if (count < 1 || count > 20) next.count = 'Số câu từ 1–20'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    if (!user) return
    setLoading(true)
    try {
      startPractice({ userId: user.userId, topic, difficulty, count })
      try {
        sessionStorage.setItem('mooc-practice-meta', JSON.stringify({ topic, difficulty }))
      } catch {
        /* ignore quota / private mode */
      }
      toast.success('Bắt đầu luyện tập')
      navigate('/student/practice/exam')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6 max-w-xl mx-auto">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Luyện tập theo chủ đề
        </Heading>
        <Text size="sm" tone="muted">
          Chọn chủ đề, độ khó và số câu — không ảnh hưởng điểm phòng thi chính thức
        </Text>
      </header>

      <Card as="section" className="p-6 bg-surface border-line-subtle shadow-card rounded-2xl">
        <Form onSubmit={handleStart} noValidate className="space-y-4">
          <FormField id="prac-topic" label="Chủ đề" error={errors.topic} required>
            <Select
              id="prac-topic"
              value={topic}
              onValueChange={(v) => {
                setTopic(v)
                setErrors((p) => ({ ...p, topic: undefined }))
              }}
              placeholder="Chọn chủ đề"
              options={PRACTICE_TOPICS.map((t) => ({ value: t, label: t }))}
            />
          </FormField>

          <FormField id="prac-diff" label="Độ khó" required>
            <Select
              id="prac-diff"
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as Difficulty | 'MIXED')}
              placeholder="Độ khó"
              options={DIFFS.map((d) => ({ value: d.value, label: d.label }))}
            />
          </FormField>

          <FormField id="prac-count" label="Số câu hỏi" error={errors.count} required>
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

          <footer className="flex flex-wrap gap-2 pt-2">
            <SubmitButton loading={loading} size="md">
              Bắt đầu luyện tập
            </SubmitButton>
            <ButtonLink to="/student/dashboard" variant="ghost" size="md">
              Hủy
            </ButtonLink>
          </footer>
        </Form>
      </Card>
    </div>
  )
}
