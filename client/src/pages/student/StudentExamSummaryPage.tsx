import { useSearchParams, useParams } from 'react-router-dom'
import { Trophy, CheckCircle2, XCircle } from 'lucide-react'
import { Card, StatCard } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useRoomDetailQuery, useAttemptResultQuery } from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'

export default function StudentExamSummaryPage() {
  const { roomId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const storeAttemptId = useExamStore((s) => s.activeAttemptId)
  const attemptId = searchParams.get('attemptId') || storeAttemptId

  const { data: room } = useRoomDetailQuery(roomId)
  const { data: result, isLoading } = useAttemptResultQuery(attemptId)

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Kết quả chấm thi trực tuyến
        </Heading>
        <Text size="sm" tone="muted">
          {room?.name ?? 'Phòng thi'} · {room?.roomCode ?? roomId}
        </Text>
      </header>

      {isLoading ? (
        <Card as="section" className="p-8 text-center bg-surface border-line-subtle rounded-2xl">
          <Text tone="muted">Đang chấm điểm và tổng hợp kết quả thi...</Text>
        </Card>
      ) : result ? (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Điểm của bạn">
          <StatCard
            label="Điểm số (Thang 10)"
            value={result.score10.toFixed(1)}
            icon={<Trophy size={20} />}
            hint={`Tỉ lệ đúng: ${result.correctPercent.toFixed(1)}%`}
          />
          <StatCard
            label="Số câu trả lời đúng"
            value={String(result.correctCount)}
            icon={<CheckCircle2 size={20} />}
            hint={`/${result.totalQuestions} câu hỏi`}
          />
          <StatCard
            label="Câu sai / Chưa làm"
            value={`${result.wrongCount} / ${result.unansweredCount}`}
            icon={<XCircle size={20} />}
            hint={`Chế độ: ${result.mode}`}
          />
        </section>
      ) : (
        <Card as="section" className="p-5 bg-surface border-line-subtle rounded-2xl text-center space-y-3">
          <Text size="sm" tone="muted">
            Bài thi đã được ghi nhận vào hệ thống.
          </Text>
        </Card>
      )}

      <footer className="flex flex-wrap gap-3">
        <ButtonLink to={`/student/rooms/${roomId}/review?attemptId=${attemptId ?? ''}`} variant="primary" size="md">
          Xem lại đáp án chi tiết
        </ButtonLink>
        <ButtonLink to="/student/dashboard" variant="outline" size="md">
          Về bảng điều khiển
        </ButtonLink>
      </footer>
    </div>
  )
}
