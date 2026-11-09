import { useParams } from 'react-router-dom'
import { FileUp, Plus, Wand2 } from 'lucide-react'
import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'

export default function TeacherQuestionBankDetailPage() {
  const { bankId = '' } = useParams()
  const banks = useMockTeacherStore((s) => s.banks)
  const questions = useMockTeacherStore((s) => s.questions)
  const subjects = useMockTeacherStore((s) => s.subjects)

  const bank = banks.find((b) => b.id === bankId)
  const bankQuestions = questions.filter((q) => q.bankId === bankId)
  const subject = subjects.find((s) => s.id === bank?.subjectId)

  if (!bank) {
    return (
      <Card as="section" className="border border-line-subtle p-6 text-center shadow-none">
        <Text tone="muted">Không tìm thấy bộ câu hỏi mock.</Text>
        <ButtonLink to="/teacher/question-banks" variant="outline" size="sm" className="mt-3">
          Quay lại danh sách
        </ButtonLink>
      </Card>
    )
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-lg font-bold">
            {bank.name}
          </Heading>
          <Text size="sm" tone="muted">
            {subject?.code} · {bank.description}
          </Text>
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Actions] */}
        <div className="flex flex-wrap gap-2">
          <ButtonLink to={`/teacher/question-banks/${bank.id}/import`} variant="outline" size="sm" leftIcon={<FileUp size={14} />}>
            Nạp CSV
          </ButtonLink>
          <ButtonLink to={`/teacher/question-banks/${bank.id}/questions/new`} variant="outline" size="sm" leftIcon={<Plus size={14} />}>
            Thêm câu (form)
          </ButtonLink>
          <ButtonLink
            to={`/teacher/exams/generate?bankId=${bank.id}`}
            variant="primary"
            size="sm"
            leftIcon={<Wand2 size={14} />}
          >
            Sinh đề
          </ButtonLink>
        </div>
      </header>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Tags] */}
      <div className="flex flex-wrap gap-1.5">
        {bank.tags.map((tag) => (
          <Badge key={tag} tone="info" size="sm">
            {tag}
          </Badge>
        ))}
      </div>

      <Card as="section" className="border border-line-subtle bg-surface-card p-3 shadow-none sm:p-4">
        <Heading level={2} className="mb-3 text-sm font-bold">
          Danh sách câu hỏi ({bankQuestions.length})
        </Heading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nội dung</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Chủ đề</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankQuestions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="max-w-md truncate">{q.content}</TableCell>
                <TableCell>{q.type}</TableCell>
                <TableCell>{q.difficulty}</TableCell>
                <TableCell>{q.topic}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
