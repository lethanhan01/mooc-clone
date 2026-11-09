import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileUp, Plus, Search, Wand2 } from 'lucide-react'
import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Form, FormField, Input } from '@/components/ui/forms'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import { toast } from '@/lib/toast'

export default function TeacherQuestionBankDetailPage() {
  const { bankId = '' } = useParams()
  const banks = useMockTeacherStore((s) => s.banks)
  const questions = useMockTeacherStore((s) => s.questions)
  const subjects = useMockTeacherStore((s) => s.subjects)

  const bank = banks.find((b) => b.id === bankId)
  const bankQuestions = questions.filter((q) => q.bankId === bankId)
  const subject = subjects.find((s) => s.id === bank?.subjectId)
  const deleteQuestion = useMockTeacherStore((s) => s.deleteQuestion)
  const updateBank = useMockTeacherStore((s) => s.updateBank)
  const [keyword, setKeyword] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)
  const [nameDraft, setNameDraft] = useState<{ bankId: string; name: string } | null>(null)
  const bankName = nameDraft?.bankId === bankId ? nameDraft.name : (bank?.name ?? '')

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

  const query = appliedQuery.trim().toLowerCase()
  const visibleQuestions = bankQuestions.filter((question) => {
    if (!query) return true
    const haystack = [question.content, question.topic, question.difficulty, ...question.options.map((option) => option.content)]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })

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
          <Form
            className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
            aria-label="Đổi tên bộ đề"
            onSubmit={(event) => {
              event.preventDefault()
              const nextName = bankName.trim()
              if (!nextName) {
                toast.error('Nhập tên bộ đề')
                return
              }
              updateBank(bank.id, { name: nextName })
              toast.success('Đã lưu tên bộ đề')
            }}
          >
            <FormField id="bank-name" label="Tên bộ đề" required className="sm:min-w-72 sm:flex-1">
              <Input
                id="bank-name"
                value={bankName}
                onChange={(event) => setNameDraft({ bankId, name: event.target.value })}
                required
              />
            </FormField>
            <SubmitButton variant="outline" size="sm" className="min-h-11">
              Lưu tên
            </SubmitButton>
          </Form>
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Actions] */}
        <div className="flex flex-wrap gap-2">
          <ButtonLink to={`/teacher/question-banks/${bank.id}/import`} variant="outline" size="sm" leftIcon={<FileUp size={14} />}>
            Nạp CSV
          </ButtonLink>
          <ButtonLink to={`/teacher/question-banks/${bank.id}/questions/new`} variant="outline" size="sm" leftIcon={<Plus size={14} />}>
            Thêm câu
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
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Question search row] */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <Input
            id="question-search"
            aria-label="Tìm câu hỏi"
            placeholder="Nội dung, chủ đề hoặc đáp án"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            leftIcon={<Search size={14} />}
            className="min-h-11 sm:flex-1"
          />
          <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => setAppliedQuery(keyword)}>
            Tìm kiếm
          </Button>
          {appliedQuery ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11"
              onClick={() => {
                setKeyword('')
                setAppliedQuery('')
              }}
            >
              Xóa lọc
            </Button>
          ) : null}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nội dung</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Chủ đề</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleQuestions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="max-w-md">
                  <ButtonLink
                    to={`/teacher/question-banks/${bank.id}/questions/${q.id}`}
                    variant="ghost"
                    size="sm"
                    className="h-auto min-h-11 justify-start whitespace-normal px-0 text-left font-normal text-fg-primary"
                  >
                    {q.content}
                  </ButtonLink>
                </TableCell>
                <TableCell>{q.type}</TableCell>
                <TableCell>{q.difficulty}</TableCell>
                <TableCell>{q.topic}</TableCell>
                <TableCell className="text-right">
                  <Button type="button" variant="danger" size="sm" onClick={() => setDeleteQuestionId(q.id)}>
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {visibleQuestions.length === 0 ? (
          <Text size="sm" tone="muted" className="py-6 text-center">
            Không có câu hỏi khớp từ khóa.
          </Text>
        ) : null}
      </Card>
      <ConfirmDialog
        open={Boolean(deleteQuestionId)}
        onClose={() => setDeleteQuestionId(null)}
        title="Xóa câu hỏi?"
        description={
          visibleQuestions.find((question) => question.id === deleteQuestionId)?.content ??
          'Câu hỏi này sẽ bị xóa khỏi bộ.'
        }
        confirmLabel="Xóa câu hỏi"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={() => {
          if (!deleteQuestionId) return
          deleteQuestion(deleteQuestionId)
          setDeleteQuestionId(null)
          toast.success('Đã xóa câu hỏi')
        }}
      />
    </div>
  )
}
