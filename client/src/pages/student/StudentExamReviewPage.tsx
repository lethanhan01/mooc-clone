import { useParams } from 'react-router-dom'
import { Card, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { useMockExamStore } from '@/stores/mockExamStore'

export default function StudentExamReviewPage() {
  const { roomId = '' } = useParams()
  const user = useAuthStore((s) => s.user)
  const room = useMockExamStore((s) => s.rooms.find((r) => r.id === roomId))
  const questions = useMockExamStore((s) => s.questionsByRoom[roomId] ?? [])
  const submission = useMockExamStore((s) =>
    s.submissions.find((x) => x.roomId === roomId && x.userId === user?.userId) ??
      s.submissions.find((x) => x.roomId === roomId)
  )

  if (!room || !submission) {
    return (
      <Card as="section" className="p-8 text-center bg-surface border-line-subtle rounded-2xl space-y-3">
        <Text tone="muted">Chưa có bài nộp để xem lại</Text>
        <ButtonLink to={`/student/rooms/${roomId}/summary`} variant="outline">
          Về trang kết quả
        </ButtonLink>
      </Card>
    )
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl font-extrabold">
          Xem lại bài làm
        </Heading>
        <Text size="sm" tone="muted">
          {room.name} · Điểm {submission.score}/10 · {submission.correctCount}/{submission.totalQuestions} đúng
        </Text>
      </header>

      <ol className="space-y-4 list-none p-0 m-0">
        {questions.map((q, i) => {
          const selectedId = submission.answers[q.id]
          const correctOpt = q.options.find((o) => o.isCorrect)
          const selectedOpt = q.options.find((o) => o.id === selectedId)
          const isCorrect = Boolean(selectedOpt?.isCorrect)
          const unanswered = !selectedId

          return (
            <li key={q.id}>
              <Card
                as="article"
                className={`p-5 border shadow-card rounded-2xl space-y-3 ${
                  unanswered
                    ? 'border-line-subtle bg-surface'
                    : isCorrect
                      ? 'border-status-success-fg/40 bg-status-success-bg/30'
                      : 'border-status-danger-fg/40 bg-status-danger-bg/30'
                }`}
              >
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <Heading level={2} className="text-sm font-semibold leading-relaxed">
                    Câu {i + 1}. {q.content}
                  </Heading>
                  <Badge tone={unanswered ? 'neutral' : isCorrect ? 'success' : 'danger'} size="sm">
                    {unanswered ? 'Bỏ trống' : isCorrect ? 'Đúng' : 'Sai'}
                  </Badge>
                </header>
                <ul className="space-y-1.5 list-none p-0 m-0">
                  {q.options.map((opt) => {
                    const isSel = opt.id === selectedId
                    const isAns = opt.isCorrect
                    return (
                      <li
                        key={opt.id}
                        className={`rounded-xl px-3 py-2 text-sm border ${
                          isAns
                            ? 'border-status-success-fg/50 bg-status-success-bg/50 font-medium'
                            : isSel
                              ? 'border-status-danger-fg/50 bg-status-danger-bg/40'
                              : 'border-transparent text-text-secondary'
                        }`}
                      >
                        <strong>{opt.label}.</strong> {opt.text}
                        {isAns ? ' ✓' : null}
                        {isSel && !isAns ? ' (đã chọn)' : null}
                      </li>
                    )
                  })}
                </ul>
                {q.explanation ? (
                  <p className="text-sm text-text-muted border-t border-line-subtle pt-3">
                    <strong className="text-text-secondary">Giải thích:</strong> {q.explanation}
                  </p>
                ) : null}
                {!unanswered && !isCorrect && correctOpt ? (
                  <p className="text-xs text-text-muted">
                    Đáp án đúng: {correctOpt.label}. {correctOpt.text}
                  </p>
                ) : null}
              </Card>
            </li>
          )
        })}
      </ol>

      <footer className="flex flex-wrap gap-2">
        <ButtonLink to={`/student/rooms/${roomId}/summary`} variant="outline">
          Về kết quả
        </ButtonLink>
        <ButtonLink to="/student/rooms" variant="ghost">
          Danh sách phòng
        </ButtonLink>
      </footer>
    </div>
  )
}
