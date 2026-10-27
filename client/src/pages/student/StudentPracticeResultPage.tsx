import { useSearchParams } from 'react-router-dom'
import { Card, StatCard } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAttemptResultQuery } from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'
import { Trophy, CheckCircle2, XCircle } from 'lucide-react'

export default function StudentPracticeResultPage() {
  const [searchParams] = useSearchParams()
  const storeAttemptId = useExamStore((s) => s.activeAttemptId)
  const attemptId = searchParams.get('attemptId') || storeAttemptId

  const { data: result, isLoading } = useAttemptResultQuery(attemptId)

  if (isLoading) {
    return (
      <Card as="section" className="p-8 text-center bg-surface border-line-subtle rounded-2xl space-y-3">
        <Text tone="muted">Đang chấm điểm và tổng hợp kết quả luyện tập...</Text>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card as="section" className="p-8 text-center bg-surface border-line-subtle rounded-2xl space-y-3">
        <Text tone="muted">Chưa có kết quả lượt luyện tập</Text>
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
          Kết quả luyện tập trực tuyến
        </Heading>
        <Text size="sm" tone="muted">
          Lượt luyện tập #{result.attemptId} · Chế độ {result.mode}
        </Text>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Tóm tắt điểm">
        <StatCard label="Điểm số" value={result.score10.toFixed(1)} icon={<Trophy size={20} />} hint="/ 10" />
        <StatCard
          label="Số câu đúng"
          value={`${result.correctCount}/${result.totalQuestions}`}
          icon={<CheckCircle2 size={20} />}
          hint={`Đạt ${result.correctPercent.toFixed(1)}%`}
        />
        <StatCard
          label="Sai / Chưa trả lời"
          value={`${result.wrongCount} / ${result.unansweredCount}`}
          icon={<XCircle size={20} />}
        />
      </section>

      <Card as="section" className="p-5 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl space-y-3">
        <Heading level={2} className="text-lg font-bold">
          Chi tiết kết quả
        </Heading>
        <Text size="sm" tone="muted">
          Lượt luyện tập của bạn đã được lưu vào hệ thống cơ sở dữ liệu. Bạn có thể luyện tập tiếp chủ đề khác hoặc xem lịch sử.
        </Text>
      </Card>

      <footer className="flex flex-wrap gap-2">
        <ButtonLink to="/student/practice" variant="primary">
          Luyện tập chủ đề tiếp theo
        </ButtonLink>
        <ButtonLink to="/student/history" variant="outline">
          Lịch sử bài làm
        </ButtonLink>
      </footer>
    </div>
  )
}
