import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'
import type { Difficulty } from '@/mocks/teacher-workflow.fixtures'
import { toast } from '@/lib/toast'

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length <= 1) return []
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    return {
      content: cols[0] ?? '',
      options: [cols[1] ?? '', cols[2] ?? '', cols[3] ?? '', cols[4] ?? ''].filter(Boolean),
      answer: cols[5] ?? 'A',
      difficulty: (cols[6] as Difficulty) || 'EASY',
      topic: cols[7] ?? 'Chung',
    }
  })
}

const SAMPLE = `content,A,B,C,D,answer,difficulty,topic
HTTP method nào dùng để tạo tài nguyên?,GET,POST,PUT,DELETE,B,EASY,Mạng
TCP đảm bảo điều gì?,Tốc độ,Độ tin cậy,Nén,Mã hóa,B,MEDIUM,Mạng`

export default function TeacherQuestionImportPage() {
  const { bankId = '' } = useParams()
  const navigate = useNavigate()
  const importQuestionsCsv = useMockTeacherStore((s) => s.importQuestionsCsv)
  const bank = useMockTeacherStore((s) => s.banks.find((b) => b.id === bankId))
  const [raw, setRaw] = useState(SAMPLE)
  const preview = parseCsv(raw)

  if (!bank) {
    return <Text tone="muted">Không tìm thấy bộ câu hỏi.</Text>
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-4">
      <header>
        <Heading level={1} className="text-lg font-bold">
          Nạp câu hỏi CSV
        </Heading>
        <Text size="sm" tone="muted">
          Bộ: {bank.name}
        </Text>
      </header>

      <Card as="section" className="space-y-3 border border-line-subtle bg-surface-card p-4 shadow-none">
        <Text size="sm">
          Cột gợi ý: <code>content,A,B,C,D,answer,difficulty,topic</code>
        </Text>
        <label className="block text-sm font-medium" htmlFor="csv-raw">
          Nội dung CSV
        </label>
        <textarea
          id="csv-raw"
          className="min-h-40 w-full rounded-lg border border-line-subtle bg-action-accent-soft p-3 font-mono text-sm"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <Text size="xs" tone="muted">
          Xem trước: {preview.length} câu sẽ được nạp
        </Text>
        <footer className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              const count = importQuestionsCsv(bankId, preview)
              toast.success(`Đã nạp ${count} câu hỏi (mock)`)
              navigate(`/teacher/question-banks/${bankId}`)
            }}
          >
            Xác nhận nạp
          </Button>
          <ButtonLink to={`/teacher/question-banks/${bankId}`} variant="outline" size="sm">
            Hủy
          </ButtonLink>
        </footer>
      </Card>
    </div>
  )
}
