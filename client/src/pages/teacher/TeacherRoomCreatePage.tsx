import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input, Checkbox } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useCreateRoomMutation } from '@/hooks/queries'
import { toast } from '@/lib/toast'

const DEFAULT_TOPICS = [
  'Mạng máy tính',
  'Cơ sở dữ liệu',
  'Kiến trúc máy tính',
  'Lập trình Web',
  'An toàn thông tin',
]

export default function TeacherRoomCreatePage() {
  const createRoomMutation = useCreateRoomMutation()
  const navigate = useNavigate()

  const [name, setName] = useState('Ôn tập & Thi thử: IT4549 - Phát triển ứng dụng Web')
  const [roomCode, setRoomCode] = useState(() => `EXAM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`)
  const [topic, setTopic] = useState('Công nghệ thông tin')
  const [durationMinutes, setDurationMinutes] = useState(45)
  const [easy, setEasy] = useState(4)
  const [medium, setMedium] = useState(4)
  const [hard, setHard] = useState(2)
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Mạng máy tính'])
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  function toggleTopic(t: string) {
    setSelectedTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  async function handleSubmit() {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Nhập tên phòng thi'
    if (!roomCode.trim()) next.roomCode = 'Nhập mã phòng thi'
    if (durationMinutes < 1) next.duration = 'Thời lượng tối thiểu 1 phút'
    if (easy + medium + hard < 1) next.diff = 'Cần ít nhất 1 câu hỏi theo độ khó'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    setLoading(true)
    try {
      const room = await createRoomMutation.mutateAsync({
        roomCode: roomCode.trim().toUpperCase(),
        name: name.trim(),
        description: `Chủ đề: ${selectedTopics.join(', ') || topic}`,
        topic: topic.trim(),
        easyCount: easy,
        mediumCount: medium,
        hardCount: hard,
        visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
        durationSeconds: durationMinutes * 60,
        maxParticipants: 100,
      })
      toast.success('Đã lưu cấu hình phòng thi vào database', {
        description: `Mã phòng: ${room.roomCode}`,
      })
      navigate(`/teacher/rooms/${room.roomCode}/questions`)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Không thể tạo phòng thi'
          : 'Có lỗi xảy ra khi tạo phòng thi'
      toast.error('Tạo phòng thất bại', { description: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card as="article" className="p-6 sm:p-8 bg-surface border-line-subtle shadow-card rounded-2xl space-y-6">
      <header>
        <Heading level={1} className="text-xl sm:text-2xl font-extrabold">
          Cài đặt phòng thi mới (Database Sync)
        </Heading>
        <Text size="sm" tone="muted" className="mt-1">
          Cấu hình số câu theo độ khó (Dễ / Trung bình / Khó). Server sẽ rút đề trực tiếp từ ngân hàng câu hỏi.
        </Text>
      </header>

      <Form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField id="room-name" label="Tên phòng thi / Kỳ thi:" error={errors.name} required>
          <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Create-room meta grid] */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="room-code" label="Mã phòng thi (duy nhất):" error={errors.roomCode} required>
            <Input id="room-code" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} />
          </FormField>
          <FormField id="room-topic" label="Chủ đề phân môn:">
            <Input id="room-topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </FormField>
          <FormField id="room-duration" label="Thời lượng làm bài (phút):" error={errors.duration} required>
            <Input
              id="room-duration"
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </FormField>
          <FormField id="room-visibility" label="Phạm vi phòng thi:">
            <Checkbox
              checked={isPublic}
              onCheckedChange={(v) => setIsPublic(Boolean(v))}
              label="Công khai cho toàn bộ sinh viên (PUBLIC)"
            />
          </FormField>
        </div>

        <fieldset className="border border-line-subtle rounded-xl p-4">
          <legend className="px-2 text-sm font-bold text-text-primary">Số câu theo độ khó *</legend>
          {errors.diff ? (
            <Text size="xs" className="text-tone-danger mb-2">
              {errors.diff}
            </Text>
          ) : null}
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Difficulty counts grid] */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField id="diff-easy" label="Dễ (EASY)">
              <Input
                id="diff-easy"
                type="number"
                min={0}
                value={easy}
                onChange={(e) => setEasy(Number(e.target.value))}
              />
            </FormField>
            <FormField id="diff-medium" label="Trung bình (MEDIUM)">
              <Input
                id="diff-medium"
                type="number"
                min={0}
                value={medium}
                onChange={(e) => setMedium(Number(e.target.value))}
              />
            </FormField>
            <FormField id="diff-hard" label="Khó (HARD)">
              <Input
                id="diff-hard"
                type="number"
                min={0}
                value={hard}
                onChange={(e) => setHard(Number(e.target.value))}
              />
            </FormField>
          </div>
          <Text size="xs" tone="muted" className="mt-2">
            Tổng câu dự kiến: {easy + medium + hard}
          </Text>
        </fieldset>

        <fieldset className="border border-line-subtle rounded-xl p-4">
          <legend className="px-2 text-sm font-bold">Chủ đề câu hỏi trong ngân hàng</legend>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Topic chips wrap] */}
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TOPICS.map((t) => (
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

        <footer className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-2">
          <ButtonLink to="/teacher/rooms" variant="outline" size="md">
            Hủy bỏ
          </ButtonLink>
          <SubmitButton loading={loading} variant="primary" size="md" className="uppercase tracking-wide">
            Lưu cấu hình phòng thi »
          </SubmitButton>
        </footer>
      </Form>
    </Card>
  )
}
