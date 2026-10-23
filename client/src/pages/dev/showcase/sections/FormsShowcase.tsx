// rogym-convention-exempt: ALL [until: 2026-12-31] [Dev forms showcase section - Phase 5 OQ5 isolation]
import { useState } from 'react'
import {
  Activity,
  CreditCard,
  Eye,
  EyeOff,
  Filter,
  Mail,
  Sparkles,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/actions'
import { Checkbox, Combobox, DatePickerInput, DateTimePickerInput, FileUpload, FilterBar, FilterDropdown, FormField, Input, RadioCard, RadioGroup, SearchToolbar, type SearchToolbarLayout, type SearchToolbarVariant, Select, Switch, TagInput, type TimeSlot, TimeSlotPicker } from '@/components/ui/forms'
import { Separator } from '@/components/ui/layout'
import { ComponentPlaygroundCard } from '../components/ComponentPlaygroundCard'
import { SHOWCASE_MEMBERS, SHOWCASE_TIME_SLOTS } from '../mock-data/showcaseData'
import { toast } from '@/lib/toast'

export function FormsShowcase() {
  // Input Live Sandbox State
  const [inputVal, setInputVal] = useState('Nguyễn Văn An')
  const [inputSize, setInputSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [showError, setShowError] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [isRequired, setIsRequired] = useState(true)
  const [isDisabled, setIsDisabled] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Search Controls State
  const [searchVal, setSearchVal] = useState('')
  const [toolbarLayout, setToolbarLayout] = useState<SearchToolbarLayout>('auto')
  const [toolbarVariant, setToolbarVariant] = useState<SearchToolbarVariant>('card')

  // Combobox & Select State
  const [selectedMemberId, setSelectedMemberId] = useState('mem_1')
  const [selectRole, setSelectRole] = useState('member')

  // Date/Time State
  const [birthDate, setBirthDate] = useState('1998-05-15')
  const [consultTime, setConsultTime] = useState('2026-08-25T14:30')

  // Radio & Toggles State
  const [paymentPlan, setPaymentPlan] = useState('vip12')
  const [notifyZalo, setNotifyZalo] = useState(true)
  const [agreeTerms, setAgreeTerms] = useState(true)

  // Slots, Tags & FilterBar State
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(SHOWCASE_TIME_SLOTS[2])
  const [tags, setTags] = useState<string[]>(['Tăng cơ', 'Giảm mỡ', 'Cardio HIIT', 'Yoga'])
  const [filterSearch, setFilterSearch] = useState('')
  const [activeChips, setActiveChips] = useState([
    { id: 'c1', label: 'Gói VIP 12 Tháng' },
    { id: 'c2', label: 'Chi nhánh Quận 1' },
    { id: 'c3', label: 'Đang hoạt động' },
  ])
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [branchFilter, setBranchFilter] = useState('all')

  const comboboxOptions = SHOWCASE_MEMBERS.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.code}) - ${m.phone}`,
  }))

  return (
    <div className="space-y-8">
      {/* 1. FormField & Input Sandbox */}
      <ComponentPlaygroundCard
        id="form-field"
        title="FormField & Input Interactive Sandbox"
        description="FormField tự động kết nối label, required, hint và aria-error với ô Input bên trong."
        badge="Form Foundation"
        controls={
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full items-center text-xs">
            <div>
              <label htmlFor="input-size-select" className="text-white/60 block mb-1">Input Size</label>
              <Select
                id="input-size-select"
                value={inputSize}
                onValueChange={(val) => setInputSize(val as 'sm' | 'md' | 'lg')}
              >
                <option value="sm">sm</option>
                <option value="md">md (default)</option>
                <option value="lg">lg</option>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Switch checked={showError} onChange={(e) => setShowError(e.target.checked)} id="toggle-err" />
              <label htmlFor="toggle-err" className="text-white/80 cursor-pointer">Bật lỗi (Error)</label>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Switch checked={showHint} onChange={(e) => setShowHint(e.target.checked)} id="toggle-hint" />
              <label htmlFor="toggle-hint" className="text-white/80 cursor-pointer">Hiện Hint</label>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Switch checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} id="toggle-req" />
              <label htmlFor="toggle-req" className="text-white/80 cursor-pointer">Required</label>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Switch checked={isDisabled} onChange={(e) => setIsDisabled(e.target.checked)} id="toggle-dis" />
              <label htmlFor="toggle-dis" className="text-white/80 cursor-pointer">Disabled</label>
            </div>
          </div>
        }
        codeSnippet={`<FormField\n  label="Họ và tên hội viên"\n  required={${isRequired}}\n  hint="${showHint ? 'Nhập chính xác theo CMND/CCCD' : ''}"\n  error="${showError ? 'Họ tên không được chứa ký tự đặc biệt' : ''}"\n>\n  <Input\n    size="${inputSize}"\n    value={value}\n    onChange={e => setValue(e.target.value)}\n    leftIcon={<User size={16} />}\n    disabled={${isDisabled}}\n  />\n</FormField>`}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            label="Họ và tên hội viên"
            required={isRequired}
            hint={showHint ? 'Nhập chính xác theo CCCD hoặc Hộ chiếu' : undefined}
            error={showError ? 'Họ tên không được chứa ký tự đặc biệt hoặc số' : undefined}
          >
            <Input
              size={inputSize}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Nguyễn Văn An"
              leftIcon={<User size={16} />}
              disabled={isDisabled}
            />
          </FormField>

          <FormField label="Mật khẩu tài khoản" required hint="Tối thiểu 8 ký tự, gồm chữ và số">
            <Input
              type={showPassword ? 'text' : 'password'}
              size={inputSize}
              defaultValue="SecurePassword@2026"
              leftIcon={<Mail size={16} />}
              rightIcon={
                <Button
                  variant="plain"
                  size="compact"
                  type="button"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/60 hover:text-white p-0 h-auto"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              }
            />
          </FormField>
        </div>
      </ComponentPlaygroundCard>

      {/* 2. Search & Toolbar Controls */}
      <ComponentPlaygroundCard
        id="search-input"
        title="SearchInput & SearchToolbar"
        description="Thanh tìm kiếm có debounce, clear action và thanh Toolbar linh hoạt hỗ trợ nhiều giao diện."
        badge="Search & Filter"
        controls={
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white/60">Layout:</span>
              <Select
                value={toolbarLayout}
                onValueChange={(val) => setToolbarLayout(val as SearchToolbarLayout)}
              >
                <option value="auto">Auto (Responsive)</option>
                <option value="row">Row (Always Row)</option>
                <option value="col">Col (Always Column)</option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/60">Variant:</span>
              <Select
                value={toolbarVariant}
                onValueChange={(val) => setToolbarVariant(val as SearchToolbarVariant)}
              >
                <option value="card">Card (Default)</option>
                <option value="compact">Compact</option>
                <option value="plain">Plain</option>
              </Select>
            </div>
          </div>
        }
        codeSnippet={`<SearchToolbar\n  variant="${toolbarVariant}"\n  layout="${toolbarLayout}"\n  value={search}\n  onChange={setSearch}\n  placeholder="Tìm kiếm hội viên theo mã, tên, SĐT..."\n  actions={<Button variant="primary" size="sm">Xuất Excel</Button>}\n/>`}
      >
        <div className="space-y-4">
          <SearchToolbar
            variant={toolbarVariant}
            layout={toolbarLayout}
            value={searchVal}
            onChange={setSearchVal}
            placeholder="Tìm kiếm hội viên theo mã, tên, SĐT..."
            actions={
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline-white" leftIcon={<Filter size={14} />}>Bộ lọc</Button>
                <Button size="sm" variant="primary">Thêm mới</Button>
              </div>
            }
          />
          {searchVal && (
            <p className="text-xs text-[var(--rogym-teal)]">
              Đang tìm kiếm với từ khóa: <strong>&quot;{searchVal}&quot;</strong>
            </p>
          )}
        </div>
      </ComponentPlaygroundCard>

      {/* 3. Combobox, Select & Date Pickers */}
      <div className="grid md:grid-cols-2 gap-6">
        <ComponentPlaygroundCard
          id="combobox"
          title="Combobox (Searchable Select)"
          description="Hộp chọn có tìm kiếm lọc option mượt mà, hỗ trợ danh sách hội viên phòng gym thực tế."
          codeSnippet={`<Combobox\n  options={comboboxOptions}\n  value={selectedId}\n  onValueChange={setSelectedId}\n  placeholder="Chọn hội viên liên kết..."\n/>`}
        >
          <div className="space-y-4">
            <FormField label="Hội viên liên kết hợp đồng" required>
              <Combobox
                options={comboboxOptions}
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
                placeholder="Tìm theo tên, mã MEM hoặc SĐT..."
                searchPlaceholder="Gõ để tìm kiếm hội viên..."
              />
            </FormField>

            <FormField label="Vai trò người dùng trong hệ thống">
              <Select value={selectRole} onValueChange={setSelectRole}>
                <option value="member">Hội viên (Member)</option>
                <option value="trainer">Huấn luyện viên (Personal Trainer)</option>
                <option value="staff">Nhân viên lễ tân (Staff)</option>
                <option value="owner">Chủ phòng gym (Owner)</option>
              </Select>
            </FormField>
          </div>
        </ComponentPlaygroundCard>

        <ComponentPlaygroundCard
          title="Date & DateTime Pickers"
          description="Hỗ trợ chọn ngày sinh, lịch hẹn tư vấn và hiển thị định dạng chuẩn tiếng Việt."
          codeSnippet={`<DatePickerInput value={date} onChange={setDate} />\n<DateTimePickerInput value={datetime} onChange={setDatetime} />`}
        >
          <div className="space-y-4">
            <FormField label="Ngày sinh hội viên">
              <DatePickerInput value={birthDate} onChange={setBirthDate} />
            </FormField>

            <FormField label="Lịch hẹn tư vấn & đo InBody">
              <DateTimePickerInput value={consultTime} onChange={setConsultTime} />
            </FormField>
          </div>
        </ComponentPlaygroundCard>
      </div>

      {/* 4. RadioCard & Interactive Toggles */}
      <ComponentPlaygroundCard
        title="RadioCard & Rich Selectors"
        description="Thẻ radio trực quan với tiêu đề, mô tả chi tiết, ribbon giảm giá và icon minh họa."
        codeSnippet={`<RadioGroup value={plan} onValueChange={setPlan}>\n  <RadioCard value="vip12" title="Gói VIP 12 Tháng" badge="Tiết kiệm 30%" />\n</RadioGroup>`}
      >
        <div className="space-y-6">
          <FormField label="Chọn phương thức thanh toán / Gói tập">
            <RadioGroup value={paymentPlan} onValueChange={setPaymentPlan} className="space-y-3">
              <RadioCard
                value="vip12"
                title="Gói VIP Toàn Diện 12 Tháng (Khuyên dùng)"
                description="Truy cập không giới hạn 24/7 toàn bộ chi nhánh, tặng kèm 24 buổi PT cá nhân và xông hơi."
                badge="Tiết kiệm 30%"
                icon={<Sparkles size={20} className="text-amber-400" />}
              />
              <RadioCard
                value="std6"
                title="Gói Tiêu Chuẩn Nâng Cao 6 Tháng"
                description="Tập tự do trong khung giờ 06:00 - 22:00, tặng 03 buổi hướng dẫn cơ bản cùng HLV."
                icon={<Activity size={20} className="text-teal-400" />}
              />
              <RadioCard
                value="cash"
                title="Thanh toán trực tiếp tại quầy Lễ tân"
                description="Hỗ trợ tiền mặt, quẹt thẻ POS hoặc chuyển khoản ngân hàng trực tiếp."
                icon={<CreditCard size={20} className="text-white/70" />}
              />
            </RadioGroup>
          </FormField>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div>
                <p className="text-xs font-semibold text-white">Gửi thông báo qua Zalo OA</p>
                <p className="text-[11px] text-white/60">Nhận nhắc lịch tập và hóa đơn</p>
              </div>
              <Switch checked={notifyZalo} onChange={(e) => setNotifyZalo(e.target.checked)} />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                id="terms-check"
              />
              <label htmlFor="terms-check" className="text-xs text-white/80 cursor-pointer">
                Đồng ý với quy định phòng tập và chính sách bảo mật thông tin hội viên.
              </label>
            </div>
          </div>
        </div>
      </ComponentPlaygroundCard>

      {/* 5. TimeSlotPicker, FileUpload, TagInput & FilterBar */}
      <ComponentPlaygroundCard
        id="time-slot-picker"
        title="TimeSlotPicker (PT Schedule Booking)"
        description="Bộ chọn khung giờ thông minh thể hiện trực quan các khung giờ khả dụng và lý do bị khóa."
        badge="Booking Core"
        codeSnippet={`<TimeSlotPicker\n  slots={slots}\n  selectedSlot={selectedSlot}\n  onSelectSlot={setSelectedSlot}\n/>`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Khung giờ tập ngày 23/08/2026:
            </span>
            {selectedSlot && (
              <span className="text-xs text-[var(--rogym-teal)] font-medium">
                Đã chọn: {new Date(selectedSlot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSlot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <TimeSlotPicker
            slots={SHOWCASE_TIME_SLOTS}
            selectedSlot={selectedSlot}
            onSelectSlot={(slot) => {
              setSelectedSlot(slot)
              toast.info(`Đã chọn khung giờ: ${new Date(slot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`)
            }}
          />
        </div>
      </ComponentPlaygroundCard>

      <div className="grid md:grid-cols-2 gap-6">
        <ComponentPlaygroundCard
          id="file-upload"
          title="FileUpload (Avatar & Dropzone)"
          description="Tải lên ảnh đại diện hoặc kéo thả tài liệu hợp đồng có preview và validate kích thước."
          codeSnippet={`<FileUpload variant="avatar" helperText="Tối đa 5MB. PNG, JPG" />\n<FileUpload variant="dropzone" helperText="Tối đa 20MB. PDF, DOCX" />`}
        >
          <div className="space-y-6">
            <FormField label="Ảnh đại diện hội viên (Avatar Variant)">
              <FileUpload
                variant="avatar"
                helperText="Hỗ trợ PNG, JPG (Tối đa 5MB)"
                onChange={(file) => toast.success(file ? `Đã chọn file avatar: ${file.name}` : 'Đã xóa file')}
              />
            </FormField>

            <FormField label="Hồ sơ hợp đồng & Giấy khám sức khỏe (Dropzone Variant)">
              <FileUpload
                variant="dropzone"
                helperText="Kéo thả tài liệu PDF, DOCX, PNG (Tối đa 20MB)"
                onChange={(file) => toast.success(file ? `Đã đính kèm tài liệu: ${file.name}` : 'Đã xóa file')}
              />
            </FormField>
          </div>
        </ComponentPlaygroundCard>

        <ComponentPlaygroundCard
          id="tag-input"
          title="TagInput & FilterBar"
          description="Quản lý từ khóa mục tiêu tập luyện và thanh lọc chip đa tiêu chí."
          codeSnippet={`<TagInput value={tags} onChange={setTags} />\n<FilterBar filterChips={chips} onClearAll={handleClear} />`}
        >
          <div className="space-y-6">
            <FormField label="Mục tiêu tập luyện hội viên (TagInput)">
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder="Thêm mục tiêu mới (Enter)..."
              />
            </FormField>

            <Separator />

            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                FilterBar & FilterDropdown:
              </span>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <FilterBar
                    searchPlaceholder="Lọc hội viên theo chip..."
                    search={filterSearch}
                    onSearchChange={setFilterSearch}
                    filterChips={activeChips.map((chip) => ({
                      id: chip.id,
                      label: chip.label,
                      onRemove: () => {
                        setActiveChips((prev) => prev.filter((c) => c.id !== chip.id))
                        toast.info(`Đã xóa chip: ${chip.label}`)
                      },
                    }))}
                    onClearAll={() => {
                      setActiveChips([])
                      toast.info('Đã xóa tất cả bộ lọc')
                    }}
                  />
                </div>

                <FilterDropdown
                  open={filterDropdownOpen}
                  onOpenChange={setFilterDropdownOpen}
                  activeCount={branchFilter !== 'all' ? 1 : 0}
                  onApply={() => {
                    setFilterDropdownOpen(false)
                    toast.success('Đã áp dụng bộ lọc chi nhánh')
                  }}
                  onClear={() => {
                    setBranchFilter('all')
                    setFilterDropdownOpen(false)
                    toast.info('Đã hoàn tác bộ lọc')
                  }}
                  title="Chi nhánh tập"
                >
                  <div className="space-y-2 p-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="branch"
                        checked={branchFilter === 'all'}
                        onChange={() => setBranchFilter('all')}
                      />
                      <span>Tất cả chi nhánh</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="branch"
                        checked={branchFilter === 'q1'}
                        onChange={() => setBranchFilter('q1')}
                      />
                      <span>Chi nhánh Quận 1</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="branch"
                        checked={branchFilter === 'q3'}
                        onChange={() => setBranchFilter('q3')}
                      />
                      <span>Chi nhánh Quận 3</span>
                    </label>
                  </div>
                </FilterDropdown>
              </div>
            </div>
          </div>
        </ComponentPlaygroundCard>
      </div>
    </div>
  )
}
