import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Input } from '@/components/ui/forms'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useRoomsListQuery, useDeleteRoomMutation, useFinishRoomMutation } from '@/hooks/queries'
import { roomStatusLabel, roomStatusTone, formatDuration } from '@/lib/room-status'
import type { RoomStatus } from '@/types'
import { toast } from '@/lib/toast'

const FILTERS: Array<{ id: 'all' | 'waiting' | 'in_progress' | 'finished'; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'waiting', label: 'Chờ thi' },
  { id: 'in_progress', label: 'Đang thi' },
  { id: 'finished', label: 'Đã kết thúc' },
]

export default function TeacherRoomsPage() {
  const { data: rooms = [], isLoading, refetch } = useRoomsListQuery()
  const deleteRoomMutation = useDeleteRoomMutation()
  const finishRoomMutation = useFinishRoomMutation()

  const [filter, setFilter] = useState<'all' | 'waiting' | 'in_progress' | 'finished'>('all')
  const [query, setQuery] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const navigate = useNavigate()

  const filtered = rooms.filter((r) => {
    const statusUpper = r.status?.toUpperCase()
    if (filter === 'waiting' && statusUpper !== 'WAITING' && r.status !== 'waiting') return false
    if (filter === 'in_progress' && statusUpper !== 'RUNNING' && r.status !== 'in_progress') return false
    if (filter === 'finished' && statusUpper !== 'ENDED' && r.status !== 'finished') return false

    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      r.roomName.toLowerCase().includes(q) ||
      r.roomCode.toLowerCase().includes(q) ||
      (r.ownerDisplayName && r.ownerDisplayName.toLowerCase().includes(q))
    )
  })

  async function handleCloseRoom(roomCode: string) {
    try {
      await finishRoomMutation.mutateAsync(roomCode)
      toast.success(`Đã kết thúc phòng thi ${roomCode}`)
    } catch {
      toast.error('Không thể kết thúc phòng thi')
    }
  }

  async function handleDeleteRoom() {
    if (!deleteId) return
    try {
      await deleteRoomMutation.mutateAsync(deleteId)
      toast.success('Đã xóa phòng thi thành công')
      setDeleteId(null)
    } catch {
      toast.error('Không thể xóa phòng thi')
    }
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-3">
      <header className="flex flex-col gap-2">
        <Heading level={1} className="text-lg font-bold">
          Quản lý danh sách phòng thi
        </Heading>
        <Text size="xs" tone="muted">
          Tạo mới và theo dõi các phòng thi chính thức & luyện tập trực tiếp từ database
        </Text>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Toolbar row] */}
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Buttons row] */}
          <div className="flex items-center gap-2">
            <ButtonLink to="/teacher/rooms/create" variant="primary" size="sm" leftIcon={<Plus size={14} />}>
              Tạo phòng thi mới
            </ButtonLink>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              leftIcon={<RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />}
              onClick={() => refetch()}
            >
              Làm mới
            </Button>
          </div>
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
              <TableHead>Tên phòng thi & Người tạo</TableHead>
              <TableHead className="text-center">Số câu</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác quản trị</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((room) => {
              const statusUpper = room.status?.toUpperCase()
              const isRunning = statusUpper === 'RUNNING' || room.status === 'in_progress'
              const isWaiting = statusUpper === 'WAITING' || room.status === 'waiting'
              const isEnded = statusUpper === 'ENDED' || room.status === 'finished'

              return (
                <TableRow key={room.id}>
                  <TableCell className="font-mono font-bold text-action-accent">{room.roomCode}</TableCell>
                  <TableCell>
                    <p className="font-medium">{room.roomName}</p>
                    <p className="text-xs text-text-muted">
                      Chủ phòng: {room.ownerDisplayName || 'Hệ thống'} · {room.participantsCount} thí sinh
                    </p>
                  </TableCell>
                  <TableCell className="text-center text-sm">{room.totalQuestions}</TableCell>
                  <TableCell className="text-sm text-text-secondary">
                    {formatDuration(room.durationSeconds)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge tone={roomStatusTone(room.status)} size="sm">
                      {roomStatusLabel(room.status as RoomStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Row action button group] */}
                    <div className="flex flex-wrap justify-end gap-1">
                      {isRunning ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            onClick={() => navigate(`/teacher/rooms/${room.roomCode}/monitor`)}
                          >
                            Giám sát
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            onClick={() => handleCloseRoom(room.roomCode)}
                          >
                            Đóng
                          </Button>
                        </>
                      ) : null}
                      {isWaiting ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/teacher/rooms/${room.roomCode}/questions`)}
                        >
                          Sửa đề
                        </Button>
                      ) : null}
                      {isEnded ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/teacher/rooms/${room.roomCode}/results`)}
                        >
                          Xem điểm
                        </Button>
                      ) : null}
                      {isWaiting || isEnded ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(room.id)}
                        >
                          Xóa
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
            Không có phòng thi phù hợp bộ lọc
          </Text>
        ) : null}
      </Card>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Xóa phòng thi?"
        description="Phòng thi sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu."
        confirmLabel="Xóa phòng"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleDeleteRoom}
      />
    </div>
  )
}
