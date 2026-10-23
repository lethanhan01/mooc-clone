import { useState } from 'react'
import {
  Users,
  Timer,
  Play,
  Plus,
  BarChart2,
  CheckCircle,
  HelpCircle,
  Radio,
  BookOpen,
} from 'lucide-react'
import {
  Card,
  StatCard,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/data-display'
import { Input } from '@/components/ui/forms'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/lib/toast'

interface ExamRoom {
  id: string
  pin: string
  name: string
  subject: string
  questionsCount: number
  durationMinutes: number
  participants: number
  status: 'waiting' | 'in_progress' | 'finished'
}

const SAMPLE_ROOMS: ExamRoom[] = [
  {
    id: 'room_1',
    pin: '882194',
    name: 'Kiểm tra Giữa kỳ Mạng Máy Tính - Ca 1',
    subject: 'Mạng máy tính (IT3080)',
    questionsCount: 40,
    durationMinutes: 45,
    participants: 58,
    status: 'in_progress',
  },
  {
    id: 'room_2',
    pin: '612903',
    name: 'Phòng thi Lập trình Socket & Hệ phân tán',
    subject: 'Lập trình mạng (IT4060)',
    questionsCount: 30,
    durationMinutes: 30,
    participants: 24,
    status: 'waiting',
  },
  {
    id: 'room_3',
    pin: '109284',
    name: 'Đề thi Thử Kiến trúc Máy tính & HĐH',
    subject: 'Kiến trúc máy tính (IT3030)',
    questionsCount: 50,
    durationMinutes: 60,
    participants: 112,
    status: 'finished',
  },
]

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [pinInput, setPinInput] = useState('')

  function handleJoinByPin() {
    if (!pinInput.trim()) {
      toast.error('Vui lòng nhập mã PIN phòng thi')
      return
    }
    toast.success(`Đang kết nối vào phòng thi PIN #${pinInput}...`)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-line-subtle shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-action-accent/15 text-action-accent">
              <Radio size={12} className="animate-pulse" />
              Realtime Socket Active
            </span>
            <Badge tone="accent" size="sm">Thí sinh</Badge>
          </div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Xin chào, {user?.fullName || 'Thí sinh mooc-clone'}!
          </Heading>
          <Text size="sm" tone="muted" className="mt-1">
            Hệ thống thi trắc nghiệm trực tuyến thời gian thực với đồng bộ socket và đếm ngược.
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink to="/showcase" variant="outline" size="md">UI Showcase</ButtonLink>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => toast.info('Mở modal tạo phòng thi mới')}
          >
            Tạo phòng thi
          </Button>
        </div>
      </section>

      {/* Realtime Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Phòng thi đang mở" value="4" icon={<Radio size={20} />} hint="2 phòng đang diễn ra" />
        <StatCard label="Bài thi đã hoàn thành" value="18" icon={<CheckCircle size={20} />} hint="Điểm trung bình: 8.8" />
        <StatCard label="Câu hỏi luyện tập" value="240" icon={<HelpCircle size={20} />} hint="+35 câu trong tuần" />
        <StatCard label="Tỷ lệ trả lời đúng" value="87.5%" icon={<BarChart2 size={20} />} hint="Top 10% thí sinh xuất sắc" />
      </section>

      {/* Quick Join Room by PIN */}
      <Card as="section" className="p-5 bg-surface border-line-subtle shadow-card rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading level={3} className="text-base font-bold text-text-primary">Tham gia phòng thi bằng mã PIN</Heading>
          <Text size="xs" tone="muted" className="mt-0.5">Nhập 6 số mã PIN do giảng viên cung cấp để vào phòng chờ</Text>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="exam-pin-input"
            aria-label="Mã PIN phòng thi"
            placeholder="Ví dụ: 882194"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-36 text-center font-mono tracking-widest uppercase"
          />
          <Button variant="primary" size="sm" onClick={handleJoinByPin} leftIcon={<Play size={14} />}>
            Vào phòng
          </Button>
        </div>
      </Card>

      {/* Active Exam Rooms Table */}
      <Card as="section" className="p-6 bg-surface border-line-subtle shadow-card rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Heading level={2} className="text-lg font-bold text-text-primary">Danh sách phòng thi trực tuyến</Heading>
            <Text size="xs" tone="muted">Cập nhật trạng thái thời gian thực qua WebSockets</Text>
          </div>
          <ButtonLink to="/exams" variant="ghost" size="sm">Xem tất cả phòng</ButtonLink>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên phòng thi / Môn học</TableHead>
              <TableHead className="text-center">Mã PIN</TableHead>
              <TableHead className="text-center">Thời lượng</TableHead>
              <TableHead className="text-center">Số câu</TableHead>
              <TableHead className="text-center">Thí sinh</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SAMPLE_ROOMS.map((room) => {
              const statusBadge =
                room.status === 'in_progress' ? (
                  <Badge tone="accent" size="sm">Đang diễn ra</Badge>
                ) : room.status === 'waiting' ? (
                  <Badge tone="warning" size="sm">Chưa bắt đầu</Badge>
                ) : (
                  <Badge tone="neutral" size="sm">Đã kết thúc</Badge>
                )

              return (
                <TableRow key={room.id}>
                  <TableCell>
                    <div className="font-medium text-text-primary">{room.name}</div>
                    <div className="text-xs text-text-muted">{room.subject}</div>
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-action-accent">{room.pin}</TableCell>
                  <TableCell className="text-center text-text-secondary">
                    <span className="inline-flex items-center gap-1"><Timer size={14} /> {room.durationMinutes} phút</span>
                  </TableCell>
                  <TableCell className="text-center text-text-secondary">{room.questionsCount}</TableCell>
                  <TableCell className="text-center text-text-secondary">
                    <span className="inline-flex items-center gap-1"><Users size={14} /> {room.participants}</span>
                  </TableCell>
                  <TableCell className="text-center">{statusBadge}</TableCell>
                  <TableCell className="text-right">
                    {room.status === 'finished' ? (
                      <Button variant="outline" size="sm" onClick={() => toast.info('Xem bảng kết quả và xếp hạng')}>
                        Xem kết quả
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => toast.success(`Tham gia phòng ${room.pin}`)}>
                        Tham gia
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Practice Mode Card */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card as="article" className="p-6 bg-surface border-line-subtle shadow-card rounded-2xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-action-accent/15 text-action-accent flex items-center justify-center mb-3">
              <BookOpen size={20} />
            </div>
            <Heading level={3} className="text-lg font-bold text-text-primary">Chế độ Luyện tập Tự do</Heading>
            <Text size="sm" tone="muted" className="mt-1">
              Ôn luyện câu hỏi theo từng chủ đề hoặc độ khó (Dễ, Trung bình, Khó). Xem ngay giải thích chi tiết sau mỗi câu.
            </Text>
          </div>
          <div className="mt-4 pt-4 border-t border-line-subtle flex items-center justify-between">
            <span className="text-xs text-text-muted">Hơn 500+ câu hỏi trắc nghiệm</span>
            <Button variant="outline" size="sm" onClick={() => toast.info('Bắt đầu chế độ luyện tập')}>
              Bắt đầu luyện tập
            </Button>
          </div>
        </Card>

        <Card as="article" className="p-6 bg-surface border-line-subtle shadow-card rounded-2xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-action-accent/15 text-action-accent flex items-center justify-center mb-3">
              <BarChart2 size={20} />
            </div>
            <Heading level={3} className="text-lg font-bold text-text-primary">Lịch sử & Biểu đồ Thống kê</Heading>
            <Text size="sm" tone="muted" className="mt-1">
              Theo dõi tiến độ học tập, biểu đồ điểm số theo thời gian và đánh giá những phần kiến thức cần cải thiện.
            </Text>
          </div>
          <div className="mt-4 pt-4 border-t border-line-subtle flex items-center justify-between">
            <span className="text-xs text-text-muted">Cập nhật sau mỗi bài thi</span>
            <Button variant="outline" size="sm" onClick={() => toast.info('Xem biểu đồ chi tiết')}>
              Xem biểu đồ
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
