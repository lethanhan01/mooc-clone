import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useAuthStore } from '@/stores/authStore'
import { useMockExamStore } from '@/stores/mockExamStore'
import { formatDuration } from '@/lib/room-status'
import { toast } from '@/lib/toast'
import type { Difficulty } from '@/services/mockData'

/** Practice index/flag are local — store only exposes selectPracticeAnswer / submitPractice. */
export default function StudentPracticeExamPage() {
  const user = useAuthStore((s) => s.user)
  const session = useMockExamStore((s) => s.practiceSession)
  const questionsByRoom = useMockExamStore((s) => s.questionsByRoom)
  const selectPracticeAnswer = useMockExamStore((s) => s.selectPracticeAnswer)
  const submitPractice = useMockExamStore((s) => s.submitPractice)
  const navigate = useNavigate()

  const questions = session ? (questionsByRoom[session.roomId] ?? []) : []
  const [index, setIndex] = useState(0)
  const [flagged, setFlagged] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [remainSec, setRemainSec] = useState(0)
  const autoSubmitted = useRef(false)
  const [meta] = useState<{ topic: string; difficulty: Difficulty | 'MIXED' }>(() => {
    try {
      const raw = sessionStorage.getItem('mooc-practice-meta')
      if (raw) return JSON.parse(raw) as { topic: string; difficulty: Difficulty | 'MIXED' }
    } catch {
      /* ignore */
    }
    return { topic: questions[0]?.topic ?? 'Tất cả', difficulty: 'MIXED' as const }
  })

  useEffect(() => {
    if (!session) navigate('/student/practice', { replace: true })
  }, [session, navigate])

  useEffect(() => {
    if (!session?.endsAt) return
    autoSubmitted.current = false
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(session.endsAt).getTime() - Date.now()) / 1000))
      setRemainSec(left)
      if (left === 0 && user && !autoSubmitted.current) {
        autoSubmitted.current = true
        submitPractice(user.userId, meta.topic, meta.difficulty)
        toast.warning('Hết giờ luyện tập — đã nộp')
        navigate('/student/practice/result')
      }
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [session?.endsAt, user, submitPractice, navigate, meta])

  if (!session || questions.length === 0) {
    return (
      <Card as="section" className="p-8 text-center bg-surface rounded-2xl space-y-3">
        <Text tone="muted">Không có phiên luyện tập</Text>
        <ButtonLink to="/student/practice" variant="outline">
          Chọn chủ đề
        </ButtonLink>
      </Card>
    )
  }

  const q = questions[Math.min(index, questions.length - 1)]
  const answered = Object.keys(session.answers).length

  function doSubmit() {
    if (!user) return
    submitPractice(user.userId, meta.topic, meta.difficulty)
    setConfirmOpen(false)
    toast.success('Đã nộp bài luyện tập')
    navigate('/student/practice/result')
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
              Câu {index + 1}/{questions.length} · Đã trả lời {answered}
            </Text>
          </div>
          <p className="font-mono text-xl font-extrabold text-action-accent tabular-nums">{formatDuration(remainSec)}</p>
        </header>

        <Card as="article" className="p-5 bg-surface border-line-subtle shadow-card rounded-2xl space-y-4">
          <header className="flex justify-between gap-2">
            <Heading level={2} className="text-base font-semibold leading-relaxed">
              {q.content}
            </Heading>
            <Badge tone="neutral" size="sm">
              {q.difficulty}
            </Badge>
          </header>
          <fieldset className="space-y-2 border-0 p-0 m-0">
            <legend className="sr-only">Đáp án</legend>
            {q.options.map((opt) => (
              <Button
                key={opt.id}
                type="button"
                variant={session.answers[q.id] === opt.id ? 'primary' : 'outline'}
                className="w-full justify-start min-h-11 h-auto py-3 text-left whitespace-normal"
                onClick={() => selectPracticeAnswer(q.id, opt.id)}
              >
                <strong className="mr-2">{opt.label}.</strong> {opt.text}
              </Button>
            ))}
          </fieldset>
          <footer className="flex flex-wrap gap-2 justify-between">
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Nav] */}
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" leftIcon={<ChevronLeft size={16} />} disabled={index <= 0} onClick={() => setIndex((i) => i - 1)}>
                Trước
              </Button>
              <Button type="button" size="sm" variant="outline" rightIcon={<ChevronRight size={16} />} disabled={index >= questions.length - 1} onClick={() => setIndex((i) => i + 1)}>
                Sau
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              variant={flagged.includes(q.id) ? 'secondary' : 'ghost'}
              leftIcon={<Flag size={14} />}
              onClick={() =>
                setFlagged((f) => (f.includes(q.id) ? f.filter((id) => id !== q.id) : [...f, q.id]))
              }
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
          Palette
        </Heading>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Palette grid] */}
        <div className="grid grid-cols-5 gap-2">
          {questions.map((item, i) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={i === index ? 'primary' : session.answers[item.id] ? 'secondary' : 'outline'}
              className={`min-h-10 ${flagged.includes(item.id) ? 'ring-2 ring-status-warning-fg' : ''}`}
              onClick={() => setIndex(i)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </aside>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doSubmit}
        title="Nộp bài luyện tập?"
        description={`Đã trả lời ${answered}/${questions.length} câu.`}
        variant="primary"
        confirmLabel="Nộp bài"
      />
    </div>
  )
}
