import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Copy, Plus } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Form, FormField, Input, Textarea } from '@/components/ui/forms'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import { toast } from '@/lib/toast'

export default function TeacherQuestionBanksPage() {
  const [searchParams] = useSearchParams()
  const filterSubjectId = searchParams.get('subjectId') ?? ''
  const banks = useMockTeacherStore((s) => s.banks)
  const subjects = useMockTeacherStore((s) => s.subjects)
  const createBank = useMockTeacherStore((s) => s.createBank)
  const cloneBank = useMockTeacherStore((s) => s.cloneBank)
  const deleteBank = useMockTeacherStore((s) => s.deleteBank)
  const [deleteBankId, setDeleteBankId] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [subjectId, setSubjectId] = useState(filterSubjectId || subjects[0]?.id || '')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const visibleBanks = useMemo(
    () => (filterSubjectId ? banks.filter((b) => b.subjectId === filterSubjectId) : banks),
    [banks, filterSubjectId]
  )

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string | undefined> = {}
    if (!name.trim()) next.name = 'Nhập tên bộ câu hỏi'
    if (!subjectId) next.subjectId = 'Chọn môn'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const bank = createBank({
      name: name.trim(),
      subjectId,
      description: description.trim(),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
    toast.success(`Đã tạo bộ “${bank.name}”`)
    setShowCreate(false)
    setName('')
    setDescription('')
    setTags('')
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-lg font-bold">
            Ngân hàng câu hỏi
          </Heading>
          <Text size="xs" tone="muted">
            Tạo bộ, nhân bản, nạp câu hỏi — dữ liệu mock
          </Text>
        </div>
        <Button type="button" variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Đóng form' : 'Tạo bộ mới'}
        </Button>
      </header>

      {showCreate ? (
        <Card as="section" className="border border-line-subtle bg-surface-card p-4 shadow-none">
          <Form onSubmit={handleCreate} noValidate className="space-y-3">
            <FormField
              id="bank-name"
              label="Tên bộ câu hỏi"
              error={errors.name}
              required
            >
              <Input
                id="bank-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setErrors((prev) => ({ ...prev, name: undefined }))
                }}
              />
            </FormField>
            <FormField id="bank-subject" label="Môn" error={errors.subjectId} required>
              <select
                id="bank-subject"
                className="min-h-11 w-full rounded-lg border border-line-subtle bg-surface-card px-3"
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value)
                  setErrors((prev) => ({ ...prev, subjectId: undefined }))
                }}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="bank-desc" label="Mô tả">
              <Textarea id="bank-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </FormField>
            <FormField id="bank-tags" label="Tags" hint="Cách nhau bởi dấu phẩy">
              <Input id="bank-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="cuối kỳ, ITSS" />
            </FormField>
            <Button type="submit" variant="primary" size="sm">
              Lưu bộ câu hỏi
            </Button>
          </Form>
        </Card>
      ) : null}

      <ul className="m-0 list-none space-y-3 p-0">
        {visibleBanks.map((bank) => {
          const subject = subjects.find((s) => s.id === bank.subjectId)
          return (
            <li key={bank.id}>
              <Card as="article" className="border border-line-subtle bg-surface-card p-4 shadow-none">
                <header className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <Heading level={2} className="text-base font-bold">
                    {bank.name}
                  </Heading>
                  <Badge tone="neutral" size="sm">
                    {bank.questionCount} câu
                  </Badge>
                </header>
                <Text size="sm" tone="muted" className="mb-2 block">
                  {subject?.code} · {bank.description}
                </Text>
                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Tag row] */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {bank.tags.map((tag) => (
                    <Badge key={tag} tone="info" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <footer className="flex flex-wrap gap-2">
                  <ButtonLink to={`/teacher/question-banks/${bank.id}`} variant="primary" size="sm">
                    Chi tiết
                  </ButtonLink>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Copy size={14} />}
                    onClick={() => {
                      const cloned = cloneBank(bank.id)
                      if (cloned) toast.success(`Đã nhân bản “${cloned.name}”`)
                    }}
                  >
                    Nhân bản
                  </Button>
                  <Button type="button" variant="danger" size="sm" onClick={() => setDeleteBankId(bank.id)}>
                    Xóa
                  </Button>
                </footer>
              </Card>
            </li>
          )
        })}
      </ul>
      <ConfirmDialog
        open={Boolean(deleteBankId)}
        onClose={() => setDeleteBankId(null)}
        title="Xóa bộ câu hỏi?"
        description={`Bộ “${banks.find((bank) => bank.id === deleteBankId)?.name ?? ''}” và các câu hỏi bên trong sẽ bị xóa.`}
        confirmLabel="Xóa bộ"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={() => {
          if (!deleteBankId) return
          deleteBank(deleteBankId)
          setDeleteBankId(null)
          toast.success('Đã xóa bộ câu hỏi')
        }}
      />
    </div>
  )
}
