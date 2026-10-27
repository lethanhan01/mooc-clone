import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, RefreshCw } from 'lucide-react'
import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Input } from '@/components/ui/forms'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useRoomsListQuery } from '@/hooks/queries'
import { roomStatusLabel, roomStatusTone, formatDuration } from '@/lib/room-status'
import type { RoomStatus } from '@/types'

const FILTERS: Array<{ id: 'all' | 'waiting' | 'in_progress' | 'finished'; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'waiting', label: 'Chờ mở' },
  { id: 'in_progress', label: 'Đang thi' },
  { id: 'finished', label: 'Đã đóng' },
]

export default function StudentRoomsPage() {
  const { data: rooms = [], isLoading, refetch } = useRoomsListQuery()
  const [filter, setFilter] = useState<'all' | 'waiting' | 'in_progress' | 'finished'>('all')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filtered = rooms.filter((r) => {
    const s = r.status?.toUpperCase()
    if (filter === 'waiting' && s !== 'WAITING' && r.status !== 'waiting') return false
    if (filter === 'in_progress' && s !== 'RUNNING' && r.status !== 'in_progress') return false
    if (filter === 'finished' && s !== 'ENDED' && r.status !== 'finished') return false

    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      r.roomName.toLowerCase().includes(q) ||
      r.roomCode.toLowerCase().includes(q) ||
      (r.ownerDisplayName && r.ownerDisplayName.toLowerCase().includes(q))
    )
  })

  function goRoom(roomCode: string, status: RoomStatus | string) {
    const s = status?.toUpperCase()
    if (s === 'WAITING' || status === 'waiting') {
      navigate(`/student/rooms/${roomCode}/waiting`)
    } else if (s === 'RUNNING' || status === 'in_progress') {
      navigate(`/student/rooms/${roomCode}/exam`)
    } else {
      navigate(`/student/rooms/${roomCode}/summary`)
    }
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page stack] */
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header bar] */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Heading level={1} className="text-2xl font-extrabold">
              Danh sách phòng thi trực tuyến
            </Heading>
            <Text size="sm" tone="muted">
              Chọn phòng theo trạng thái: chờ thi · đang thi · xem điểm kết quả
            </Text>
          </div>
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
          id="student-room-search"
          aria-label="Tìm phòng thi"
          placeholder="Tìm theo tên, mã phòng..."
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
              <TableHead>Mã phòng</TableHead>
              <TableHead>Tên phòng thi & Giáo viên</TableHead>
              <TableHead className="text-center">Số câu</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((room) => {
              const isRunning = room.status?.toUpperCase() === 'RUNNING' || room.status === 'in_progress'
              const isWaiting = room.status?.toUpperCase() === 'WAITING' || room.status === 'waiting'

              return (
                <TableRow key={room.id}>
                  <TableCell className="font-mono font-bold text-action-accent">{room.roomCode}</TableCell>
                  <TableCell>
                    <p className="font-medium">{room.roomName}</p>
                    <p className="text-xs text-text-muted">
                      Chủ phòng: {room.ownerDisplayName || 'Hệ thống'} · {room.participantsCount} thí sinh
                    </p>
                  </TableCell>
                  <TableCell className="text-center">{room.totalQuestions}</TableCell>
                  <TableCell className="text-sm text-text-secondary">
                    {formatDuration(room.durationSeconds)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge tone={roomStatusTone(room.status)} size="sm">
                      {roomStatusLabel(room.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant={isRunning ? 'primary' : 'outline'}
                      onClick={() => goRoom(room.roomCode, room.status)}
                    >
                      {isRunning ? 'Làm bài' : isWaiting ? 'Vào phòng chờ' : 'Xem kết quả'}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 ? (
          <Text size="sm" tone="muted" className="text-center py-8">
            Không có phòng thi nào phù hợp bộ lọc
          </Text>
        ) : null}
      </Card>
    </div>
  )
}
