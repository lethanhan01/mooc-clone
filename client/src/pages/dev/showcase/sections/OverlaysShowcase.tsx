// rogym-convention-exempt: ALL [until: 2026-12-31] [Dev overlays showcase section - Phase 5 OQ5 isolation]
import { useState } from 'react'
import {
  CreditCard,
  HelpCircle,
  MoreVertical,
  Sliders,
  Sparkles,
  Trash2,
  User,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/actions'
import { FormField, Input, Select } from '@/components/ui/forms'
import { ConfirmDialog, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, Modal, type ModalSize, Popover, PopoverContent, PopoverTrigger, Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, type SheetSide, SheetTitle, Tooltip } from '@/components/ui/overlay'
import { ComponentPlaygroundCard } from '../components/ComponentPlaygroundCard'
import { toast } from '@/lib/toast'

export function OverlaysShowcase() {
  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSize, setModalSize] = useState<ModalSize>('lg')

  // Confirm Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmVariant, setConfirmVariant] = useState<'danger' | 'primary'>('danger')
  const [confirmLoading, setConfirmLoading] = useState(false)

  // Sheet (Drawer) State
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetSide, setSheetSide] = useState<SheetSide>('right')
  const [sheetBranch, setSheetBranch] = useState('q1')

  // Dropdown Menu State
  const [dropdownCheck, setDropdownCheck] = useState(true)
  const [dropdownRadio, setDropdownRadio] = useState('pt_1')

  const handleConfirmAction = () => {
    setConfirmLoading(true)
    setTimeout(() => {
      setConfirmLoading(false)
      setConfirmOpen(false)
      toast.success('Đã thực thi hành động xác nhận thành công!')
    }, 1200)
  }

  return (
    <div className="space-y-8">
      {/* 1. Modal & Dialogs */}
      <ComponentPlaygroundCard
        id="modal"
        title="Modal Dialog (Radix Primitive)"
        description="Hộp thoại trung tâm hiển thị nội dung chi tiết hoặc biểu mẫu nhập liệu với hiệu ứng backdrop và focus trapping."
        badge="Overlay Foundation"
        controls={
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-white/60">Modal Size:</span>
            {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as ModalSize[]).map((size) => (
              <Button
                key={size}
                size="xs"
                variant={modalSize === size ? 'primary' : 'outline-white'}
                onClick={() => {
                  setModalSize(size)
                  setModalOpen(true)
                }}
              >
                Mở Size {size.toUpperCase()}
              </Button>
            ))}
          </div>
        }
        codeSnippet={`<Modal\n  open={open}\n  onClose={() => setOpen(false)}\n  size="${modalSize}"\n  title="Thông tin chi tiết Buổi tập PT"\n  description="Mã buổi tập #SES-9821. HLV phụ trách: Alex Mercer."\n  footer={\n    <>\n      <Button variant="secondary" onClick={() => setOpen(false)}>Đóng</Button>\n      <Button variant="primary">Lưu thay đổi</Button>\n    </>\n  }\n>\n  {/* Modal Content */}\n</Modal>`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Mở Modal Test ({modalSize.toUpperCase()})
          </Button>

          <Button
            variant="danger"
            onClick={() => {
              setConfirmVariant('danger')
              setConfirmOpen(true)
            }}
          >
            Mở ConfirmDialog (Danger)
          </Button>

          <Button
            variant="outline-white"
            onClick={() => {
              setConfirmVariant('primary')
              setConfirmOpen(true)
            }}
          >
            Mở ConfirmDialog (Primary)
          </Button>
        </div>

        {/* Modal Implementation */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          size={modalSize}
          title="Thông tin chi tiết Buổi tập PT"
          description="Mã buổi tập #SES-9821. Huấn luyện viên phụ trách: Alex Mercer."
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setModalOpen(false)
                  toast.success('Đã lưu thông tin buổi tập!')
                }}
              >
                Lưu xác nhận
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2 text-sm text-white/80">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Họ tên hội viên">
                <Input defaultValue="Nguyễn Văn An (MEM-001)" disabled />
              </FormField>
              <FormField label="Khung giờ tập">
                <Input defaultValue="08:00 - 09:00, Thứ Hai" />
              </FormField>
            </div>
            <FormField label="Ghi chú buổi tập & Bài tập trọng tâm">
              <Input defaultValue="Tập ngực & tay sau. Khởi động kỹ khớp vai trước khi nâng tạ nặng." />
            </FormField>
          </div>
        </Modal>

        {/* ConfirmDialog Implementation */}
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmAction}
          title={confirmVariant === 'danger' ? 'Xác nhận hủy hợp đồng hội viên?' : 'Tạm dừng gói tập (Bảo lưu)?'}
          description={
            confirmVariant === 'danger'
              ? 'Hành động này sẽ vô hiệu hóa thẻ tập của hội viên ngay lập tức và không thể hoàn tác.'
              : 'Gói tập sẽ được tạm dừng tính ngày trong vòng tối đa 30 ngày.'
          }
          variant={confirmVariant}
          confirmLabel={confirmLoading ? 'Đang xử lý...' : 'Xác nhận thực hiện'}
        />
      </ComponentPlaygroundCard>

      {/* 2. Sheet (Sliding Drawer) */}
      <ComponentPlaygroundCard
        id="sheet"
        title="Sheet (Sliding Drawer)"
        description="Ngăn kéo trượt từ 4 cạnh màn hình (phải, dưới, trái, trên) rất hữu ích cho form chỉnh sửa nhanh và tối ưu màn hình điện thoại."
        badge="Drawer Primitive"
        controls={
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-white/60">Hướng trượt (Side):</span>
            {(['right', 'bottom', 'left', 'top'] as SheetSide[]).map((side) => (
              <Button
                key={side}
                size="xs"
                variant={sheetSide === side ? 'primary' : 'outline-white'}
                onClick={() => {
                  setSheetSide(side)
                  setSheetOpen(true)
                }}
              >
                Trượt từ {side.toUpperCase()}
              </Button>
            ))}
          </div>
        }
        codeSnippet={`<Sheet open={open} onOpenChange={setOpen}>\n  <SheetContent side="${sheetSide}">\n    <SheetHeader>\n      <SheetTitle>Chỉnh sửa nhanh</SheetTitle>\n    </SheetHeader>\n  </SheetContent>\n</Sheet>`}
      >
        <div>
          <Button variant="primary" onClick={() => setSheetOpen(true)}>
            Mở Sheet từ cạnh [{sheetSide.toUpperCase()}]
          </Button>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side={sheetSide}>
            <SheetHeader>
              <SheetTitle>Cập nhật hồ sơ hội viên</SheetTitle>
              <SheetDescription>Chỉnh sửa thông tin liên hệ và thẻ RFID hội viên.</SheetDescription>
            </SheetHeader>

            <div className="space-y-4 py-6 text-sm">
              <FormField label="Số điện thoại liên hệ">
                <Input defaultValue="0901 234 567" />
              </FormField>
              <FormField label="Mã thẻ RFID">
                <Input defaultValue="RFID-984210" />
              </FormField>
              <FormField label="Chi nhánh đăng ký">
                <Select value={sheetBranch} onValueChange={setSheetBranch}>
                  <option value="q1">Chi nhánh Quận 1</option>
                  <option value="q3">Chi nhánh Quận 3</option>
                  <option value="q7">Chi nhánh Quận 7</option>
                </Select>
              </FormField>
            </div>

            <SheetFooter>
              <Button variant="secondary" onClick={() => setSheetOpen(false)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setSheetOpen(false)
                  toast.success('Đã lưu thay đổi từ Sheet!')
                }}
              >
                Lưu cập nhật
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </ComponentPlaygroundCard>

      {/* 3. Dropdown Menu, Popover & Tooltip */}
      <div className="grid md:grid-cols-2 gap-6">
        <ComponentPlaygroundCard
          id="dropdown-menu"
          title="DropdownMenu (Multi-level & Controls)"
          description="Menu ngữ cảnh hỗ trợ submenu nhiều tầng, checkbox lọc, radio group và phím tắt phím nóng."
          codeSnippet={`<DropdownMenu>\n  <DropdownMenuTrigger asChild>\n    <Button variant="dark">Tùy chọn</Button>\n  </DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>\n    <DropdownMenuSub>...</DropdownMenuSub>\n  </DropdownMenuContent>\n</DropdownMenu>`}
        >
          <div className="space-y-4">
            <p className="text-xs text-white/70">
              Nhấn vào nút bên dưới để mở menu tương tác đa tầng:
            </p>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="dark" leftIcon={<MoreVertical size={16} />}>
                    Menu Thao tác Nâng cao
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Hồ sơ hội viên</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => toast.info('Xem chi tiết hội viên')}>
                    <User size={14} className="mr-2" />
                    <span>Xem hồ sơ chi tiết</span>
                    <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => toast.info('Mở màn hình gia hạn')}>
                    <CreditCard size={14} className="mr-2" />
                    <span>Gia hạn gói tập</span>
                  </DropdownMenuItem>

                  {/* Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Zap size={14} className="mr-2" />
                      <span>Đổi trạng thái thẻ</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                      <DropdownMenuItem onClick={() => toast.success('Đã đổi sang: Đang hoạt động')}>
                        Hoạt động (Active)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.warning('Đã đổi sang: Tạm bảo lưu')}>
                        Bảo lưu (Pending)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.error('Đã đổi sang: Hết hạn')}>
                        Hết hạn (Expired)
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  {/* Checkbox Item */}
                  <DropdownMenuCheckboxItem
                    checked={dropdownCheck}
                    onCheckedChange={setDropdownCheck}
                  >
                    Gửi SMS khi check-in
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuSeparator />

                  {/* Radio Group */}
                  <DropdownMenuLabel>Chế độ tập luyện</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={dropdownRadio} onValueChange={setDropdownRadio}>
                    <DropdownMenuRadioItem value="pt_1">Huấn luyện 1-1</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="group">Lớp nhóm (Group)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="free">Tự do (Free gym)</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Trash2 size={14} className="mr-2" />
                    <span>Hủy hợp đồng</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </ComponentPlaygroundCard>

        <ComponentPlaygroundCard
          title="Popover & Tooltip"
          description="Popover chứa nội dung form lọc nhanh và Tooltip giải thích ngữ cảnh khi hover."
          codeSnippet={`<Popover>\n  <PopoverTrigger><Button>Lọc nhanh</Button></PopoverTrigger>\n  <PopoverContent>Nội dung form</PopoverContent>\n</Popover>\n\n<Tooltip content="Mô tả trợ giúp">\n  <Button variant="icon"><HelpCircle size={16} /></Button>\n</Tooltip>`}
        >
          <div className="space-y-4">
            <p className="text-xs text-white/70">
              Popover linh hoạt chứa form nhập liệu và Tooltip nổi trên hover:
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline-green" leftIcon={<Sliders size={16} />}>
                    Mở Popover Lọc
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 space-y-3 p-4">
                  <h4 className="text-sm font-bold text-white">Lọc trạng thái thanh toán</h4>
                  <p className="text-xs text-white/60">Chọn trạng thái hóa đơn cần xuất báo cáo.</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input type="checkbox" defaultChecked /> Đã thanh toán đủ
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input type="checkbox" /> Còn nợ phí
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <Button size="xs" variant="primary" onClick={() => toast.success('Đã áp dụng')}>
                      Áp dụng
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Tooltip content="Hệ thống tự động đồng bộ thẻ quẹt sau mỗi 5 giây">
                <Button variant="icon" aria-label="Trợ giúp">
                  <HelpCircle size={18} className="text-sky-400" />
                </Button>
              </Tooltip>

              <Tooltip content="Hội viên này thuộc nhóm khách hàng VIP của phòng gym">
                <Button variant="icon" aria-label="Thông tin VIP">
                  <Sparkles size={18} className="text-amber-400" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </ComponentPlaygroundCard>
      </div>
    </div>
  )
}
