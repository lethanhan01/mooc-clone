import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Form, FormField, Input } from '@/components/ui/forms'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import { toast } from '@/lib/toast'

export default function TeacherExamGeneratePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const banks = useMockTeacherStore((s) => s.banks)
  const generateExams = useMockTeacherStore((s) => s.generateExams)

  const [bankId, setBankId] = useState(searchParams.get('bankId') || banks[0]?.id || '')
  const [count, setCount] = useState('30')
  const [classSize, setClassSize] = useState('100')
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [easyRatio, setEasyRatio] = useState('40')
  const [mediumRatio, setMediumRatio] = useState('40')
  const [hardRatio, setHardRatio] = useState('20')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const papers = generateExams({
      bankId,
      count: Number(count) || 1,
      durationMinutes: Number(durationMinutes) || 60,
      easyRatio: Number(easyRatio) || 0,
      mediumRatio: Number(mediumRatio) || 0,
      hardRatio: Number(hardRatio) || 0,
    })
    toast.success(`Đã sinh ${papers.length} đề (tỉ lệ ${count}/${classSize} theo lớp)`)
    navigate('/teacher/exams')
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header>
        <Heading level={1} className="text-lg font-bold">
          Sinh nhiều đề thi
        </Heading>
        <Text size="sm" tone="muted">
          Ví dụ lớp 100 SV → sinh 30 đề, mỗi SV nhận ngẫu nhiên 1/30
        </Text>
      </header>

      <Card as="section" className="border border-line-subtle bg-surface-card p-4 shadow-none">
        <Form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField id="gen-bank" label="Bộ câu hỏi" required>
            <select
              id="gen-bank"
              className="min-h-11 w-full rounded-lg border border-line-subtle bg-surface-card px-3"
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
            >
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="gen-class" label="Sĩ số lớp (tham chiếu)">
            <Input id="gen-class" type="number" min={1} value={classSize} onChange={(e) => setClassSize(e.target.value)} />
          </FormField>
          <FormField id="gen-count" label="Số đề sinh ra" required>
            <Input id="gen-count" type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} />
          </FormField>
          <FormField id="gen-duration" label="Thời gian làm bài (phút)" required>
            <Input
              id="gen-duration"
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </FormField>
          <FormField id="gen-easy" label="% dễ">
            <Input id="gen-easy" type="number" value={easyRatio} onChange={(e) => setEasyRatio(e.target.value)} />
          </FormField>
          <FormField id="gen-med" label="% trung bình">
            <Input id="gen-med" type="number" value={mediumRatio} onChange={(e) => setMediumRatio(e.target.value)} />
          </FormField>
          <FormField id="gen-hard" label="% khó">
            <Input id="gen-hard" type="number" value={hardRatio} onChange={(e) => setHardRatio(e.target.value)} />
          </FormField>
          <footer className="flex flex-wrap gap-2 md:col-span-2">
            <SubmitButton>Sinh đề</SubmitButton>
            <ButtonLink to="/teacher/exams" variant="outline" size="md">
              Hủy
            </ButtonLink>
          </footer>
        </Form>
      </Card>
    </div>
  )
}
