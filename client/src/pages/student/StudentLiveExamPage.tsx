import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { ExamShell } from '@/components/exam/ExamShell'
import { QuestionNavigator, type QuestionNavStatus } from '@/components/exam/QuestionNavigator'
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
import { MOCK_QUESTIONS } from '@/mocks/teacher-workflow.fixtures'

export default function StudentLiveExamPage() {
  const { roomId = '' } = useParams()
  const navigate = useNavigate()

  const { data: room, isLoading: isRoomLoading } = useRoomDetailQuery(roomId)
  const { data: allQuestions = [], isLoading: isQuestionsLoading, isError } = useQuestionsListQuery()
  const startAttemptMutation = useStartAttemptMutation()
  const submitAnswerMutation = useSubmitAnswerMutation()
  const submitExamMutation = useSubmitExamMutation()

  const {
    activeAttemptId,
    currentIndex,
    answers,
    flaggedQuestionIds: flagged,
    remainingSeconds,
    startSession,
    syncServerClock,
    selectAnswer: selectAnswerInStore,
    toggleFlag,
    setCurrentIndex,
    decrementTimer,
  } = useExamStore()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [confirmedIds, setConfirmedIds] = useState<number[]>([])
  const autoSubmitted = useRef(false)

  const mockFallback = useMemo(
    () =>
      MOCK_QUESTIONS.filter((q) => q.bankId === 'bank-1').map((q, index) => ({
        id: index + 1,
        content: q.content,
        difficulty: q.difficulty,
        options: q.options.map((o, oi) => ({ id: oi + 1, content: o.content })),
      })),
    []
  )

  const roomTopic = room?.topic
  const apiQuestions = (roomTopic
    ? allQuestions.filter((q) => q.topic.toLowerCase().includes(roomTopic.toLowerCase()))
    : allQuestions
  ).slice(0, (room?.easyCount ?? 5) + (room?.mediumCount ?? 5) + (room?.hardCount ?? 0) || 10)

  const questions = apiQuestions.length > 0 ? apiQuestions : mockFallback
  const usingMock = apiQuestions.length === 0 || activeAttemptId === -1

  useEffect(() => {
    if (!room || activeAttemptId || usingMock) return
    startAttemptMutation
      .mutateAsync({ roomCode: room.roomCode, mode: 'EXAM' })
      .then((res) =>
        startSession({
          attemptId: res.attemptId,
          roomCode: room.roomCode,
          durationSeconds: room.durationSeconds,
          endsAt: room.endsAt,
          serverNow: room.serverNow,
        })
      )
      .catch(() => toast.error('Không thể khởi tạo lượt thi từ máy chủ — dùng mock local'))
  }, [room, activeAttemptId, startAttemptMutation, startSession, usingMock])

  useEffect(() => {
    if (usingMock && !activeAttemptId) {
      startSession({
        attemptId: -1,
        roomCode: roomId || 'MOCK',
        durationSeconds: 60 * 60,
        endsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        serverNow: new Date().toISOString(),
      })
    }
  }, [usingMock, activeAttemptId, startSession, roomId])

  useEffect(() => {
    if (activeAttemptId && room?.endsAt && !usingMock) {
      syncServerClock({ endsAt: room.endsAt, serverNow: room.serverNow })
    }
  }, [activeAttemptId, room?.endsAt, room?.serverNow, syncServerClock, usingMock])

  useEffect(() => {
    if (!activeAttemptId) return
    const id = window.setInterval(() => decrementTimer(), 1000)
    return () => window.clearInterval(id)
  }, [activeAttemptId, decrementTimer])

  const isRoomEnded = room?.status?.toUpperCase() === 'ENDED' || room?.status === 'finished'

  useEffect(() => {
    if (activeAttemptId && (remainingSeconds === 0 || isRoomEnded) && !autoSubmitted.current) {
      autoSubmitted.current = true
      if (usingMock) {
        toast.warning('Hết thời gian — nộp mock')
        navigate(`/student/rooms/${room?.roomCode ?? roomId}/summary?attemptId=mock-attempt`)
        return
      }
      submitExamMutation
        .mutateAsync(activeAttemptId)
        .then((res) => {
          toast.warning('Hết thời gian làm bài — bài thi đã được nộp tự động')
          navigate(`/student/rooms/${room?.roomCode ?? roomId}/summary?attemptId=${res.attemptId}`)
        })
        .catch(() => toast.error('Không thể nộp bài tự động'))
    }
  }, [remainingSeconds, isRoomEnded, activeAttemptId, submitExamMutation, navigate, room, roomId, usingMock])

  if ((!usingMock && (isRoomLoading || isQuestionsLoading)) || questions.length === 0) {
    return (
      <Card as="section" className="rounded-xl border-line-subtle bg-surface-card p-8 text-center shadow-none">
        <Text tone="muted">{isError ? 'Lỗi tải đề — thử mock' : 'Đang chuẩn bị đề thi…'}</Text>
      </Card>
    )
  }

  const currentQuestion = questions[currentIndex] ?? questions[0]
  const answeredCount = Object.keys(answers).length

  function navStatus(index: number, questionId: number): QuestionNavStatus {
    if (index === currentIndex) return 'current'
    if (flagged.includes(questionId)) return 'flagged'
    if (confirmedIds.includes(questionId)) return 'confirmed'
    if (answers[questionId] != null) return 'answered'
    return 'unanswered'
  }

  function handleSelectOption(optionId: number) {
    selectAnswerInStore(currentQuestion.id, optionId)
    setFeedback('Đã ghi nhận đáp án (Answer submitted)')
    window.setTimeout(() => setFeedback(null), 2500)
    if (usingMock) {
      setConfirmedIds((prev) => (prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]))
      return
    }
    if (activeAttemptId) {
      submitAnswerMutation.mutate(
        {
          attemptId: activeAttemptId,
          payload: { questionId: currentQuestion.id, selectedOptionId: optionId },
        },
        {
          onSuccess: () => {
            setConfirmedIds((prev) => (prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]))
          },
        }
      )
    }
  }

  async function handleSubmitExam() {
    setConfirmOpen(false)
    if (usingMock) {
      toast.success('Nộp bài mock thành công')
      navigate(`/student/rooms/${room?.roomCode ?? roomId}/summary?attemptId=mock-attempt`)
      return
    }
    if (!activeAttemptId) return
    try {
      const res = await submitExamMutation.mutateAsync(activeAttemptId)
      toast.success('Nộp bài thi thành công')
      navigate(`/student/rooms/${room?.roomCode ?? roomId}/summary?attemptId=${res.attemptId}`)
    } catch {
      toast.error('Có lỗi khi nộp bài thi. Vui lòng thử lại.')
    }
  }

  return (
    <ExamShell
      title={room?.name ?? 'Bài thi trực tuyến'}
      subtitle={`Câu ${currentIndex + 1}/${questions.length} · Đã trả lời ${answeredCount}${usingMock ? ' · MOCK' : ''}`}
      timerLabel={formatDuration(remainingSeconds)}
      timerUrgent={remainingSeconds < 60}
      onSubmitClick={() => setConfirmOpen(true)}
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
      <Card as="article" className="space-y-4 rounded-xl border-line-subtle bg-surface-card p-5 shadow-none sm:p-6">
        <header className="flex items-start justify-between gap-2">
          <Heading level={2} className="text-base font-semibold leading-relaxed">
            {currentQuestion.content}
          </Heading>
          <Badge tone="neutral" size="sm">
            {currentQuestion.difficulty}
          </Badge>
        </header>
        <fieldset className="m-0 space-y-2 border-0 p-0">
          <legend className="sr-only">Chọn đáp án</legend>
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
        </footer>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmitExam}
        title="Nộp bài thi?"
        description={`Bạn đã trả lời ${answeredCount}/${questions.length} câu hỏi. Sau khi nộp, hệ thống sẽ chấm điểm.`}
        variant="danger"
        confirmLabel="Xác nhận nộp bài"
      />
    </ExamShell>
  )
}
