import { Card, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'

export default function TeacherExamsPage() {
  const exams = useMockTeacherStore((s) => s.exams)
  const banks = useMockTeacherStore((s) => s.banks)

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-lg font-bold">
            Quản lý đề thi
          </Heading>
          <Text size="xs" tone="muted">
            Các biến thể đề đã sinh từ ngân hàng (mock)
          </Text>
        </div>
        <ButtonLink to="/teacher/exams/generate" variant="primary" size="sm">
          Sinh đề mới
        </ButtonLink>
      </header>

      <ul className="m-0 list-none space-y-3 p-0">
        {exams.map((exam) => {
          const bank = banks.find((b) => b.id === exam.bankId)
          return (
            <li key={exam.id}>
              <Card as="article" className="border border-line-subtle bg-surface-card p-4 shadow-none">
                <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <Heading level={2} className="text-base font-bold">
                    {exam.title}
                  </Heading>
                  <Badge tone="info" size="sm">
                    Mã {exam.variantIndex}
                  </Badge>
                </header>
                <Text size="sm" tone="muted" className="mb-3 block">
                  Bộ: {bank?.name ?? exam.bankId} · {exam.questionIds.length} câu · {exam.durationMinutes} phút · tỉ lệ{' '}
                  {exam.easyRatio}/{exam.mediumRatio}/{exam.hardRatio}
                </Text>
                <ButtonLink to={`/teacher/exams/${exam.id}`} variant="primary" size="sm">
                  Xem / sửa / xuất
                </ButtonLink>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
