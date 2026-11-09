import { useState } from 'react'
import { Card } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import { toast } from '@/lib/toast'

const SAMPLE = `username,fullName,email
20236001,Lê Văn C,c.lv236001@sis.hust.edu.vn
20236002,Phạm Thị D,d.pt236002@sis.hust.edu.vn`

export default function TeacherStudentsImportPage() {
  const students = useMockTeacherStore((s) => s.students)
  const importStudents = useMockTeacherStore((s) => s.importStudents)
  const [raw, setRaw] = useState(SAMPLE)

  function handleImport() {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(1)
    const rows = lines.map((line) => {
      const [username, fullName, email] = line.split(',').map((c) => c.trim())
      return { username, fullName, email }
    })
    const created = importStudents(rows)
    toast.success(`Đã import ${created.length} tài khoản — SV sẽ đổi mật khẩu lần đầu`)
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header>
        <Heading level={1} className="text-lg font-bold">
          Đăng ký sinh viên (CSV)
        </Heading>
        <Text size="sm" tone="muted">
          Giáo viên import danh sách — hệ thống sinh mật khẩu tạm (mock)
        </Text>
      </header>

      <Card as="section" className="space-y-3 border border-line-subtle bg-surface-card p-4 shadow-none">
        <label htmlFor="stu-csv" className="block text-sm font-medium">
          CSV: username,fullName,email
        </label>
        <textarea
          id="stu-csv"
          className="min-h-32 w-full rounded-lg border border-line-subtle bg-action-accent-soft p-3 font-mono text-sm"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <Button type="button" variant="primary" size="sm" onClick={handleImport}>
          Import tài khoản
        </Button>
      </Card>

      <Card as="section" className="border border-line-subtle bg-surface-card p-4 shadow-none">
        <Heading level={2} className="mb-3 text-sm font-bold">
          Tài khoản hiện có ({students.length})
        </Heading>
        <ul className="m-0 list-none space-y-2 p-0">
          {students.map((stu) => (
            <li key={stu.id} className="rounded-lg border border-line-subtle px-3 py-2 text-sm">
              {stu.fullName} · {stu.username} · mk tạm: <code>{stu.tempPassword}</code>
              {stu.mustChangePassword ? ' · cần đổi MK' : ''}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
