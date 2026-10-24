import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Copy } from 'lucide-react'
import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Input } from '@/components/ui/forms'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useMockExamStore } from '@/stores/mockExamStore'
import { roomStatusLabel, roomStatusTone } from '@/lib/room-status'
import type { RoomStatus } from '@/services/mockData'
import { toast } from '@/lib/toast'

function formatOpenAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

const FILTERS: Array<{ id: 'all' | RoomStatus; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'waiting', label: 'Chờ thi' },
  { id: 'in_progress', label: 'Đang thi' },
  { id: 'finished', label: 'Đã kết thúc' },
]

export default function TeacherRoomsPage() {
  const rooms = useMockExamStore((s) => s.rooms)
  const cloneRoom = useMockExamStore((s) => s.cloneRoom)
  const deleteRoom = useMockExamStore((s) => s.deleteRoom)
  const closeRoomByTeacher = useMockExamStore((s) => s.closeRoomByTeacher)
  const [filter, setFilter] = useState<'all' | RoomStatus>('all')
  const [query, setQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const navigate = useNavigate()

  const filtered = rooms.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.pin.includes(q)
  })

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-3">
      <header className="flex flex-col gap-2">
        <Heading level={1} className="text-lg font-bold">Quản lý danh sách phòng thi</Heading>
        <Text size="xs" tone="muted">
          Tạo mới, nhân bản (clone) nhanh và theo dõi các phòng thi chính thức & luyện tập
        </Text>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Toolbar row] */}
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <ButtonLink to="/teacher/rooms/create" variant="primary" size="sm" leftIcon={<Plus size={14} />}>
            + Tạo phòng thi mới
          </ButtonLink>
          <Input
            id="room-search"
            aria-label="Tìm phòng thi"
            placeholder="Tìm theo tên, mã phòng..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search size={14} />}
            className="h-8 sm:w-64"
          />
        </div>
      </header>

      <nav aria-label="Lọc trạng thái" className="flex flex-wrap gap-1.5">
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

      <Card as="section" className="overflow-x-auto rounded-lg border-line-subtle bg-surface p-2 shadow-none sm:p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên phòng thi & chủ đề</TableHead>
              <TableHead>Hình thức</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác quản trị</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-mono font-bold text-action-accent">{room.code}</TableCell>
                <TableCell>
                  <p className="font-medium">{room.name}</p>
                  <p className="text-xs text-text-muted">
                    {room.topic} · {room.questionCount} câu · {room.members.length} học sinh · PIN {room.pin}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge tone={room.mode === 'official' ? 'danger' : 'accent'} size="sm">
                    {room.mode === 'official' ? 'Thi chính thức' : 'Phòng Luyện tập'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-text-secondary">
                  {room.durationMinutes} phút
                  <br />
                  <span className="text-xs text-text-muted">{formatOpenAt(room.opensAt)}</span>
                </TableCell>
                <TableCell>
                  <Badge tone={roomStatusTone(room.status)} size="sm">
                    {roomStatusLabel(room.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Row action button group] */}
                  <div className="flex flex-wrap justify-end gap-1">
                    {room.status === 'in_progress' ? (
                      <>
                        <Button type="button" size="sm" variant="primary" onClick={() => navigate(`/teacher/rooms/${room.id}/monitor`)}>
                          Giám sát
                        </Button>
                        <Button type="button" size="sm" variant="danger" onClick={() => closeRoomByTeacher(room.id)}>
                          Đóng
                        </Button>
                      </>
                    ) : null}
                    {room.status === 'waiting' ? (
                      <Button type="button" size="sm" variant="outline" onClick={() => navigate(`/teacher/rooms/${room.id}/questions`)}>
                        Sửa đề
                      </Button>
                    ) : null}
                    {room.status === 'finished' ? (
                      <>
                        <Button type="button" size="sm" variant="outline" onClick={() => navigate(`/teacher/rooms/${room.id}/results`)}>
                          Xem điểm
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => toast.success('Đã tạo file CSV (mock)', { description: room.code })}
                        >
                          Xuất
                        </Button>
                      </>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      leftIcon={<Copy size={14} />}
                      onClick={() => {
                        const c = cloneRoom(room.id)
                        if (c) {
                          toast.success(`Đã clone ${c.code}`)
                          navigate(`/teacher/rooms/${c.id}/questions`)
                        }
                      }}
                    >
                      Clone
                    </Button>
                    {room.status === 'waiting' || room.status === 'finished' ? (
                      <Button type="button" size="sm" variant="ghost" onClick={() => setDeleteId(room.id)}>
                        Xóa
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-8">
            Không có phòng thi phù hợp bộ lọc
          </Text>
        ) : null}
      </Card>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Xóa phòng thi?"
        description="Toàn bộ câu hỏi gắn phòng và dữ liệu thành viên mock sẽ bị xóa."
        confirmLabel="Xóa phòng"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={() => {
          if (deleteId) {
            deleteRoom(deleteId)
            toast.success('Đã xóa phòng thi')
            setDeleteId(null)
          }
        }}
      />
    </div>
  )
}
