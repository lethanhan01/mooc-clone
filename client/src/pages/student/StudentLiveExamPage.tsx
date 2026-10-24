import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useAuthStore } from '@/stores/authStore'
import { useMockExamStore } from '@/stores/mockExamStore'
import { formatDuration } from '@/lib/room-status'
import { toast } from '@/lib/toast'

export default function StudentLiveExamPage() {
  const { roomId = '' } = useParams()
  const user = useAuthStore((s) => s.user)
  const room = useMockExamStore((s) => s.rooms.find((r) => r.id === roomId))
  const questions = useMockExamStore((s) => s.questionsByRoom[roomId] ?? [])
  const session = useMockExamStore((s) => s.activeExamSession)
  const startExam = useMockExamStore((s) => s.startExam)
  const selectAnswer = useMockExamStore((s) => s.selectAnswer)
  const toggleFlag = useMockExamStore((s) => s.toggleFlag)
  const setCurrentIndex = useMockExamStore((s) => s.setCurrentIndex)
  const submitExam = useMockExamStore((s) => s.submitExam)
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [remainSec, setRemainSec] = useState(0)
  const autoSubmitted = useRef(false)

  useEffect(() => {
    if (!user || !roomId) return
    if (!session || session.roomId !== roomId) {
      const s = startExam(roomId, user.userId)
      if (!s) toast.error('Không khởi tạo được phiên thi')
    }
  }, [roomId, user, session, startExam])

  useEffect(() => {
    if (!session?.endsAt) return
    autoSubmitted.current = false
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(session.endsAt).getTime() - Date.now()) / 1000))
      setRemainSec(left)
      if (left === 0 && user && !autoSubmitted.current) {
        autoSubmitted.current = true
        const sub = submitExam(user.userId, user.fullName, user.studentId ?? 'SV000')
        if (sub) {
          toast.warning('Hết giờ — đã tự nộp bài')
          navigate(`/student/rooms/${roomId}/summary`)
        }
      }
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [session?.endsAt, user, submitExam, navigate, roomId])

  if (!session || session.roomId !== roomId || questions.length === 0) {
    return (
      <Card as="section" className="p-8 text-center bg-surface border-line-subtle rounded-2xl">
        <Text tone="muted">Đang tải phiên thi…</Text>
      </Card>
    )
  }

  const idx = session.currentIndex
  const q = questions[idx]
  const answered = Object.keys(session.answers).length

  function doSubmit() {
    if (!user) return
    const sub = submitExam(user.userId, user.fullName, user.studentId ?? 'SV000')
    setConfirmOpen(false)
    if (sub) {
      toast.success('Nộp bài thành công')
      navigate(`/student/rooms/${roomId}/summary`)
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
              {room?.name ?? 'Bài thi'}
            </Heading>
            <Text size="xs" tone="muted">
              Câu {idx + 1}/{questions.length} · Đã trả lời {answered}
            </Text>
          </div>
          <p
            className={`font-mono text-xl font-extrabold tabular-nums ${remainSec < 60 ? 'text-status-danger-fg' : 'text-action-accent'}`}
            aria-live="polite"
          >
            {formatDuration(remainSec)}
          </p>
        </header>

        <Card as="article" className="p-5 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl space-y-4">
          <header className="flex items-start justify-between gap-2">
            <Heading level={2} className="text-base font-semibold leading-relaxed">
              {q.content}
            </Heading>
            <Badge tone="neutral" size="sm">
              {q.difficulty}
            </Badge>
          </header>
          <fieldset className="space-y-2 border-0 p-0 m-0">
            <legend className="sr-only">Chọn đáp án</legend>
            {q.options.map((opt) => {
              const selected = session.answers[q.id] === opt.id
              return (
                <Button
                  key={opt.id}
                  type="button"
                  variant={selected ? 'primary' : 'outline'}
                  className="w-full justify-start min-h-11 text-left whitespace-normal h-auto py-3"
                  onClick={() => selectAnswer(q.id, opt.id)}
                >
                  <strong className="mr-2">{opt.label}.</strong> {opt.text}
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
                disabled={idx <= 0}
                onClick={() => setCurrentIndex(idx - 1)}
              >
                Trước
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                rightIcon={<ChevronRight size={16} />}
                disabled={idx >= questions.length - 1}
                onClick={() => setCurrentIndex(idx + 1)}
              >
                Sau
              </Button>
            </div>
            <Button
              type="button"
              variant={session.flagged.includes(q.id) ? 'secondary' : 'ghost'}
              size="sm"
              leftIcon={<Flag size={14} />}
              onClick={() => toggleFlag(q.id)}
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
          Palette
        </Heading>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Question palette grid] */}
        <div className="grid grid-cols-5 gap-2">
          {questions.map((item, i) => {
            const has = Boolean(session.answers[item.id])
            const flagged = session.flagged.includes(item.id)
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={i === idx ? 'primary' : has ? 'secondary' : 'outline'}
                className={`min-h-10 ${flagged ? 'ring-2 ring-status-warning-fg' : ''}`}
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
        onConfirm={doSubmit}
        title="Nộp bài thi?"
        description={`Bạn đã trả lời ${answered}/${questions.length} câu. Không thể sửa sau khi nộp.`}
        variant="danger"
        confirmLabel="Nộp bài"
      />
    </div>
  )
}
