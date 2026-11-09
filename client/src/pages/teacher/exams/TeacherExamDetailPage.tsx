import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Download, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { FormField, Input } from '@/components/ui/forms'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import { toast } from '@/lib/toast'

export default function TeacherExamDetailPage() {
  const { examId = '' } = useParams()
  const exam = useMockTeacherStore((s) => s.exams.find((e) => e.id === examId))
  const questions = useMockTeacherStore((s) => s.questions)
  const updateExamTitle = useMockTeacherStore((s) => s.updateExamTitle)
  const addQuestionToExam = useMockTeacherStore((s) => s.addQuestionToExam)
  const removeQuestionFromExam = useMockTeacherStore((s) => s.removeQuestionFromExam)
  const moveExamQuestion = useMockTeacherStore((s) => s.moveExamQuestion)
  const [title, setTitle] = useState(exam?.title ?? '')
  const [pickId, setPickId] = useState('')

  if (!exam) {
    return <Text tone="muted">Không tìm thấy đề thi mock.</Text>
  }

  const examQuestions = exam.questionIds
    .map((id) => questions.find((q) => q.id === id))
    .filter((q) => q != null)
  const bankPool = questions.filter((q) => q.bankId === exam.bankId && !exam.questionIds.includes(q.id))

  function downloadStub(kind: 'csv' | 'pdf' | 'docx') {
    const body =
      kind === 'csv'
        ? examQuestions.map((q, i) => `${i + 1},"${q.content}"`).join('\n')
        : `MOCK ${kind.toUpperCase()} — ${title}\n\n` + examQuestions.map((q, i) => `${i + 1}. ${q.content}`).join('\n')
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${examId}.${kind === 'csv' ? 'csv' : 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Đã xuất bản stub ${kind.toUpperCase()} (mock)`)
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Heading level={1} className="text-lg font-bold">
          Chi tiết đề
        </Heading>
        <ButtonLink to="/teacher/exams" variant="outline" size="sm">
          Danh sách đề
        </ButtonLink>
      </header>

      <Card as="section" className="space-y-3 border border-line-subtle bg-surface-card p-4 shadow-none">
        <FormField id="exam-title" label="Tên đề (sửa tay)">
          <Input id="exam-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => {
            updateExamTitle(exam.id, title.trim() || exam.title)
            toast.success('Đã lưu tên đề (mock)')
          }}
        >
          Lưu tên đề
        </Button>
        <Text size="sm" tone="muted">
          Thời gian: {exam.durationMinutes} phút · {examQuestions.length} câu
        </Text>
      </Card>

      <Card as="section" className="space-y-3 border border-line-subtle bg-surface-card p-4 shadow-none">
        <Heading level={2} className="text-sm font-bold">
          Câu trong đề
        </Heading>
        <ol className="m-0 list-none space-y-2 p-0">
          {examQuestions.map((q, index) => (
            <li key={q.id} className="flex flex-col gap-2 rounded-lg border border-line-subtle px-3 py-2 sm:flex-row sm:items-center">
              <Text size="sm" className="flex-1">
                {index + 1}. {q.content}
              </Text>
              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Question row actions] */}
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Đưa lên"
                  disabled={index === 0}
                  onClick={() => moveExamQuestion(exam.id, q.id, -1)}
                >
                  <ArrowUp size={14} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Đưa xuống"
                  disabled={index === examQuestions.length - 1}
                  onClick={() => moveExamQuestion(exam.id, q.id, 1)}
                >
                  <ArrowDown size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 size={14} />}
                  onClick={() => {
                    removeQuestionFromExam(exam.id, q.id)
                    toast.success('Đã xóa câu khỏi đề')
                  }}
                >
                  Xóa
                </Button>
              </div>
            </li>
          ))}
        </ol>
        {examQuestions.length === 0 ? <Text size="sm" tone="muted">Đề chưa có câu nào.</Text> : null}

        <FormField id="exam-add-question" label="Thêm câu từ bộ nguồn">
          <select
            id="exam-add-question"
            className="min-h-11 w-full rounded-lg border border-line-subtle bg-surface-card px-3"
            value={pickId}
            onChange={(e) => setPickId(e.target.value)}
          >
            <option value="">— Chọn câu —</option>
            {bankPool.map((q) => (
              <option key={q.id} value={q.id}>
                {q.content}
              </option>
            ))}
          </select>
        </FormField>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!pickId}
          onClick={() => {
            addQuestionToExam(exam.id, pickId)
            setPickId('')
            toast.success('Đã thêm câu vào đề')
          }}
        >
          Thêm vào đề
        </Button>
      </Card>

      <footer className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={() => downloadStub('csv')}>
          Xuất CSV
        </Button>
        <Button type="button" variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={() => downloadStub('pdf')}>
          Xuất PDF (stub)
        </Button>
        <Button type="button" variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={() => downloadStub('docx')}>
          Xuất Word (stub)
        </Button>
      </footer>
    </div>
  )
}
