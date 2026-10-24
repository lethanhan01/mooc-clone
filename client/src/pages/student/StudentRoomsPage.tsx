import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Input } from '@/components/ui/forms'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useMockExamStore } from '@/stores/mockExamStore'
import { roomStatusLabel, roomStatusTone } from '@/lib/room-status'
import type { RoomStatus } from '@/services/mockData'

const FILTERS: Array<{ id: 'all' | RoomStatus; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'waiting', label: 'Chờ mở' },
  { id: 'in_progress', label: 'Đang thi' },
  { id: 'finished', label: 'Đã đóng' },
]

export default function StudentRoomsPage() {
  const rooms = useMockExamStore((s) => s.rooms)
  const submissions = useMockExamStore((s) => s.submissions)
  const [filter, setFilter] = useState<'all' | RoomStatus>('all')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filtered = rooms.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q)
  })

  function goRoom(roomId: string, status: RoomStatus) {
    if (status === 'waiting') navigate(`/student/rooms/${roomId}/waiting`)
    else if (status === 'in_progress') navigate(`/student/rooms/${roomId}/exam`)
    else navigate(`/student/rooms/${roomId}/summary`)
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <Heading level={1} className="text-2xl font-extrabold">
          Danh sách phòng thi
        </Heading>
        <Text size="sm" tone="muted">
          Chọn phòng theo trạng thái: chờ · đang thi · xem kết quả
        </Text>
        <Input
          id="student-room-search"
          aria-label="Tìm phòng thi"
          placeholder="Tìm theo tên, mã, chủ đề..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search size={16} />}
          className="sm:max-w-sm"
        />
      </header>

      <nav aria-label="Lọc trạng thái" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.id}
            type="button"
            size="sm"
            variant={filter === f.id ? 'primary' : 'outline'}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </nav>

      <Card as="section" className="p-4 sm:p-6 bg-surface border-line-subtle shadow-card rounded-2xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên & chủ đề</TableHead>
              <TableHead>Hình thức</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((room) => {
              const hasSub = submissions.some((s) => s.roomId === room.id)
              return (
                <TableRow key={room.id}>
                  <TableCell className="font-mono font-bold text-action-accent">{room.code}</TableCell>
                  <TableCell>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-xs text-text-muted">
                      {room.topic} · {room.questionCount} câu · {room.durationMinutes} phút
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge tone={room.mode === 'official' ? 'danger' : 'warning'} size="sm">
                      {room.mode === 'official' ? 'Chính thức' : 'Luyện tập'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge tone={roomStatusTone(room.status)} size="sm">
                      {roomStatusLabel(room.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Row actions] */}
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button type="button" size="sm" variant="primary" onClick={() => goRoom(room.id, room.status)}>
                        {room.status === 'waiting'
                          ? 'Phòng chờ'
                          : room.status === 'in_progress'
                            ? 'Làm bài'
                            : 'Kết quả'}
                      </Button>
                      {room.status === 'finished' || hasSub ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/student/rooms/${room.id}/review`)}
                        >
                          Xem lại
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-8">
            Không có phòng phù hợp
          </Text>
        ) : null}
      </Card>
    </div>
  )
}
