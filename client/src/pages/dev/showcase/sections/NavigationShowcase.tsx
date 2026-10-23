// rogym-convention-exempt: ALL [until: 2026-12-31] [Dev navigation showcase section - Phase 5 OQ5 isolation]
import { useState } from 'react'
import {
  Calendar,
  Check,
  FileText,
  LayoutGrid,
  List,
} from 'lucide-react'
import { Button } from '@/components/ui/actions'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/data-display'
import { PageEmptyState, PageErrorState, PageHeader, PageSkeleton, Separator } from '@/components/ui/layout'
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, SegmentedControl, type StepItem, Stepper } from '@/components/ui/navigation'
import { LanguageSwitcher } from '@/components/ui/typography'
import { ComponentPlaygroundCard } from '../components/ComponentPlaygroundCard'
import { toast } from '@/lib/toast'

export function NavigationShowcase() {
  // PageUI State Switcher
  const [pageUiMode, setPageUiMode] = useState<'header' | 'skeleton' | 'empty' | 'error'>('header')

  // Segmented Control State
  const [viewMode, setViewMode] = useState('grid')

  // Stepper State
  const [activeStep, setActiveStep] = useState(1)

  const stepsData: StepItem[] = [
    { title: 'Chọn hội viên', description: 'Tìm theo mã hoặc SĐT' },
    { title: 'Chọn gói tập', description: 'Gói VIP 12M / Tiêu chuẩn' },
    { title: 'Thanh toán', description: 'Tiền mặt / VNPay QR' },
    { title: 'Kích hoạt', description: 'In biên lai & cấp thẻ' },
  ]

  const handleNextStep = () => {
    if (activeStep < stepsData.length - 1) {
      setActiveStep((prev) => prev + 1)
      toast.success(`Chuyển sang ${stepsData[activeStep + 1].title}`)
    } else {
      toast.success('Đã hoàn thành toàn bộ quy trình đăng ký!')
    }
  }

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1)
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. PageUI Ecosystem */}
      <ComponentPlaygroundCard
        id="page-ui"
        title="PageUI Ecosystem (Header, Skeleton & States)"
        description="Bộ giao diện khung trang chuẩn hóa cho mọi phân hệ (Member, Trainer, Staff, Owner)."
        badge="Layout Core"
        controls={
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/60">Chế độ hiển thị:</span>
            <Button
              size="xs"
              variant={pageUiMode === 'header' ? 'primary' : 'outline-white'}
              onClick={() => setPageUiMode('header')}
            >
              PageHeader Chuẩn
            </Button>
            <Button
              size="xs"
              variant={pageUiMode === 'skeleton' ? 'primary' : 'outline-white'}
              onClick={() => setPageUiMode('skeleton')}
            >
              PageSkeleton (Loading)
            </Button>
            <Button
              size="xs"
              variant={pageUiMode === 'empty' ? 'primary' : 'outline-white'}
              onClick={() => setPageUiMode('empty')}
            >
              PageEmptyState
            </Button>
            <Button
              size="xs"
              variant={pageUiMode === 'error' ? 'primary' : 'outline-white'}
              onClick={() => setPageUiMode('error')}
            >
              PageErrorState
            </Button>
          </div>
        }
        codeSnippet={`<PageHeader\n  eyebrow="Quản lý Hội viên"\n  title="Hồ sơ Hội viên VIP"\n  description="Quản lý thông tin hợp đồng, lịch sử tập luyện và thanh toán."\n  actions={<Button variant="primary">Chỉnh sửa</Button>}\n/>`}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          {pageUiMode === 'header' && (
            <PageHeader
              eyebrow="Quản lý Hội viên"
              title="Hồ sơ Hội viên: Nguyễn Văn An (MEM-001)"
              description="Theo dõi chi tiết hợp đồng gói VIP 12 Tháng, lịch sử quẹt thẻ RFID và tiến trình tập luyện cá nhân."
              actions={
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" leftIcon={<FileText size={14} />}>
                    Xuất PDF
                  </Button>
                  <Button size="sm" variant="primary">
                    Chỉnh sửa hồ sơ
                  </Button>
                </div>
              }
            />
          )}

          {pageUiMode === 'skeleton' && <PageSkeleton />}

          {pageUiMode === 'empty' && (
            <PageEmptyState
              title="Chưa có hồ sơ nào"
              description="Hãy thêm hội viên đầu tiên để bắt đầu quản lý phòng tập."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setPageUiMode('header')
                    toast.success('Chuyển sang form tạo mới')
                  }}
                >
                  Thêm hội viên mới
                </Button>
              }
            />
          )}

          {pageUiMode === 'error' && (
            <PageErrorState
              message="Đã xảy ra lỗi khi kết nối tới máy chủ trung tâm. Vui lòng kiểm tra lại mạng."
              retryLabel="Thử lại ngay"
              onRetry={() => {
                setPageUiMode('header')
                toast.success('Đã tải lại trang thành công')
              }}
            />
          )}
        </div>
      </ComponentPlaygroundCard>

      {/* 2. Stepper Interactive Wizard */}
      <ComponentPlaygroundCard
        id="stepper"
        title="Stepper (Interactive Multi-step Wizard)"
        description="Thanh chỉ báo quy trình từng bước đăng ký dịch vụ có thể điều hướng tới/lui trực tiếp."
        badge="Workflow Core"
        codeSnippet={`<Stepper\n  activeStep={${activeStep}}\n  steps={stepsData}\n/>\n<Button onClick={nextStep}>Bước tiếp theo</Button>`}
      >
        <div className="space-y-6">
          <Stepper activeStep={activeStep} steps={stepsData} />

          <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-white/50">Đang ở bước {activeStep + 1} / {stepsData.length}:</p>
            <h4 className="text-base font-bold text-[var(--rogym-teal)] mt-1">
              {stepsData[activeStep].title} — {stepsData[activeStep].description}
            </h4>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrevStep}
              disabled={activeStep === 0}
            >
              Quay lại
            </Button>

            <div className="flex items-center gap-2">
              {activeStep === stepsData.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Check size={14} />}
                  onClick={() => {
                    setActiveStep(0)
                    toast.success('Đã hoàn tất quy trình!')
                  }}
                >
                  Hoàn tất & Làm mới
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleNextStep}>
                  Bước tiếp theo
                </Button>
              )}
            </div>
          </div>
        </div>
      </ComponentPlaygroundCard>

      {/* 3. Breadcrumb, SegmentedControl, Accordion & LanguageSwitcher */}
      <div className="grid md:grid-cols-2 gap-6">
        <ComponentPlaygroundCard
          title="Breadcrumb & SegmentedControl"
          description="Đường dẫn phân cấp điều hướng và bộ chuyển chế độ xem (Lưới / Danh sách / Lịch)."
          codeSnippet={`<Breadcrumb>\n  <BreadcrumbList>...</BreadcrumbList>\n</Breadcrumb>\n\n<SegmentedControl value={mode} onValueChange={setMode} options={options} />`}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60 block">
                Breadcrumb Navigation:
              </span>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Trang chủ</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Hội viên</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Nguyễn Văn An (MEM-001)</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60 block">
                SegmentedControl (View Switcher):
              </span>
              <SegmentedControl
                value={viewMode}
                onValueChange={(val) => {
                  setViewMode(val)
                  toast.info(`Chuyển sang chế độ: ${val}`)
                }}
                options={[
                  { value: 'grid', label: 'Dạng lưới', icon: <LayoutGrid size={14} />, count: 12 },
                  { value: 'list', label: 'Danh sách', icon: <List size={14} />, count: 48 },
                  { value: 'calendar', label: 'Lịch biểu', icon: <Calendar size={14} /> },
                ]}
              />
            </div>
          </div>
        </ComponentPlaygroundCard>

        <ComponentPlaygroundCard
          title="Accordion & LanguageSwitcher"
          description="Nội dung FAQ thu gọn mở rộng và chuyển đổi ngôn ngữ Vi/En tức thì."
          codeSnippet={`<Accordion type="single" collapsible>\n  <AccordionItem value="1">\n    <AccordionTrigger>Câu hỏi?</AccordionTrigger>\n    <AccordionContent>Trả lời</AccordionContent>\n  </AccordionItem>\n</Accordion>`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                LanguageSwitcher (i18n):
              </span>
              <LanguageSwitcher />
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60 block">
                Accordion (Quy định phòng tập):
              </span>
              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Chính sách bảo lưu thẻ tập tại RoGym là gì?</AccordionTrigger>
                  <AccordionContent>
                    Hội viên sở hữu gói 6 tháng được bảo lưu tối đa 30 ngày. Hội viên gói VIP 12 tháng được bảo lưu tối đa 60 ngày hoàn toàn miễn phí.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Làm thế nào để hủy lịch tập PT mà không mất buổi?</AccordionTrigger>
                  <AccordionContent>
                    Hội viên vui lòng hủy lịch tập tối thiểu 02 tiếng trước giờ hẹn để hệ thống tự động hoàn lại số buổi tập khả dụng vào tài khoản.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </ComponentPlaygroundCard>
      </div>
    </div>
  )
}
