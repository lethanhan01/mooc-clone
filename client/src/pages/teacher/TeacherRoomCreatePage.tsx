import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input, Checkbox } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { useMockExamStore } from '@/stores/mockExamStore'
import { PRACTICE_TOPICS } from '@/services/mockData'
import { toast } from '@/lib/toast'

export default function TeacherRoomCreatePage() {
  const user = useAuthStore((s) => s.user)
  const createRoom = useMockExamStore((s) => s.createRoom)
  const navigate = useNavigate()

  const [name, setName] = useState('Ôn tập & Thi thử 2025-2: IT4549 - Phát triển ứng dụng Web')
  const [subject, setSubject] = useState('IT4549')
  const [topic, setTopic] = useState('Công nghệ PM & Web')
  const [durationMinutes, setDurationMinutes] = useState(45)
  const [opensAt, setOpensAt] = useState(() => new Date(Date.now() + 3600_000).toISOString().slice(0, 16))
  const [easy, setEasy] = useState(4)
  const [medium, setMedium] = useState(4)
  const [hard, setHard] = useState(2)
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Mạng máy tính'])
  const [practiceMode, setPracticeMode] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [shuffle, setShuffle] = useState(true)
  const [lockDevice, setLockDevice] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  function toggleTopic(t: string) {
    setSelectedTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function handleSubmit() {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Nhập tên phòng thi'
    if (durationMinutes < 5) next.duration = 'Tối thiểu 5 phút'
    if (easy + medium + hard < 1) next.diff = 'Cần ít nhất 1 câu hỏi theo độ khó'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    if (!user) return

    setLoading(true)
    try {
      const room = createRoom({
        name: name.trim(),
        subject: subject.trim() || 'GENERAL',
        topic: topic.trim(),
        durationMinutes,
        opensAt: new Date(opensAt).toISOString(),
        mode: practiceMode ? 'practice' : 'official',
        difficultyConfig: { EASY: easy, MEDIUM: medium, HARD: hard },
        topics: selectedTopics,
        options: {
          practiceMode,
          showAnswersAfterSubmit: showAnswers,
          shuffleQuestions: shuffle,
          lockDevice,
        },
        teacherId: user.userId,
        teacherName: user.fullName,
        members: [],
      })
      toast.success('Đã lưu cấu hình phòng', { description: `Mã ${room.code} · PIN ${room.pin}` })
      navigate(`/teacher/rooms/${room.id}/questions`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card as="article" className="p-6 sm:p-8 bg-surface border-line-subtle shadow-card rounded-2xl space-y-6">
      <header>
        <Heading level={1} className="text-xl sm:text-2xl font-extrabold">
          Cài đặt phòng thi & Phân quyền danh sách học sinh
        </Heading>
        <Text size="sm" tone="muted" className="mt-1">
          Cấu hình số câu theo độ khó (EASY / MEDIUM / HARD). Server sẽ rút đề khi bắt đầu phòng.
        </Text>
      </header>

      <Form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField id="room-name" label="Tên phòng thi / Kỳ thi:" error={errors.name} required>
          <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Create-room meta grid] */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="room-subject" label="Mã môn / Subject:">
            <Input id="room-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </FormField>
          <FormField id="room-topic" label="Chủ đề phân môn:">
            <Input id="room-topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </FormField>
          <FormField id="room-duration" label="Thời lượng làm bài (phút):" error={errors.duration} required>
            <Input
              id="room-duration"
              type="number"
              min={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </FormField>
          <FormField id="room-opens" label="Thời gian mở phòng thi:" required>
            <Input
              id="room-opens"
              type="datetime-local"
              value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)}
            />
          </FormField>
        </div>

        <fieldset className="border border-line-subtle rounded-xl p-4">
          <legend className="px-2 text-sm font-bold text-text-primary">Số câu theo độ khó *</legend>
          {errors.diff ? <Text size="xs" className="text-tone-danger mb-2">{errors.diff}</Text> : null}
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Difficulty counts grid] */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField id="diff-easy" label="Dễ (EASY)">
              <Input id="diff-easy" type="number" min={0} value={easy} onChange={(e) => setEasy(Number(e.target.value))} />
            </FormField>
            <FormField id="diff-medium" label="Trung bình (MEDIUM)">
              <Input id="diff-medium" type="number" min={0} value={medium} onChange={(e) => setMedium(Number(e.target.value))} />
            </FormField>
            <FormField id="diff-hard" label="Khó (HARD)">
              <Input id="diff-hard" type="number" min={0} value={hard} onChange={(e) => setHard(Number(e.target.value))} />
            </FormField>
          </div>
          <Text size="xs" tone="muted" className="mt-2">
            Tổng câu dự kiến: {easy + medium + hard}
          </Text>
        </fieldset>

        <fieldset className="border border-line-subtle rounded-xl p-4">
          <legend className="px-2 text-sm font-bold">Chủ đề allowlist (rút đề)</legend>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Topic chips wrap] */}
          <div className="flex flex-wrap gap-2">
            {PRACTICE_TOPICS.map((t) => (
              <Button
                key={t}
                type="button"
                size="sm"
                variant={selectedTopics.includes(t) ? 'primary' : 'outline'}
                onClick={() => toggleTopic(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </fieldset>

        <fieldset className="border border-line-subtle rounded-xl p-4">
          <legend className="px-2 text-sm font-bold uppercase tracking-wide text-action-accent">
            Tùy chọn bảo mật & hình thức
          </legend>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Options 2x2 grid] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Checkbox checked={practiceMode} onCheckedChange={(v) => setPracticeMode(Boolean(v))} label="Chế độ Luyện tập" />
            <Checkbox checked={showAnswers} onCheckedChange={(v) => setShowAnswers(Boolean(v))} label="Hiển thị đáp án sau khi nộp" />
            <Checkbox checked={shuffle} onCheckedChange={(v) => setShuffle(Boolean(v))} label="Tự động đảo câu hỏi & đáp án" />
            <Checkbox checked={lockDevice} onCheckedChange={(v) => setLockDevice(Boolean(v))} label="Khóa 1 thiết bị & Giám sát thi" />
          </div>
        </fieldset>

        <footer className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-2">
          <ButtonLink to="/teacher/rooms" variant="outline" size="md">
            Hủy bỏ
          </ButtonLink>
          <SubmitButton loading={loading} variant="primary" size="md" className="uppercase tracking-wide">
            Lưu cấu hình & chuyển sang nạp đề thi »
          </SubmitButton>
        </footer>
      </Form>
    </Card>
  )
}
