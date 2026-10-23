// rogym-convention-exempt: ALL [until: 2026-12-31] [Dev buttons showcase section - Phase 5 OQ5 isolation]
import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import { BackButton, Button, type ButtonSize, type ButtonVariant, SubmitButton } from '@/components/ui/actions'
import { Input, Select, Switch } from '@/components/ui/forms'
import { Separator } from '@/components/ui/layout'
import { ComponentPlaygroundCard } from '../components/ComponentPlaygroundCard'
import { toast } from '@/lib/toast'

export function ButtonsShowcase() {
  // Playground State
  const [variant, setVariant] = useState<ButtonVariant>('primary')
  const [size, setSize] = useState<ButtonSize>('default')
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [fullWidth, setFullWidth] = useState(false)
  const [showLeftIcon, setShowLeftIcon] = useState(true)
  const [showRightIcon, setShowRightIcon] = useState(false)
  const [label, setLabel] = useState('Đăng ký gói tập')

  // SubmitButton Demo State
  const [submitLoading, setSubmitLoading] = useState(false)

  const liveSnippet = `<Button
  variant="${variant}"
  size="${size}"${loading ? '\n  loading' : ''}${disabled ? '\n  disabled' : ''}${fullWidth ? '\n  fullWidth' : ''}${
    showLeftIcon ? '\n  leftIcon={<Sparkles size={16} />}' : ''
  }${showRightIcon ? '\n  rightIcon={<ArrowRight size={16} />}' : ''}
>
  ${label}
</Button>`

  const handleSimulateSubmit = () => {
    setSubmitLoading(true)
    setTimeout(() => {
      setSubmitLoading(false)
      toast.success('Gửi biểu mẫu thành công!')
    }, 1500)
  }

  return (
    <div className="space-y-8">
      {/* 1. Interactive Button Playground */}
      <ComponentPlaygroundCard
        id="button"
        title="Button Interactive Playground"
        description="Thử nghiệm trực tiếp các biến thể (variant), kích cỡ (size), biểu tượng (icon) và trạng thái (loading/disabled)."
        badge="Core Primitive"
        codeSnippet={liveSnippet}
        controls={
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 w-full items-center text-xs">
            <div>
              <label htmlFor="btn-variant-select" className="text-white/60 block mb-1">Variant</label>
              <Select
                id="btn-variant-select"
                value={variant}
                onValueChange={(val) => setVariant(val as ButtonVariant)}
              >
                <option value="primary">primary</option>
                <option value="secondary">secondary</option>
                <option value="danger">danger</option>
                <option value="outline-white">outline-white</option>
                <option value="outline-green">outline-green</option>
                <option value="dark">dark</option>
                <option value="text-accent">text-accent</option>
                <option value="text-muted">text-muted</option>
                <option value="icon">icon</option>
              </Select>
            </div>

            <div>
              <label htmlFor="btn-size-select" className="text-white/60 block mb-1">Size</label>
              <Select
                id="btn-size-select"
                value={size}
                onValueChange={(val) => setSize(val as ButtonSize)}
              >
                <option value="xs">xs</option>
                <option value="sm">sm</option>
                <option value="default">default (md)</option>
                <option value="lg">lg</option>
                <option value="xl">xl</option>
              </Select>
            </div>

            <div>
              <label htmlFor="btn-label-input" className="text-white/60 block mb-1">Nhãn nút</label>
              <Input
                id="btn-label-input"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Nhãn nút..."
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Switch checked={loading} onChange={(e) => setLoading(e.target.checked)} id="btn-load" />
              <label htmlFor="btn-load" className="text-white/80 cursor-pointer">Loading</label>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Switch checked={disabled} onChange={(e) => setDisabled(e.target.checked)} id="btn-dis" />
              <label htmlFor="btn-dis" className="text-white/80 cursor-pointer">Disabled</label>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Switch checked={fullWidth} onChange={(e) => setFullWidth(e.target.checked)} id="btn-fw" />
              <label htmlFor="btn-fw" className="text-white/80 cursor-pointer">Full Width</label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch checked={showLeftIcon} onChange={(e) => setShowLeftIcon(e.target.checked)} id="btn-li" />
              <label htmlFor="btn-li" className="text-white/80 cursor-pointer">Left Icon</label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch checked={showRightIcon} onChange={(e) => setShowRightIcon(e.target.checked)} id="btn-ri" />
              <label htmlFor="btn-ri" className="text-white/80 cursor-pointer">Right Icon</label>
            </div>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-xl border border-white/5 min-h-[140px]">
          <div className={fullWidth ? 'w-full' : ''}>
            <Button
              variant={variant}
              size={size}
              loading={loading}
              disabled={disabled}
              fullWidth={fullWidth}
              leftIcon={showLeftIcon ? <Sparkles size={16} /> : undefined}
              rightIcon={showRightIcon ? <ArrowRight size={16} /> : undefined}
              onClick={() => toast.success(`Bạn đã click vào nút: "${label}"`)}
            >
              {variant === 'icon' ? <Sparkles size={16} /> : label}
            </Button>
          </div>
        </div>
      </ComponentPlaygroundCard>

      {/* 2. Side-by-side Visual Catalog */}
      <ComponentPlaygroundCard
        title="Visual Variant Matrix"
        description="Tổng quan tất cả các biến thể nút bấm chuẩn hóa của hệ sinh thái RoGym."
        codeSnippet={`<Button variant="primary">Primary</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="danger">Danger</Button>`}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white/60">Tất cả các biến thể (Variants):</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger Action</Button>
              <Button variant="outline-white">Outline White</Button>
              <Button variant="outline-green">Outline Green</Button>
              <Button variant="dark">Dark Elevated</Button>
              <Button variant="text-accent">Text Accent</Button>
              <Button variant="text-muted">Text Muted</Button>
              <Button variant="icon" aria-label="Icon variant"><Sparkles size={16} /></Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white/60">Các kích cỡ (Sizes XS - XL):</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs" variant="primary">Size XS</Button>
              <Button size="sm" variant="primary">Size SM</Button>
              <Button size="default" variant="primary">Default (MD)</Button>
              <Button size="lg" variant="primary">Size LG</Button>
              <Button size="xl" variant="primary">Size XL</Button>
            </div>
          </div>
        </div>
      </ComponentPlaygroundCard>

      {/* 3. Specialized Buttons: SubmitButton & BackButton */}
      <div className="grid md:grid-cols-2 gap-6">
        <ComponentPlaygroundCard
          id="submit-button"
          title="SubmitButton (Form Automation)"
          description="Nút gửi form tự động đổi icon xoay loading và vô hiệu hóa trong khi chờ xử lý."
          badge="Form Helper"
          codeSnippet={`<SubmitButton loading={isLoading} onClick={handleSubmit}>\n  Lưu hồ sơ hội viên\n</SubmitButton>`}
        >
          <div className="space-y-4">
            <p className="text-xs text-white/70">
              Nhấn vào nút bên dưới để mô phỏng tiến trình submit form kéo dài 1.5 giây:
            </p>
            <div className="flex items-center gap-3">
              <SubmitButton loading={submitLoading} onClick={handleSimulateSubmit}>
                {submitLoading ? 'Đang lưu hồ sơ...' : 'Lưu hồ sơ hội viên'}
              </SubmitButton>
            </div>
          </div>
        </ComponentPlaygroundCard>

        <ComponentPlaygroundCard
          id="back-button"
          title="BackButton (Smart Navigation)"
          description="Nút quay lại lịch sử trang web hoặc trở về route mặc định khi truy cập trực tiếp."
          badge="Navigation Helper"
          codeSnippet={`<BackButton label="Quay lại danh sách" />\n<BackButton iconOnly label="Quay lại" />`}
        >
          <div className="space-y-4">
            <p className="text-xs text-white/70">
              Hỗ trợ 2 giao diện: đầy đủ nhãn văn bản hoặc icon gọn nhẹ trên mobile.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <BackButton label="Quay lại danh sách hội viên" />
              <BackButton iconOnly label="Quay lại icon only" />
            </div>
          </div>
        </ComponentPlaygroundCard>
      </div>
    </div>
  )
}
