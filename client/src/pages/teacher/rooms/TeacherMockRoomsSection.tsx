import { Card } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'

export function TeacherMockRoomsSection() {
  const rooms = useMockTeacherStore((s) => s.rooms)
  const banks = useMockTeacherStore((s) => s.banks)

  return (
    <section aria-label="Phòng mock UI" className="space-y-2">
      <Heading level={2} className="text-sm font-bold">
        Phòng mock
      </Heading>
      <ul className="m-0 list-none space-y-2 p-0">
        {rooms.map((item) => {
          const bank = banks.find((entry) => entry.id === item.questionBankId)
          return (
            <li key={item.id}>
              <Card
                as="article"
                className="flex flex-col gap-2 border border-line-subtle bg-surface-card p-3 shadow-none sm:flex-row sm:items-center sm:justify-between"
              >
                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Mock room meta] */}
                <div>
                  <p className="m-0 font-medium text-fg-primary">{item.name}</p>
                  <Text size="xs" tone="muted">
                    {item.mode} · {item.status} · {item.assigneeIds.length}/{item.capacity} SV
                    {bank ? ` · Ngân hàng: ${bank.name}` : ' · Chưa chọn ngân hàng'}
                  </Text>
                </div>
                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Mock room actions] */}
                <div className="flex flex-wrap gap-2">
                  <ButtonLink to={`/teacher/rooms/${item.id}/edit`} variant="outline" size="sm">
                    Chỉnh sửa
                  </ButtonLink>
                  <ButtonLink to={`/teacher/rooms/${item.id}/assign`} variant="outline" size="sm">
                    Phân SV
                  </ButtonLink>
                  <ButtonLink to={`/teacher/rooms/${item.id}/logs`} variant="ghost" size="sm">
                    Log
                  </ButtonLink>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
