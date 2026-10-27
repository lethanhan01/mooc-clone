import { useSearchParams, useParams } from 'react-router-dom'
import { Card, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useRoomDetailQuery, useAttemptResultQuery, useQuestionsListQuery } from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'

export default function StudentExamReviewPage() {
  const { roomId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const storeAttemptId = useExamStore((s) => s.activeAttemptId)
  const attemptId = searchParams.get('attemptId') || storeAttemptId

  const { data: room } = useRoomDetailQuery(roomId)
  const { data: result, isLoading: isResultLoading } = useAttemptResultQuery(attemptId)
  const { data: allQuestions = [], isLoading: isQuestionsLoading } = useQuestionsListQuery()

  if (isResultLoading || isQuestionsLoading) {
    return (
      <Card as="section" className="p-8 text-center bg-surface border-line-subtle rounded-2xl">
        <Text tone="muted">Đang tải chi tiết bài làm...</Text>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card as="section" className="p-8 text-center bg-surface border-line-subtle rounded-2xl space-y-3">
        <Text tone="muted">Chưa có kết quả bài nộp để xem lại</Text>
        <ButtonLink to={`/student/rooms/${roomId}/summary`} variant="outline">
          Về trang kết quả
        </ButtonLink>
      </Card>
    )
  }

  // Map answers by questionId
  const answersMap = new Map<number, number | null>()
  result.answers.forEach((ans) => {
    answersMap.set(ans.questionId, ans.selectedOptionId ?? null)
  })

  // Filter questions that were part of this attempt or room
  const questions = allQuestions.filter(
    (q) => answersMap.has(q.id) || (room?.topic && q.topic.toLowerCase().includes(room.topic.toLowerCase()))
  )

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Xem lại bài làm chi tiết
        </Heading>
        <Text size="sm" tone="muted">
          {room?.name ?? 'Phòng thi'} · Điểm {result.score10.toFixed(1)}/10 · {result.correctCount}/{result.totalQuestions} đúng
        </Text>
      </header>

      <ol className="space-y-4 list-none p-0 m-0">
        {questions.map((q, i) => {
          const selectedOptionId = answersMap.get(q.id)
          const selectedOpt = q.options.find((o) => o.id === selectedOptionId)
          const correctOpt = q.options.find((o) => o.isCorrect)
          const isCorrect = Boolean(selectedOpt?.isCorrect)
          const unanswered = !selectedOptionId

          let cardBorderBg = 'border-line-subtle bg-surface'
          let badgeTone: 'neutral' | 'accent' | 'danger' = 'neutral'
          let badgeText = 'Bỏ trống'

          if (!unanswered) {
            if (isCorrect) {
              cardBorderBg = 'border-status-success-fg/40 bg-status-success-bg/30'
              badgeTone = 'accent'
              badgeText = 'Đúng'
            } else {
              cardBorderBg = 'border-status-danger-fg/40 bg-status-danger-bg/30'
              badgeTone = 'danger'
              badgeText = 'Sai'
            }
          }

          return (
            <li key={q.id}>
              <Card
                as="article"
                className={`p-5 border shadow-card rounded-2xl space-y-3 ${cardBorderBg}`}
              >
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <Heading level={2} className="text-sm font-semibold leading-relaxed">
                    Câu {i + 1}. {q.content}
                  </Heading>
                  <Badge tone={badgeTone} size="sm">
                    {badgeText}
                  </Badge>
                </header>

                <ul className="space-y-1.5 list-none p-0 m-0">
                  {q.options.map((opt, oi) => {
                    const isSel = opt.id === selectedOptionId
                    const isAns = Boolean(opt.isCorrect)
                    let optionClass = 'border-transparent text-text-secondary'
                    if (isAns) {
                      optionClass = 'border-status-success-fg/50 bg-status-success-bg/50 font-medium'
                    } else if (isSel) {
                      optionClass = 'border-status-danger-fg/50 bg-status-danger-bg/40'
                    }
                    return (
                      <li
                        key={opt.id}
                        className={`rounded-xl px-3 py-2 text-sm border ${optionClass}`}
                      >
                        <strong>{String.fromCodePoint(65 + oi)}.</strong> {opt.content}
                        {isAns ? ' ✓ (Đáp án đúng)' : null}
                        {isSel && !isAns ? ' (Lựa chọn của bạn)' : null}
                      </li>
                    )
                  })}
                </ul>

                {!unanswered && !isCorrect && correctOpt ? (
                  <p className="text-xs text-text-muted">
                    Đáp án chính xác: {correctOpt.content}
                  </p>
                ) : null}
              </Card>
            </li>
          )
        })}
      </ol>

      <footer className="flex flex-wrap gap-2">
        <ButtonLink to={`/student/rooms/${roomId}/summary?attemptId=${attemptId ?? ''}`} variant="outline">
          Về trang kết quả
        </ButtonLink>
        <ButtonLink to="/student/rooms" variant="ghost">
          Danh sách phòng
        </ButtonLink>
      </footer>
    </div>
  )
}
