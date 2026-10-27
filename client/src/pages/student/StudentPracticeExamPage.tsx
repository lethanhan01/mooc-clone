import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import {
  useQuestionsListQuery,
  useSubmitAnswerMutation,
  useSubmitExamMutation,
} from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'
import { formatDuration } from '@/lib/room-status'
import { toast } from '@/lib/toast'

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

  const [confirmOpen, setConfirmOpen] = useState(false)
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

  // Filter practice questions based on chosen topic
  const questions = useMemo(() => {
    const topicFiltered = allQuestions.filter(
      (q) => !meta.topic || q.topic.toLowerCase().includes(meta.topic.toLowerCase())
    )
    const list = topicFiltered.length > 0 ? topicFiltered : allQuestions
    return list.slice(0, meta.count || 5)
  }, [allQuestions, meta])

  // Timer countdown
  useEffect(() => {
    if (!activeAttemptId) return
    const id = window.setInterval(() => {
      decrementTimer()
    }, 1000)
    return () => window.clearInterval(id)
  }, [activeAttemptId, decrementTimer])

  // Auto submit when time is up
  useEffect(() => {
    if (activeAttemptId && remainingSeconds === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true
      submitExamMutation
        .mutateAsync(activeAttemptId)
        .then((res) => {
          toast.warning('Hết thời gian luyện tập — đã nộp tự động')
          navigate(`/student/practice/result?attemptId=${res.attemptId}`)
        })
        .catch(() => {
          toast.error('Không thể nộp bài luyện tập')
        })
    }
  }, [remainingSeconds, activeAttemptId, submitExamMutation, navigate])

  if (isLoading || questions.length === 0) {
    return (
      <Card as="section" className="p-8 text-center bg-surface rounded-2xl space-y-3">
        <Text tone="muted">Đang chuẩn bị câu hỏi luyện tập...</Text>
        <ButtonLink to="/student/practice" variant="outline">
          Chọn lại chủ đề
        </ButtonLink>
      </Card>
    )
  }

  const currentQuestion = questions[Math.min(currentIndex, questions.length - 1)] ?? questions[0]
  const answeredCount = Object.keys(answers).length

  function handleSelectOption(optionId: number) {
    selectAnswerInStore(currentQuestion.id, optionId)
    if (activeAttemptId) {
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
    if (!activeAttemptId) {
      navigate('/student/practice')
      return
    }
    setConfirmOpen(false)
    try {
      const res = await submitExamMutation.mutateAsync(activeAttemptId)
      toast.success('Đã nộp bài luyện tập')
      navigate(`/student/practice/result?attemptId=${res.attemptId}`)
    } catch {
      toast.error('Có lỗi khi nộp bài')
    }
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Practice exam layout] */
    <div className="min-h-[70vh] grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4">
      <main className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface border border-line-subtle rounded-2xl">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
          <div>
            <Heading level={1} className="text-lg font-bold">
              Luyện tập · {meta.topic}
            </Heading>
            <Text size="xs" tone="muted">
              Câu {currentIndex + 1}/{questions.length} · Đã trả lời {answeredCount}
            </Text>
          </div>
          <p className="font-mono text-xl font-extrabold text-action-accent tabular-nums">
            {formatDuration(remainingSeconds)}
          </p>
        </header>

        <Card
          as="article"
          className="p-5 bg-surface border-line-subtle shadow-card rounded-2xl space-y-4"
        >
          <header className="flex justify-between gap-2">
            <Heading level={2} className="text-base font-semibold leading-relaxed">
              {currentQuestion.content}
            </Heading>
            <Badge tone="neutral" size="sm">
              {currentQuestion.difficulty}
            </Badge>
          </header>
          <fieldset className="space-y-2 border-0 p-0 m-0">
            <legend className="sr-only">Đáp án</legend>
            {currentQuestion.options.map((opt, oi) => {
              const selected = answers[currentQuestion.id] === opt.id
              return (
                <Button
                  key={opt.id}
                  type="button"
                  variant={selected ? 'primary' : 'outline'}
                  className="w-full justify-start min-h-11 h-auto py-3 text-left whitespace-normal"
                  onClick={() => handleSelectOption(opt.id)}
                >
                  <strong className="mr-2">{String.fromCodePoint(65 + oi)}.</strong> {opt.content}
                </Button>
              )
            })}
          </fieldset>
          <footer className="flex flex-wrap gap-2 justify-between pt-2">
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
            <Button type="button" size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
              Nộp bài
            </Button>
          </footer>
        </Card>
      </main>

      <aside className="p-4 bg-surface border border-line-subtle rounded-2xl h-fit">
        <Heading level={2} className="text-sm font-bold mb-3">
          Danh sách câu
        </Heading>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Palette grid] */}
        <div className="grid grid-cols-5 gap-2">
          {questions.map((item, i) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={i === currentIndex ? 'primary' : answers[item.id] ? 'secondary' : 'outline'}
              className={`min-h-10 ${flagged.includes(item.id) ? 'ring-2 ring-status-warning-fg' : ''}`}
              onClick={() => setCurrentIndex(i)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </aside>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmitPractice}
        title="Nộp bài luyện tập?"
        description={`Bạn đã trả lời ${answeredCount}/${questions.length} câu hỏi.`}
        variant="primary"
        confirmLabel="Nộp bài"
      />
    </div>
  )
}
