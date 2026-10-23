// rogym-convention-exempt: ALL [until: 2026-12-31] [Dev data display showcase section - Phase 5 OQ5 isolation]
import { useState, useMemo } from 'react'
import {
  Activity,
  ArrowUpDown,
  CreditCard,
  MoreVertical,
  Trash2,
  User,
  Users,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/actions'
import { Avatar, AvatarGroup, Badge, Card, CardContent, CardDescription, CardFooter, CardHeader, CardMedia, CardRibbon, CardSkeleton, CardTitle, type ColumnDef, ResponsiveTable, StatCard, StatusBadge } from '@/components/ui/data-display'
import { EmptyState, ProgressBar, type ProgressBarTone, Skeleton, SkeletonCircle } from '@/components/ui/feedback'
import { Select, Switch } from '@/components/ui/forms'
import { Separator } from '@/components/ui/layout'
import { Pagination } from '@/components/ui/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/overlay'
import { ComponentPlaygroundCard } from '../components/ComponentPlaygroundCard'
import { SHOWCASE_MEMBERS, type ShowcaseMember } from '../mock-data/showcaseData'
import { toast } from '@/lib/toast'
import strengthImg from '@/assets/package-gallery/package-strength.jpg'

export function DataDisplayShowcase() {
  // Table State
  const [tableSearch, setTableSearch] = useState('')
  const [sortField, setSortField] = useState<'name' | 'joinDate' | 'sessionsLeft'>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [simulateEmpty, setSimulateEmpty] = useState(false)

  // Progress Bar State
  const [progressVal, setProgressVal] = useState(65)
  const [progressTone, setProgressTone] = useState<ProgressBarTone>('accent')

  // Filter & Sort table data
  const filteredMembers = useMemo(() => {
    if (simulateEmpty) return []
    let list = [...SHOWCASE_MEMBERS]
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.plan.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let cmp = 0
      if (sortField === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortField === 'sessionsLeft') cmp = a.sessionsLeft - b.sessionsLeft
      else cmp = a.joinDate.localeCompare(b.joinDate)
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [simulateEmpty, tableSearch, sortField, sortAsc])

  const toggleSelectRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const tableColumns: ColumnDef<ShowcaseMember>[] = [
    {
      key: 'select',
      header: '',
      className: 'w-10',
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedRowIds.includes(row.id)}
          onChange={() => toggleSelectRow(row.id)}
          className="rounded-sm border-white/20 bg-black/40 text-[var(--rogym-teal)] focus:ring-0"
        />
      ),
    },
    {
      key: 'name',
      header: (
        <Button
          variant="plain"
          size="compact"
          type="button"
          onClick={() => {
            if (sortField === 'name') setSortAsc(!sortAsc)
            else {
              setSortField('name')
              setSortAsc(true)
            }
          }}
          className="flex items-center gap-1.5 hover:text-white text-inherit p-0 h-auto"
        >
          <span>Hội viên</span>
          <ArrowUpDown size={12} />
        </Button>
      ),
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={row.name}
            status={row.status === 'active' || row.status === 'checked-in' ? 'online' : 'offline'}
            size="sm"
          />
          <div>
            <p className="font-semibold text-white">{row.name}</p>
            <p className="text-xs text-white/50">{row.code} • {row.rfidCard}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Số điện thoại',
      render: (row) => <span className="font-mono text-xs text-white/80">{row.phone}</span>,
    },
    {
      key: 'plan',
      header: 'Gói tập & Chi nhánh',
      render: (row) => (
        <div>
          <Badge tone={row.plan.includes('VIP') ? 'accent' : 'neutral'} size="sm">
            {row.plan}
          </Badge>
          <p className="text-[11px] text-white/50 mt-0.5">{row.branch}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'sessionsLeft',
      header: (
        <Button
          variant="plain"
          size="compact"
          type="button"
          onClick={() => {
            if (sortField === 'sessionsLeft') setSortAsc(!sortAsc)
            else {
              setSortField('sessionsLeft')
              setSortAsc(true)
            }
          }}
          className="flex items-center gap-1.5 hover:text-white text-inherit p-0 h-auto"
        >
          <span>Buổi PT còn lại</span>
          <ArrowUpDown size={12} />
        </Button>
      ),
      render: (row) => (
        <span className={`text-xs font-semibold ${row.sessionsLeft > 0 ? 'text-[var(--rogym-teal)]' : 'text-white/40'}`}>
          {row.sessionsLeft} buổi
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="icon" size="sm" aria-label="Thao tác">
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info(`Xem hồ sơ hội viên: ${row.name}`)}>
              <User size={14} className="mr-2" /> Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info(`Gia hạn gói cho ${row.name}`)}>
              <CreditCard size={14} className="mr-2" /> Gia hạn gói
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-400"
              onClick={() => toast.error(`Hủy thẻ tập của ${row.name}`)}
            >
              <Trash2 size={14} className="mr-2" /> Hủy hợp đồng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      {/* 1. ResponsiveTable Interactive Sandbox */}
      <ComponentPlaygroundCard
        id="responsive-table"
        title="ResponsiveTable & Pagination Sandbox"
        description="Bảng hiển thị hội viên hỗ trợ tìm kiếm trực tiếp, sắp xếp cột, chọn nhiều dòng thao tác hàng loạt và phân trang."
        badge="Data Table Core"
        controls={
          <div className="flex flex-wrap items-center justify-between gap-4 w-full text-xs">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Gõ để lọc nhanh bảng..."
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-white placeholder:text-white/40"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={simulateEmpty}
                  onChange={(e) => setSimulateEmpty(e.target.checked)}
                  id="table-empty"
                />
                <label htmlFor="table-empty" className="text-white/80 cursor-pointer">
                  Mô phỏng Bảng trống (Empty State)
                </label>
              </div>
            </div>

            {selectedRowIds.length > 0 && (
              <div className="flex items-center gap-2 bg-[var(--rogym-teal)]/10 px-3 py-1 rounded-lg border border-[var(--rogym-teal)]/30">
                <span className="text-[var(--rogym-teal)] font-medium">
                  Đã chọn {selectedRowIds.length} hội viên
                </span>
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => toast.success(`Đã gửi thông báo cho ${selectedRowIds.length} hội viên`)}
                >
                  Gửi thông báo loạt
                </Button>
                <Button size="xs" variant="text-muted" onClick={() => setSelectedRowIds([])}>
                  Bỏ chọn
                </Button>
              </div>
            )}
          </div>
        }
        codeSnippet={`<ResponsiveTable\n  columns={columns}\n  data={filteredData}\n  keyExtractor={row => row.id}\n  emptyTitle="Chưa có hội viên nào"\n/>\n<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />`}
      >
        <div className="space-y-4">
          <ResponsiveTable
            columns={tableColumns}
            data={filteredMembers}
            keyExtractor={(item) => item.id}
            emptyTitle="Không tìm thấy hội viên nào."
            emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc xóa các bộ lọc hiện tại."
          />

          {!simulateEmpty && (
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-white/50">
                Hiển thị {filteredMembers.length} trên {SHOWCASE_MEMBERS.length} hội viên
              </span>
              <Pagination
                page={currentPage}
                totalPages={5}
                onPageChange={(p) => {
                  setCurrentPage(p)
                  toast.info(`Chuyển sang trang: ${p}`)
                }}
              />
            </div>
          )}
        </div>
      </ComponentPlaygroundCard>

      {/* 2. StatCard & Metrics */}
      <ComponentPlaygroundCard
        id="stat-card"
        title="StatCard (Dashboard KPI)"
        description="Thẻ thống kê số liệu tổng quan với icon, chỉ số tăng/giảm và giao diện linh hoạt."
        badge="Analytics Metric"
        codeSnippet={`<StatCard\n  label="Tổng Hội Viên Hoạt Động"\n  value="1,248"\n  icon={<Users className="text-[var(--rogym-teal)]" />}\n  trend={{ value: '+15.4%', isPositive: true, label: 'so với tháng trước' }}\n/>`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Tổng Hội Viên Hoạt Động"
            value="1,248"
            icon={<Users className="text-[var(--rogym-teal)]" />}
            trend={{ value: '+15.4%', isPositive: true, label: 'tháng này' }}
          />
          <StatCard
            label="Doanh Thu Gói Tập"
            value="385.2 Tr"
            icon={<CreditCard className="text-emerald-400" />}
            trend={{ value: '+8.2%', isPositive: true }}
          />
          <StatCard
            label="Hội Viên Sắp Hết Hạn"
            value="42"
            icon={<Activity className="text-amber-400" />}
            trend={{ value: '-3.1%', isPositive: false, label: 'cần gia hạn' }}
          />
          <StatCard
            label="Buổi PT Đã Hoàn Thành"
            value="892"
            icon={<Sparkles className="text-sky-400" />}
            trend={{ value: '+24%', isPositive: true }}
          />
        </div>
      </ComponentPlaygroundCard>

      {/* 3. Cards, Ribbons, Skeletons & Avatars */}
      <div className="grid md:grid-cols-3 gap-6">
        <ComponentPlaygroundCard
          id="card"
          title="Card With Ribbon & Media"
          description="Thẻ dịch vụ với nhãn ruy băng nổi bật, hình ảnh tỉ lệ 16/9 và nút hành động."
          codeSnippet={`<Card className="relative overflow-hidden">\n  <CardRibbon position="top-right" tone="warning">HOT DEAL</CardRibbon>\n  <CardMedia src={img} aspectRatio="16/9" />\n  <CardHeader><CardTitle>Gói VIP 12 Tháng</CardTitle></CardHeader>\n</Card>`}
        >
          <Card className="relative overflow-hidden border-white/10">
            <CardRibbon position="top-right" tone="warning">
              HOT DEAL
            </CardRibbon>
            <CardMedia src={strengthImg} aspectRatio="16/9" alt="VIP Package" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Gói Hội Viên VIP 12 Tháng</CardTitle>
              <CardDescription>Tập luyện 24/7 + 24 buổi huấn luyện PT 1:1</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-white/70">
              <p className="text-xl font-extrabold text-[var(--rogym-teal)]">12.000.000đ</p>
              <p>✓ Miễn phí phòng xông hơi Sauna & tủ đồ cá nhân.</p>
            </CardContent>
            <CardFooter>
              <Button fullWidth variant="primary" size="sm">
                Đăng ký gói ngay
              </Button>
            </CardFooter>
          </Card>
        </ComponentPlaygroundCard>

        <ComponentPlaygroundCard
          id="avatar"
          title="Avatar & AvatarGroup"
          description="Ảnh đại diện cá nhân với chỉ báo trạng thái online/busy/away và avatar nhóm."
          codeSnippet={`<Avatar name="Nguyễn Văn An" status="online" size="lg" />\n<AvatarGroup max={3}>\n  <Avatar name="HV 1" />\n  <Avatar name="HV 2" />\n</AvatarGroup>`}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-white/50 block">Các kích cỡ & trạng thái:</span>
              <div className="flex flex-wrap items-center gap-3">
                <Avatar name="Nguyễn An" status="online" size="xl" />
                <Avatar name="Trần Bình" status="busy" size="lg" />
                <Avatar name="Lê Cường" status="away" size="md" />
                <Avatar name="Minh Đức" status="offline" size="sm" />
                <Avatar name="Thuỳ Linh" size="xs" />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-white/50 block">AvatarGroup (Học viên lớp PT):</span>
              <AvatarGroup max={3}>
                <Avatar name="Học viên 1" />
                <Avatar name="Học viên 2" />
                <Avatar name="Học viên 3" />
                <Avatar name="Học viên 4" />
                <Avatar name="Học viên 5" />
              </AvatarGroup>
            </div>
          </div>
        </ComponentPlaygroundCard>

        <ComponentPlaygroundCard
          title="Card Skeleton Loading"
          description="Khung giữ chỗ placeholder khi dữ liệu đang tải bất đồng bộ."
          codeSnippet={`<CardSkeleton lines={3} />`}
        >
          <div className="space-y-4">
            <CardSkeleton lines={4} />
            <div className="flex items-center gap-3 pt-2">
              <SkeletonCircle size="md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4 rounded-sm" />
                <Skeleton className="h-2.5 w-1/2 rounded-sm" />
              </div>
            </div>
          </div>
        </ComponentPlaygroundCard>
      </div>

      {/* 4. ProgressBar & StatusBadge Matrix */}
      <div className="grid md:grid-cols-2 gap-6">
        <ComponentPlaygroundCard
          title="ProgressBar (Live Slider)"
          description="Thanh tiến trình với thanh trượt điều chỉnh giá trị thực tế và đổi tone màu động."
          controls={
            <div className="flex flex-wrap items-center gap-4 text-xs w-full">
              <div className="flex items-center gap-2">
                <span className="text-white/60">Giá trị ({progressVal}%):</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="w-32 accent-[var(--rogym-teal)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60">Tone:</span>
                <Select
                  value={progressTone}
                  onValueChange={(val) => setProgressTone(val as ProgressBarTone)}
                  className="w-28 text-xs"
                >
                  <option value="accent">accent</option>
                  <option value="neutral">neutral</option>
                  <option value="success">success</option>
                  <option value="warning">warning</option>
                  <option value="danger">danger</option>
                  <option value="info">info</option>
                </Select>
              </div>
            </div>
          }
          codeSnippet={`<ProgressBar\n  value={${progressVal}}\n  tone="${progressTone}"\n  label="Tiến trình hoàn thành lộ trình PT"\n/>`}
        >
          <div className="space-y-4">
            <ProgressBar
              value={progressVal}
              tone={progressTone}
              label={`Tiến trình lộ trình tập luyện (${Math.round((progressVal * 24) / 100)} / 24 buổi)`}
            />
            <ProgressBar value={85} tone="success" label="Thời hạn gói tập (285 / 365 ngày)" />
            <ProgressBar value={20} tone="danger" label="Cảnh báo số buổi PT sắp hết (2 / 10 buổi)" />
          </div>
        </ComponentPlaygroundCard>

        <ComponentPlaygroundCard
          title="StatusBadge & Badge Catalog"
          description="Huy hiệu trạng thái chuẩn hóa của toàn bộ các nghiệp vụ phòng gym."
          codeSnippet={`<StatusBadge status="active" />\n<StatusBadge status="pending" />\n<StatusBadge status="expired" />`}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status="active" />
              <StatusBadge status="checked-in" />
              <StatusBadge status="pending" />
              <StatusBadge status="expired" />
              <StatusBadge status="cancelled" />
              <StatusBadge status="paid" />
              <StatusBadge status="debt" />
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">Badge Accent</Badge>
              <Badge tone="neutral">Badge Neutral</Badge>
              <Badge tone="success">Badge Success</Badge>
              <Badge tone="warning">Badge Warning</Badge>
              <Badge tone="danger">Badge Danger</Badge>
              <Badge tone="info">Badge Info</Badge>
            </div>
          </div>
        </ComponentPlaygroundCard>
      </div>

      {/* 5. EmptyState Showcase */}
      <ComponentPlaygroundCard
        title="EmptyState (Various Sizes & Action Handlers)"
        description="Giao diện hiển thị trạng thái dữ liệu rỗng cho cả bảng, widget hoặc danh sách thông báo."
        codeSnippet={`<EmptyState\n  size="md"\n  title="Chưa có buổi tập nào"\n  description="Bạn chưa đăng ký lịch tập nào trong tuần này."\n  actionLabel="Đặt lịch ngay"\n  onAction={handleBook}\n/>`}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <EmptyState
              size="md"
              title="Chưa có lịch hẹn PT nào"
              description="Bạn chưa có buổi tập nào được lên lịch trong tuần này. Hãy chọn huấn luyện viên và đặt lịch ngay!"
              actionLabel="Đặt lịch PT ngay"
              onAction={() => toast.info('Mở modal đặt lịch PT')}
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <EmptyState
              size="sm"
              title="Không có thông báo mới"
              description="Tất cả thông báo hệ thống đã được đọc."
            />
          </div>
        </div>
      </ComponentPlaygroundCard>
    </div>
  )
}
