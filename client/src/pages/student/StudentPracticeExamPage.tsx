import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { ExamShell } from '@/components/exam/ExamShell'
import { QuestionNavigator, type QuestionNavStatus } from '@/components/exam/QuestionNavigator'
import {
  useQuestionsListQuery,
  useSubmitAnswerMutation,
  useSubmitExamMutation,
} from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'
import { formatDuration } from '@/lib/room-status'
import { toast } from '@/lib/toast'
import { MOCK_QUESTIONS } from '@/mocks/teacher-workflow.fixtures'

export default function StudentPracticeExamPage() {
  const navigate = useNavigate()
  const { data: allQuestions = [], isLoading } = useQuestionsListQuery()
  const submitAnswerMutation = useSubmitAnswerMutation()
  const submitExamMutation = useSubmitExamMutation()

  const activeAttemptId = useExamStore((s) => s.activeAttemptId)
  const currentIndex = useExamStore((s) => s.currentIndex)
  const answers = useExamStore((s) => s.answers)
  const flagged = useExamStore((s) => s.flaggedQuestionIds)
  const remainingSeconds = useExamStore((s) => s.remainingSeconds)
  const selectAnswerInStore = useExamStore((s) => s.selectAnswer)
  const toggleFlag = useExamStore((s) => s.toggleFlag)
  const setCurrentIndex = useExamStore((s) => s.setCurrentIndex)
  const decrementTimer = useExamStore((s) => s.decrementTimer)
  const startSession = useExamStore((s) => s.startSession)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const autoSubmitted = useRef(false)

  const meta = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('mooc-practice-meta')
      if (raw) return JSON.parse(raw) as { topic: string; difficulty: string; count: number }
    } catch {
      /* ignore */
    }
    return { topic: 'Mạng máy tính', difficulty: 'MIXED', count: 5 }
  }, [])

  const mockFallback = useMemo(
    () =>
      MOCK_QUESTIONS.slice(0, meta.count || 5).map((q, index) => ({
        id: index + 1,
        content: q.content,
        difficulty: q.difficulty,
        options: q.options.map((o, oi) => ({ id: oi + 1, content: o.content })),
      })),
    [meta.count]
  )

  const apiQuestions = useMemo(() => {
    const topicFiltered = allQuestions.filter(
      (q) => !meta.topic || q.topic.toLowerCase().includes(meta.topic.toLowerCase())
    )
    const list = topicFiltered.length > 0 ? topicFiltered : allQuestions
    return list.slice(0, meta.count || 5)
  }, [allQuestions, meta])

  const questions = apiQuestions.length > 0 ? apiQuestions : mockFallback
  const usingMock = apiQuestions.length === 0 || activeAttemptId === -1

  useEffect(() => {
    if (!activeAttemptId) {
      startSession({
        attemptId: -1,
        roomCode: 'PRACTICE',
        durationSeconds: 30 * 60,
        endsAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        serverNow: new Date().toISOString(),
      })
    }
  }, [activeAttemptId, startSession])

  useEffect(() => {
    if (!activeAttemptId) return
    const id = window.setInterval(() => decrementTimer(), 1000)
    return () => window.clearInterval(id)
  }, [activeAttemptId, decrementTimer])

  useEffect(() => {
    if (activeAttemptId && remainingSeconds === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true
      if (usingMock) {
        toast.warning('Hết thời gian luyện tập — đã nộp (mock)')
        navigate('/student/practice/result?attemptId=-1')
        return
      }
      submitExamMutation
        .mutateAsync(activeAttemptId)
        .then((res) => {
          toast.warning('Hết thời gian luyện tập — đã nộp tự động')
          navigate(`/student/practice/result?attemptId=${res.attemptId}`)
        })
        .catch(() => toast.error('Không thể nộp bài luyện tập'))
    }
  }, [remainingSeconds, activeAttemptId, submitExamMutation, navigate, usingMock])

  if (isLoading && apiQuestions.length === 0 && mockFallback.length === 0) {
    return (
      <Card as="section" className="space-y-3 rounded-2xl bg-surface-card p-8 text-center shadow-none">
        <Text tone="muted">Đang chuẩn bị câu hỏi luyện tập...</Text>
        <ButtonLink to="/student/practice" variant="outline">
          Chọn lại chủ đề
        </ButtonLink>
      </Card>
    )
  }

  const currentQuestion = questions[Math.min(currentIndex, questions.length - 1)] ?? questions[0]
  const answeredCount = Object.keys(answers).length

  function navStatus(index: number, questionId: number): QuestionNavStatus {
    if (index === currentIndex) return 'current'
    if (flagged.includes(questionId)) return 'flagged'
    if (answers[questionId] != null) return 'answered'
    return 'unanswered'
  }

  function handleSelectOption(optionId: number) {
    selectAnswerInStore(currentQuestion.id, optionId)
    setFeedback('Đã ghi nhận đáp án')
    window.setTimeout(() => setFeedback(null), 1500)
    if (activeAttemptId && activeAttemptId !== -1) {
      submitAnswerMutation.mutate({
        attemptId: activeAttemptId,
        payload: {
          questionId: currentQuestion.id,
          selectedOptionId: optionId,
        },
      })
    }
  }

  async function handleSubmitPractice() {
    setConfirmOpen(false)
    if (usingMock || !activeAttemptId || activeAttemptId === -1) {
      toast.success('Đã nộp bài luyện tập (mock)')
      navigate('/student/practice/result?attemptId=-1')
      return
    }
    try {
      const res = await submitExamMutation.mutateAsync(activeAttemptId)
      toast.success('Đã nộp bài luyện tập')
      navigate(`/student/practice/result?attemptId=${res.attemptId}`)
    } catch {
      toast.error('Có lỗi khi nộp bài')
    }
  }

  return (
    <ExamShell
      title={`Luyện tập · ${meta.topic}`}
      subtitle={`Câu ${currentIndex + 1}/${questions.length} · Đã trả lời ${answeredCount}${usingMock ? ' · MOCK' : ''}`}
      timerLabel={formatDuration(remainingSeconds)}
      timerUrgent={remainingSeconds < 60}
      onSubmitClick={() => setConfirmOpen(true)}
      submitLabel="Nộp luyện tập"
      feedback={feedback}
      navigator={
        <QuestionNavigator
          items={questions.map((item, i) => ({
            id: item.id,
            status: navStatus(i, item.id),
          }))}
          onSelect={setCurrentIndex}
        />
      }
    >
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Practice badge row] */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="info" size="sm">
          Luyện tập
        </Badge>
        <Text size="xs" tone="muted">
          Cùng giao diện thi chính thức — không tính điểm kỳ thi
        </Text>
      </div>

      <Card as="article" className="space-y-4 rounded-xl border-line-subtle bg-surface-card p-5 shadow-none sm:p-6">
        <header className="flex justify-between gap-2">
          <Heading level={2} className="text-base font-semibold leading-relaxed">
            {currentQuestion.content}
          </Heading>
          <Badge tone="neutral" size="sm">
            {currentQuestion.difficulty}
          </Badge>
        </header>
        <fieldset className="m-0 space-y-2 border-0 p-0">
          <legend className="sr-only">Đáp án</legend>
          {currentQuestion.options.map((opt, oi) => {
            const selected = answers[currentQuestion.id] === opt.id
            return (
              <Button
                key={opt.id}
                type="button"
                variant={selected ? 'primary' : 'outline'}
                className="h-auto min-h-11 w-full justify-start whitespace-normal py-3 text-left"
                onClick={() => handleSelectOption(opt.id)}
              >
                <strong className="mr-2">{String.fromCodePoint(65 + oi)}.</strong> {opt.content}
              </Button>
            )
          })}
        </fieldset>
        <footer className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Nav] */}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<ChevronLeft size={16} />}
              disabled={currentIndex <= 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
            >
              Trước
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              rightIcon={<ChevronRight size={16} />}
              disabled={currentIndex >= questions.length - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              Sau
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            variant={flagged.includes(currentQuestion.id) ? 'secondary' : 'ghost'}
            leftIcon={<Flag size={14} />}
            onClick={() => toggleFlag(currentQuestion.id)}
          >
            Đánh dấu
          </Button>
        </footer>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmitPractice}
        title="Nộp bài luyện tập?"
        description={`Bạn đã trả lời ${answeredCount}/${questions.length} câu hỏi.`}
        variant="primary"
        confirmLabel="Nộp bài"
      />
    </ExamShell>
  )
}
