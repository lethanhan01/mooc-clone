import { Card, Badge, StatCard } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockExamStore } from '@/stores/mockExamStore'
import { SEED_QUESTION_BANK } from '@/services/mockData'
import { Trophy, CheckCircle2 } from 'lucide-react'

/**
 * practiceHistory entries lack answers/questionIds — show score from last attempt
 * and sample explanations from the question bank filtered by topic.
 */
export default function StudentPracticeResultPage() {
  const last = useMockExamStore((s) => s.practiceHistory[0])
  const sampleQs = last
    ? SEED_QUESTION_BANK.filter((q) => last.topic === 'Tất cả' || q.topic === last.topic).slice(
        0,
        Math.min(last.totalQuestions, 5)
      )
    : []

  if (!last) {
    return (
      <Card as="section" className="p-8 text-center bg-surface border-line-subtle rounded-2xl space-y-3">
        <Text tone="muted">Chưa có kết quả luyện tập</Text>
        <ButtonLink to="/student/practice" variant="primary">
          Bắt đầu luyện tập
        </ButtonLink>
      </Card>
    )
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Kết quả luyện tập
        </Heading>
        <Text size="sm" tone="muted">
          {last.topic} · {last.difficulty} ·{' '}
          {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(
            new Date(last.submittedAt)
          )}
        </Text>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Tóm tắt điểm">
        <StatCard label="Điểm" value={String(last.score)} icon={<Trophy size={20} />} hint="/ 10" />
        <StatCard
          label="Số câu đúng"
          value={`${last.correctCount}/${last.totalQuestions}`}
          icon={<CheckCircle2 size={20} />}
        />
      </section>

      <Card as="section" className="p-5 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl space-y-4">
        <Heading level={2} className="text-lg font-bold">
          Gợi ý lời giải (ngân hàng mẫu)
        </Heading>
        <Text size="xs" tone="muted">
          Lịch sử luyện tập mock không lưu đáp án từng câu — hiển thị giải thích theo chủ đề.
        </Text>
        <ol className="space-y-3 list-none p-0 m-0">
          {sampleQs.map((q, i) => {
            const correct = q.options.find((o) => o.isCorrect)
            return (
              <li key={q.id}>
                <article className="rounded-2xl border border-status-success-fg/30 bg-status-success-bg/20 p-4 space-y-2">
                  <header className="flex flex-wrap gap-2 items-start justify-between">
                    <p className="text-sm font-medium text-text-primary">
                      {i + 1}. {q.content}
                    </p>
                    <Badge tone="success" size="sm">
                      {correct?.label}
                    </Badge>
                  </header>
                  {q.explanation ? (
                    <p className="text-sm text-text-muted">
                      <strong>Giải thích:</strong> {q.explanation}
                    </p>
                  ) : null}
                </article>
              </li>
            )
          })}
        </ol>
      </Card>

      <footer className="flex flex-wrap gap-2">
        <ButtonLink to="/student/practice" variant="primary">
          Luyện tiếp
        </ButtonLink>
        <ButtonLink to="/student/history" variant="outline">
          Lịch sử
        </ButtonLink>
      </footer>
    </div>
  )
}
