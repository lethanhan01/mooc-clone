// rogym-convention-exempt: ALL [until: 2026-12-31] [Dev feedback showcase section - Phase 5 OQ5 isolation]
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/actions'
import { Alert, type AlertEmphasis, type AlertTone } from '@/components/ui/feedback'
import { Select } from '@/components/ui/forms'
import { Separator } from '@/components/ui/layout'
import { ComponentPlaygroundCard } from '../components/ComponentPlaygroundCard'
import { toast } from '@/lib/toast'

const ALERT_SAMPLE_CONTENT: Record<AlertTone, { title: string; description: string }> = {
  neutral: {
    title: 'Thông tin chung',
    description: 'Thời gian mở cửa áp dụng từ 05:30 đến 22:00 hàng ngày.',
  },
  info: {
    title: 'Lịch bảo trì phòng tập',
    description: 'Khu vực bơi lội và xông hơi sẽ bảo trì từ 22:00 hôm nay.',
  },
  success: {
    title: 'Kích hoạt thẻ thành công',
    description: 'Gói hội viên VIP 12 tháng đã sẵn sàng sử dụng.',
  },
  warning: {
    title: 'Cảnh báo hạn sử dụng',
    description: 'Gói tập của hội viên còn lại 3 ngày, vui lòng liên hệ lễ tân gia hạn.',
  },
  danger: {
    title: 'Lỗi kết nối máy quẹt thẻ',
    description: 'Không thể ghi nhận lượt check-in của thẻ RFID #984210.',
  },
  accent: {
    title: 'Sự kiện đặc biệt hè 2026',
    description: 'Tham gia giải đấu RoGym Summer Fitness để nhận nhiều phần quà giá trị.',
  },
}

export function FeedbackShowcase() {
  const [alertTone, setAlertTone] = useState<AlertTone>('success')
  const [alertEmphasis, setAlertEmphasis] = useState<AlertEmphasis>('subtle')
  const [showAlert, setShowAlert] = useState(true)

  const currentAlert = ALERT_SAMPLE_CONTENT[alertTone] ?? ALERT_SAMPLE_CONTENT.info

  const handlePromiseToast = () => {
    toast.promise(
      new Promise((resolve, reject) => {
          const randomVal = typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
            ? crypto.getRandomValues(new Uint8Array(1))[0] / 255
            : 0.5
          randomVal > 0.3 ? resolve('Hoàn tất') : reject(new Error('Lỗi máy chủ'))
      }),
      {
        loading: 'Đang đồng bộ dữ liệu điểm danh máy quẹt thẻ RFID...',
        success: 'Đồng bộ 48 lượt check-in thành công!',
        error: 'Lỗi kết nối máy quẹt thẻ. Vui lòng thử lại!',
      }
    )
  }

  const handleActionToast = () => {
    toast('Hợp đồng #HD-2026 đã được xóa khỏi hệ thống.', {
      action: {
        label: 'Hoàn tác (Undo)',
        onClick: () => toast.success('Đã hoàn tác xóa hợp đồng thành công!'),
      },
    })
  }

  return (
    <div className="space-y-8">
      {/* 1. Alert Interactive Sandbox */}
      <ComponentPlaygroundCard
        id="alert"
        title="Alert Component (Inline Feedback)"
        description="Khung thông báo nổi bật tại chỗ với 6 tone màu semantic và 3 mức emphasis (subtle, solid, outline)."
        badge="Feedback Core"
        controls={
          <div className="flex flex-wrap items-center gap-4 text-xs w-full">
            <div className="flex items-center gap-2">
              <span className="text-white/60">Tone:</span>
              <Select
                value={alertTone}
                onValueChange={(val) => setAlertTone(val as AlertTone)}
                className="w-28 text-xs"
              >
                <option value="neutral">neutral</option>
                <option value="info">info</option>
                <option value="success">success</option>
                <option value="warning">warning</option>
                <option value="danger">danger</option>
                <option value="accent">accent</option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/60">Emphasis:</span>
              <Select
                value={alertEmphasis}
                onValueChange={(val) => setAlertEmphasis(val as AlertEmphasis)}
                className="w-28 text-xs"
              >
                <option value="subtle">subtle</option>
                <option value="solid">solid</option>
                <option value="outline">outline</option>
              </Select>
            </div>

            <Button size="xs" variant="outline-white" onClick={() => setShowAlert(!showAlert)}>
              {showAlert ? 'Ẩn Alert' : 'Hiện Alert'}
            </Button>
          </div>
        }
        codeSnippet={`<Alert tone="${alertTone}" emphasis="${alertEmphasis}" title="${currentAlert.title}" description="${currentAlert.description}" />`}
      >
        <div className="space-y-4">
          {showAlert && (
            <Alert
              tone={alertTone}
              emphasis={alertEmphasis}
              title={currentAlert.title}
              description={currentAlert.description}
            />
          )}

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <Alert
              tone="success"
              title="Đăng ký PT 1:1 thành công"
              description="Buổi tập đầu tiên vào lúc 08:00 sáng Thứ Hai cùng HLV Alex."
            />
            <Alert
              tone="warning"
              title="Nhắc nhở kiểm tra InBody"
              description="Đã 30 ngày kể từ lần đo chỉ số mỡ cơ thể gần nhất của bạn."
            />
          </div>

          <div className="pt-2">
            <Alert tone="accent" emphasis="subtle" autoDismiss={10000}>
              <Alert.Icon />
              <div className="flex-1">
                <Alert.Title>Gói tập Pro Member sắp hết hạn (Compound Demo)</Alert.Title>
                <Alert.Description>
                  Thông báo này tự động đếm ngược 10 giây và tạm dừng khi di chuột hoặc bàn phím focus.
                </Alert.Description>
                <Alert.Action>
                  <Button size="xs" variant="primary">Gia hạn ngay</Button>
                </Alert.Action>
              </div>
              <Alert.CloseButton />
              <Alert.ProgressBar />
            </Alert>
          </div>
        </div>
      </ComponentPlaygroundCard>

      {/* 2. Sonner Toasts Playground */}
      <ComponentPlaygroundCard
        title="Sonner Toast System"
        description="Hệ thống thông báo Toast nổi nhanh gọn, hỗ trợ thông báo bất đồng bộ Promise và nút Action hoàn tác."
        badge="Toast Notification"
        codeSnippet={`toast.success('Đã lưu hồ sơ!')\ntoast.error('Đã xảy ra lỗi!')\ntoast.promise(asyncFunc, { loading: '...', success: '...', error: '...' })`}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60 block">
              Các loại Toast thông thường:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={() => toast.success('Đã lưu thông tin hội viên thành công!')}>
                Toast Success
              </Button>
              <Button variant="danger" onClick={() => toast.error('Lỗi khi hủy hợp đồng gói tập!')}>
                Toast Error
              </Button>
              <Button variant="outline-white" onClick={() => toast.warning('Cảnh báo: Hội viên còn nợ 500.000đ!')}>
                Toast Warning
              </Button>
              <Button variant="dark" onClick={() => toast.info('Đã sao chép mã thẻ RFID vào bộ nhớ')}>
                Toast Info
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60 block">
              Toast nâng cao (Promise Async & Action Undo):
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline-green" onClick={handlePromiseToast} leftIcon={<Loader2 size={14} className="animate-spin" />}>
                Bấm thử Promise Toast (2s Async)
              </Button>

              <Button variant="secondary" onClick={handleActionToast}>
                Bấm thử Action Toast (Có nút Undo)
              </Button>
            </div>
          </div>
        </div>
      </ComponentPlaygroundCard>
    </div>
  )
}
