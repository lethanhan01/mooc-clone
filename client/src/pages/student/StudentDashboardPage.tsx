import { History } from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { ButtonLink } from '@/components/ui/actions'
import { CourseCard } from '@/components/student/CourseCard'
import { PasswordReminderBanner } from '@/components/student/PasswordReminderBanner'
import { MOCK_STUDENT_COURSES } from '@/mocks/teacher-workflow.fixtures'
import { useAuthStore } from '@/stores/authStore'

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title] */}
        <div>
          <Heading level={1} className="text-2xl font-bold text-fg-primary">
            Khóa học của tôi
          </Heading>
          <Text size="sm" tone="muted">
            Xin chào {user?.fullName ?? user?.email ?? 'sinh viên'} — danh sách phòng/môn được phân (mock)
          </Text>
        </div>
        <ButtonLink to="/student/history" variant="outline" size="sm" leftIcon={<History size={14} />}>
          Lịch sử
        </ButtonLink>
      </header>

      <PasswordReminderBanner />

      <ul className="m-0 list-none space-y-4 p-0">
        {MOCK_STUDENT_COURSES.map((course) => (
          <li key={course.id}>
            <CourseCard
              title={course.title}
              department={course.department}
              code={course.code}
              statusLabel={course.statusLabel}
              ended={course.ended}
              href={course.href}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
