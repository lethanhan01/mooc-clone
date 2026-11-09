import { useSearchParams } from 'react-router-dom'
import { Card, StatCard, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAttemptResultQuery } from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'
import { formatDateTime } from '@/utils/date'
import { Trophy, CheckCircle2, XCircle } from 'lucide-react'

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <p className="m-0 grid grid-cols-1 gap-1 border-b border-line-subtle px-3 py-3 text-sm odd:bg-surface-sunken sm:grid-cols-[220px_1fr] sm:gap-4">
      <span className="font-medium text-fg-secondary">{label}</span>
      <span className="text-fg-primary">{value}</span>
    </p>
  )
}

export default function StudentPracticeResultPage() {
  const [searchParams] = useSearchParams()
  const storeAttemptId = useExamStore((s) => s.activeAttemptId)
  const answers = useExamStore((s) => s.answers)
  const attemptId = searchParams.get('attemptId') || storeAttemptId

  const isMock = !attemptId || attemptId === '-1' || Number(attemptId) < 0
  const { data: result, isLoading } = useAttemptResultQuery(isMock ? undefined : attemptId)

  const answeredCount = Object.keys(answers).length
  const totalMock = Math.max(answeredCount, 5)
  const correctMock = Math.max(0, answeredCount - 1)
  const scoreMock = totalMock > 0 ? (correctMock / totalMock) * 10 : 0

  if (!isMock && isLoading) {
    return (
      <Card as="section" className="space-y-3 rounded-2xl border-line-subtle bg-surface-card p-8 text-center shadow-none">
        <Text tone="muted">Đang chấm điểm và tổng hợp kết quả luyện tập...</Text>
      </Card>
    )
  }

  if (!isMock && !result) {
    return (
      <Card as="section" className="space-y-3 rounded-2xl border-line-subtle bg-surface-card p-8 text-center shadow-none">
        <Text tone="muted">Chưa có kết quả lượt luyện tập</Text>
        <ButtonLink to="/student/practice" variant="primary">
          Bắt đầu luyện tập
        </ButtonLink>
      </Card>
    )
  }

  const totalQuestions = result?.totalQuestions ?? totalMock
  const correctCount = result?.correctCount ?? correctMock
  const wrongCount = result?.wrongCount ?? Math.max(0, answeredCount - correctMock)
  const unansweredCount = result?.unansweredCount ?? Math.max(0, totalQuestions - answeredCount)
  const score10 = result?.score10 ?? scoreMock
  const correctPercent = result?.correctPercent ?? (totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0)

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <Badge tone="info" size="sm">
          Luyện tập
        </Badge>
        <Heading level={1} className="text-2xl font-extrabold">
          Số liệu bài làm
        </Heading>
        <Text size="sm" tone="muted">
          {isMock ? 'Kết quả mock local' : `Lượt #${result?.attemptId}`} · {formatDateTime(new Date())}
        </Text>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Tóm tắt điểm">
        <StatCard label="Điểm số" value={score10.toFixed(1)} icon={<Trophy size={20} />} hint="/ 10" />
        <StatCard
          label="Số câu đúng"
          value={`${correctCount}/${totalQuestions}`}
          icon={<CheckCircle2 size={20} />}
          hint={`Đạt ${correctPercent.toFixed(1)}%`}
        />
        <StatCard
          label="Sai / Chưa trả lời"
          value={`${wrongCount} / ${unansweredCount}`}
          icon={<XCircle size={20} />}
        />
      </section>

      <Card as="section" className="overflow-hidden border border-line-subtle bg-surface-card p-0 shadow-none">
        <Heading level={2} className="border-b border-line-subtle bg-surface-sunken px-3 py-2 text-sm font-bold text-action-primary">
          Các câu chấm điểm tự động
        </Heading>
        <InfoRow label="Tổng số câu hỏi" value={String(totalQuestions)} />
        <InfoRow label="Tổng số câu đã trả lời" value={String(answeredCount || correctCount + wrongCount)} />
        <InfoRow label="Tổng số câu trả lời đúng" value={String(correctCount)} />
      </Card>

      <footer className="flex flex-wrap gap-2">
        <ButtonLink to="/student/practice" variant="primary">
          Luyện tập chủ đề tiếp theo
        </ButtonLink>
        <ButtonLink to="/student/dashboard" variant="outline">
          Về khóa học của tôi
        </ButtonLink>
      </footer>
    </div>
  )
}
