import { BookOpen, Layers3 } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'

export default function TeacherDashboardPage() {
  const semesters = useMockTeacherStore((s) => s.semesters)
  const selectedSemesterId = useMockTeacherStore((s) => s.selectedSemesterId)
  const setSemester = useMockTeacherStore((s) => s.setSemester)
  const subjects = useMockTeacherStore((s) => s.subjects)
  const banks = useMockTeacherStore((s) => s.banks)
  const rooms = useMockTeacherStore((s) => s.rooms)

  const visibleSubjects = subjects.filter((sub) => sub.semesterId === selectedSemesterId)

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page vertical stack] */
    <div className="space-y-4">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title stack] */}
        <div>
          <Heading level={1} className="text-lg font-bold text-fg-primary">
            Tổng quan giáo viên
          </Heading>
          <Text size="xs" tone="muted">
            Danh sách môn theo kỳ — mock UI, chưa nối backend
          </Text>
        </div>
        <label className="flex items-center gap-2 text-sm text-fg-secondary">
          <span>Kỳ học</span>
          <select
            className="min-h-11 rounded-lg border border-line-subtle bg-surface-card px-3 text-fg-primary"
            value={selectedSemesterId}
            onChange={(e) => setSemester(e.target.value)}
          >
            {semesters.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.label}
                {sem.current ? ' (hiện tại)' : ''}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Thống kê nhanh">
        <Card as="article" className="border border-line-subtle bg-surface-card p-4 shadow-none">
          <Text size="xs" tone="muted">
            Môn trong kỳ
          </Text>
          <p className="m-0 text-2xl font-bold text-fg-primary">{visibleSubjects.length}</p>
        </Card>
        <Card as="article" className="border border-line-subtle bg-surface-card p-4 shadow-none">
          <Text size="xs" tone="muted">
            Bộ câu hỏi
          </Text>
          <p className="m-0 text-2xl font-bold text-fg-primary">{banks.length}</p>
        </Card>
        <Card as="article" className="border border-line-subtle bg-surface-card p-4 shadow-none">
          <Text size="xs" tone="muted">
            Phòng thi mock
          </Text>
          <p className="m-0 text-2xl font-bold text-fg-primary">{rooms.length}</p>
        </Card>
      </section>

      <section aria-label="Danh sách môn" className="space-y-3">
        <header className="flex items-center justify-between gap-2">
          <Heading level={2} className="text-sm font-bold">
            Môn học
          </Heading>
          <ButtonLink to="/teacher/question-banks" variant="primary" size="sm" leftIcon={<Layers3 size={14} />}>
            Ngân hàng câu hỏi
          </ButtonLink>
        </header>

        {visibleSubjects.length === 0 ? (
          <Text tone="muted">Không có môn nào trong kỳ đã chọn.</Text>
        ) : (
          <ul className="m-0 list-none space-y-3 p-0">
            {visibleSubjects.map((subject) => {
              const bankCount = banks.filter((b) => b.subjectId === subject.id).length
              const roomCount = rooms.filter((r) => r.subjectId === subject.id).length
              return (
                <li key={subject.id}>
                  <Card
                    as="article"
                    className="flex flex-col gap-3 border border-line-subtle bg-surface-card p-4 shadow-none sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Subject meta] */}
                    <div className="min-w-0 space-y-1">
                      <Heading level={3} className="text-base font-bold">
                        {subject.code} — {subject.name}
                      </Heading>
                      <Text size="xs" tone="muted">
                        {subject.department} · {bankCount} bộ câu hỏi · {roomCount} phòng
                      </Text>
                      <Badge tone="info" size="sm">
                        {semesters.find((s) => s.id === selectedSemesterId)?.label}
                      </Badge>
                    </div>
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Subject actions] */}
                    <div className="flex flex-wrap gap-2">
                      <ButtonLink
                        to={`/teacher/question-banks?subjectId=${subject.id}`}
                        variant="outline"
                        size="sm"
                        leftIcon={<BookOpen size={14} />}
                      >
                        Ngân hàng
                      </ButtonLink>
                      <ButtonLink to="/teacher/rooms" variant="primary" size="sm">
                        Phòng thi
                      </ButtonLink>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
