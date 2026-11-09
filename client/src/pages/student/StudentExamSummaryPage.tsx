import { useSearchParams, useParams } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useRoomDetailQuery, useAttemptResultQuery } from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDateTime } from '@/utils/date'
import { MOCK_ROOMS } from '@/mocks/teacher-workflow.fixtures'

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <p className="m-0 grid grid-cols-1 gap-1 border-b border-line-subtle px-3 py-3 text-sm odd:bg-surface-sunken sm:grid-cols-[220px_1fr] sm:gap-4">
      <span className="font-medium text-fg-secondary">{label}</span>
      <span className="text-fg-primary">{value}</span>
    </p>
  )
}

export default function StudentExamSummaryPage() {
  const { roomId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const storeAttemptId = useExamStore((s) => s.activeAttemptId)
  const answers = useExamStore((s) => s.answers)
  const attemptId = searchParams.get('attemptId') || storeAttemptId
  const user = useAuthStore((s) => s.user)

  const { data: room } = useRoomDetailQuery(roomId)
  const numericAttempt =
    attemptId && attemptId !== 'mock-attempt' && Number(attemptId) > 0 ? attemptId : undefined
  const { data: result, isLoading } = useAttemptResultQuery(numericAttempt)
  const mockRoom = MOCK_ROOMS.find((r) => r.id === roomId)

  const answeredCount = Object.keys(answers).length
  const totalMock = 4
  const correctMock = Math.max(0, answeredCount - 1)

  const title = room?.name ?? mockRoom?.name ?? 'Bài thi'
  const reportAt = formatDateTime(new Date())

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-2xl font-bold">
            Số liệu bài làm
          </Heading>
          <Button type="button" variant="ghost" size="sm" leftIcon={<Bookmark size={14} />} className="mt-1 px-0">
            Đánh dấu trang này
          </Button>
        </div>
        <ButtonLink to="/student/dashboard" variant="primary" size="sm">
          Báo cáo
        </ButtonLink>
      </header>

      <Card as="section" className="overflow-hidden border border-line-subtle bg-surface-card p-0 shadow-none">
        <Heading level={2} className="border-b border-line-subtle bg-surface-sunken px-3 py-2 text-sm font-bold text-action-primary">
          Thông tin
        </Heading>
        <InfoRow label="Họ tên" value={user?.fullName ?? '—'} />
        <InfoRow label="Tên tài khoản" value={user?.studentId ?? user?.email ?? '—'} />
        <InfoRow label="Email" value={user?.email ?? '—'} />
        <InfoRow label="Bài thi" value={title} />
      </Card>

      <Card as="section" className="overflow-hidden border border-line-subtle bg-surface-card p-0 shadow-none">
        <Heading level={2} className="border-b border-line-subtle bg-surface-sunken px-3 py-2 text-sm font-bold text-action-primary">
          Các câu chấm điểm tự động
        </Heading>
        {isLoading && attemptId && attemptId !== 'mock-attempt' ? (
          <Text size="sm" tone="muted" className="block p-3">
            Đang tải kết quả…
          </Text>
        ) : (
          <>
            <InfoRow label="Tổng số câu hỏi" value={String(result?.totalQuestions ?? totalMock)} />
            <InfoRow label="Tổng số câu đã trả lời" value={String(result ? result.correctCount + result.wrongCount : answeredCount)} />
            <InfoRow label="Tổng số câu trả lời đúng" value={String(result?.correctCount ?? correctMock)} />
          </>
        )}
      </Card>

      <Card as="section" className="overflow-hidden border border-line-subtle bg-surface-card p-0 shadow-none">
        <Heading level={2} className="border-b border-line-subtle bg-surface-sunken px-3 py-2 text-sm font-bold text-action-primary">
          Ngày giờ báo cáo
        </Heading>
        <InfoRow label="Thời điểm" value={reportAt} />
      </Card>

      <footer className="flex flex-wrap gap-3">
        <ButtonLink to={`/student/rooms/${roomId}/review?attemptId=${attemptId ?? ''}`} variant="primary" size="md">
          Xem lại đáp án
        </ButtonLink>
        <ButtonLink to="/student/dashboard" variant="outline" size="md">
          Về khóa học của tôi
        </ButtonLink>
      </footer>
    </div>
  )
}
