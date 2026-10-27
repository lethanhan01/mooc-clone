import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import {
  useRoomDetailQuery,
  useQuestionsListQuery,
  useStartAttemptMutation,
  useSubmitAnswerMutation,
  useSubmitExamMutation,
} from '@/hooks/queries'
import { useExamStore } from '@/stores/examStore'
import { formatDuration } from '@/lib/room-status'
import { toast } from '@/lib/toast'

export default function StudentLiveExamPage() {
  const { roomId = '' } = useParams()
  const navigate = useNavigate()

  const { data: room, isLoading: isRoomLoading } = useRoomDetailQuery(roomId)
  const { data: allQuestions = [], isLoading: isQuestionsLoading } = useQuestionsListQuery()
  const startAttemptMutation = useStartAttemptMutation()
  const submitAnswerMutation = useSubmitAnswerMutation()
  const submitExamMutation = useSubmitExamMutation()

  const activeAttemptId = useExamStore((s) => s.activeAttemptId)
  const currentIndex = useExamStore((s) => s.currentIndex)
  const answers = useExamStore((s) => s.answers)
  const flagged = useExamStore((s) => s.flaggedQuestionIds)
  const remainingSeconds = useExamStore((s) => s.remainingSeconds)
  const startSession = useExamStore((s) => s.startSession)
  const selectAnswerInStore = useExamStore((s) => s.selectAnswer)
  const toggleFlag = useExamStore((s) => s.toggleFlag)
  const setCurrentIndex = useExamStore((s) => s.setCurrentIndex)
  const decrementTimer = useExamStore((s) => s.decrementTimer)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const autoSubmitted = useRef(false)

  const roomTopic = room?.topic
  const questions = (roomTopic
    ? allQuestions.filter((q) => q.topic.toLowerCase().includes(roomTopic.toLowerCase()))
    : allQuestions
  ).slice(0, (room?.easyCount ?? 5) + (room?.mediumCount ?? 5) + (room?.hardCount ?? 0) || 10)


  // Auto-init attempt if not already running
  useEffect(() => {
    if (!room || activeAttemptId) return
    startAttemptMutation
      .mutateAsync({ roomCode: room.roomCode, mode: 'EXAM' })
      .then((res) => {
        startSession({ attemptId: res.attemptId, roomCode: room.roomCode, durationSeconds: room.durationSeconds })
      })
      .catch(() => toast.error('Không thể khởi tạo lượt thi từ máy chủ'))
  }, [room, activeAttemptId, startAttemptMutation, startSession])

  // Timer countdown
  useEffect(() => {
    if (!activeAttemptId) return
    const id = window.setInterval(() => decrementTimer(), 1000)
    return () => window.clearInterval(id)
  }, [activeAttemptId, decrementTimer])

  // Auto submit when time runs out
  useEffect(() => {
    if (activeAttemptId && remainingSeconds === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true
      submitExamMutation
        .mutateAsync(activeAttemptId)
        .then((res) => {
          toast.warning('Hết thời gian làm bài — bài thi đã được nộp tự động')
          navigate(`/student/rooms/${room?.roomCode ?? roomId}/summary?attemptId=${res.attemptId}`)
        })
        .catch(() => toast.error('Không thể nộp bài tự động'))
    }
  }, [remainingSeconds, activeAttemptId, submitExamMutation, navigate, room, roomId])


  if (isRoomLoading || isQuestionsLoading || questions.length === 0) {
    return (
      <Card as="section" className="p-8 text-center bg-surface border-line-subtle rounded-2xl">
        <Text tone="muted">Đang chuẩn bị đề thi từ cơ sở dữ liệu…</Text>
      </Card>
    )
  }

  const currentQuestion = questions[currentIndex] ?? questions[0]
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

  async function handleSubmitExam() {
    if (!activeAttemptId) return
    setConfirmOpen(false)
    try {
      const res = await submitExamMutation.mutateAsync(activeAttemptId)
      toast.success('Nộp bài thi thành công')
      navigate(`/student/rooms/${room?.roomCode ?? roomId}/summary?attemptId=${res.attemptId}`)
    } catch {
      toast.error('Có lỗi khi nộp bài thi. Vui lòng thử lại.')
    }
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Exam layout grid] */
    <div className="min-h-[70vh] grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
      <main className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface border border-line-subtle rounded-2xl shadow-card">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title stack] */}
          <div>
            <Heading level={1} className="text-base sm:text-lg font-bold">
              {room?.name ?? 'Phòng thi trực tuyến'}
            </Heading>
            <Text size="xs" tone="muted">
              Câu {currentIndex + 1}/{questions.length} · Đã trả lời {answeredCount}
            </Text>
          </div>
          <p
            className={`font-mono text-xl font-extrabold tabular-nums ${remainingSeconds < 60 ? 'text-status-danger-fg' : 'text-action-accent'}`}
            aria-live="polite"
          >
            {formatDuration(remainingSeconds)}
          </p>
        </header>

        <Card as="article" className="p-5 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl space-y-4">
          <header className="flex items-start justify-between gap-2">
            <Heading level={2} className="text-base font-semibold leading-relaxed">
              {currentQuestion.content}
            </Heading>
            <Badge tone="neutral" size="sm">
              {currentQuestion.difficulty}
            </Badge>
          </header>
          <fieldset className="space-y-2 border-0 p-0 m-0">
            <legend className="sr-only">Chọn đáp án</legend>
            {currentQuestion.options.map((opt, oi) => {
              const selected = answers[currentQuestion.id] === opt.id
              return (
                <Button
                  key={opt.id}
                  type="button"
                  variant={selected ? 'primary' : 'outline'}
                  className="w-full justify-start min-h-11 text-left whitespace-normal h-auto py-3"
                  onClick={() => handleSelectOption(opt.id)}
                >
                  <strong className="mr-2">{String.fromCodePoint(65 + oi)}.</strong> {opt.content}
                </Button>
              )
            })}
          </fieldset>
          <footer className="flex flex-wrap items-center justify-between gap-2 pt-2">
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Nav buttons] */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<ChevronLeft size={16} />}
                disabled={currentIndex <= 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
              >
                Trước
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                rightIcon={<ChevronRight size={16} />}
                disabled={currentIndex >= questions.length - 1}
                onClick={() => setCurrentIndex(currentIndex + 1)}
              >
                Sau
              </Button>
            </div>
            <Button
              type="button"
              variant={flagged.includes(currentQuestion.id) ? 'secondary' : 'ghost'}
              size="sm"
              leftIcon={<Flag size={14} />}
              onClick={() => toggleFlag(currentQuestion.id)}
            >
              Đánh dấu
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              Nộp bài
            </Button>
          </footer>
        </Card>
      </main>

      <aside aria-label="Bảng câu hỏi" className="p-4 bg-surface border border-line-subtle rounded-2xl shadow-card h-fit">
        <Heading level={2} className="text-sm font-bold mb-3">
          Danh sách câu
        </Heading>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Question palette grid] */}
        <div className="grid grid-cols-5 gap-2">
          {questions.map((item, i) => {
            const has = Boolean(answers[item.id])
            const isFlagged = flagged.includes(item.id)
            let buttonVariant: 'primary' | 'secondary' | 'outline' = 'outline'
            if (i === currentIndex) buttonVariant = 'primary'
            else if (has) buttonVariant = 'secondary'
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={buttonVariant}
                className={`min-h-10 ${isFlagged ? 'ring-2 ring-status-warning-fg' : ''}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Câu ${i + 1}`}
              >
                {i + 1}
              </Button>
            )
          })}
        </div>
      </aside>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmitExam}
        title="Nộp bài thi?"
        description={`Bạn đã trả lời ${answeredCount}/${questions.length} câu hỏi. Sau khi nộp, hệ thống sẽ chấm điểm tức thì.`}
        variant="danger"
        confirmLabel="Xác nhận nộp bài"
      />
    </div>
  )
}
