---
name: mooc-frontend-conventions
description: >-
  Enterprise frontend development standards for the mooc-clone Frontend System.
  Use when creating, editing, refactoring, or reviewing React components, pages, forms, hooks, styles, or tests in client/.
  Enforces Semantic HTML Primitive Boundary (banning raw interactive or unannotated nonsemantic tags on pages),
  Semantic Design System 2-layer tokens (100% HEX in primitive styles, 100% Semantic tokens in components), Form architecture (<Form>, <FormField>, <SubmitButton>),
  CVA multi-axis variants (tone, emphasis, size), TanStack Query v5 (10 domains queryKeys) & Zustand state management,
  i18n & date formatting, responsive mobile & touch accessibility standards, WCAG 2.1 AA a11y, and static conventions audit rules with baseline snapshot.
---

# mooc-clone Frontend Conventions Suite

Quy chuẩn lập trình Frontend bắt buộc cho toàn bộ dự án mooc-clone (`client/`). Được thiết kế theo mô hình **Progressive Disclosure**: cheatsheet tóm tắt các nguyên tắc bất di bất dịch, kèm liên kết tới tài liệu chuyên sâu khi cần tra cứu chi tiết.

---

## 1. Tháp Ngữ Nghĩa & Biên Giới UI Primitives (Semantic Boundary)

- **Tầng Primitives (`src/components/ui/` & `shared/`)**: Nơi **DUY NHẤT** được phép chứa thẻ HTML tương tác nguyên bản (`<button>`, `<a>`, `<form>`).
- **Tầng Page & High-Level Components (`src/pages/`, `components/`)**:
  - **CẤM TUYỆT ĐỐI** thẻ raw: `<button>`, `<a>`, `<form>`. Bắt buộc dùng:
    - `<Button>`, `<SubmitButton>`, `<BackButton>`
    - `<ButtonLink to="...">` (Internal SPA routing)
    - `<ButtonAnchor href="..." target="_blank" rel="noopener noreferrer">` (External link)
    - `<Form onSubmit={handleSubmit} noValidate>` (Primitive Form wrapper)
  - **CẤM thẻ Nonsemantic (`<div>`, `<span>`, `<b>`, `<i>`, `<u>`)** khi chưa có chú thích:
    - Thay thế bằng thẻ HTML5 Semantic: `<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `<article>`, `<footer>`, `<p>`, `<strong>`, `<em>`...
    - Hoặc UI Primitives: `<Page>`, `<Card as="article">`, `<Card as="section">`, `<Badge>`, `<Separator>`, `<Icon>`...
  - **Cơ chế Ngoại Lệ Bắt Buộc**: Nếu bắt buộc dùng `<div>` hoặc `<span>` (do thư viện bên thứ 3 như Recharts/Radix, hoặc layout flex/grid đa trục), **BẮT BUỘC** phải có comment ngay liền kề:
    ```tsx
    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Multi-axis grid layout wrapper] */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">...</div>
    ```

---

## 2. Kiến Trúc Form & Validation Doanh Nghiệp

- Luôn sử dụng bộ ba: `<Form>` (bọc ngoài, tự động `role="form"` APG và `noValidate`), `<FormField>` (tự động liên kết label-input, `errorId`, `aria-describedby`), và `<SubmitButton>` (spinner xoay, disabled khi submitting).
- Cơ chế **On-input Error Clearing**: Xóa lỗi trường ngay khi người dùng bắt đầu nhập lại (`setErrors(prev => ({ ...prev, [field]: undefined }))`).
- Không dùng `<div>` bừa bãi trong Form; dùng `<fieldset>`, `<legend>`, `<Card as="section">` và `<footer>`.

---

## 3. Kỷ Luật Màu Sắc & 4 Nguyên Tắc Mã Nguồn Sạch (Clean Architecture)

- **100% HEX trong Stylesheets (`src/styles/`)**: Mọi thuộc tính màu bắt buộc dùng **HEX**:
  - **6-digit HEX** cho màu đặc (`#06c384`, `#ffffff`, `#080e0b`).
  - **8-digit HEX** cho màu có alpha (`#0c1611d1`, `#ffffff12`, `#42e09e1a`).
  - **CẤM TRIỆT ĐỂ**: `rgba()`, `rgb()`, `hsla()`, `hsl()`, `color-mix()`, và mã 3-digit shorthand `#fff`.
- **CẤM TUYỆT ĐỐI Mã Màu Thô trong JSX/TSX**:
  - Cấm Tailwind arbitrary: `bg-[#0f1c16]`, `text-[rgb(6,195,132)]`, `border-[rgba(...)]`.
  - Cấm inline style: `style={{ color: '#06c384' }}` (chỉ cho phép gán CSS dynamic variables nếu có lý do kỹ thuật).
  - Cấm props màu: `fill="#..."`, `stroke="#..."` (ngoại trừ import từ `TOKEN_COLORS` trong `@/styles/token-values.ts`).
  - Bắt buộc dùng Semantic Tokens: `bg-card`, `text-primary`, `border-border`.
- **Các Nguyên Tắc Tránh Lỗi Tương Đương & Giữ Mã Nguồn Dễ Bảo Trì**:
  1. *Cấm Magic Dimensions & Arbitrary Spacing* (`w-[327px]`, `p-[19px]`): Dùng Spacing Scale 8pt (`p-4`, `h-11`) hoặc layout variables.
  2. *Cấm Magic Z-Index* (`z-[9999]`, `z-[100]`): Dùng thang 5 tầng chuẩn `z-0`, `z-10` (sticky), `z-20` (dropdown), `z-50` (modal), `z-100` (toast).
  3. *Cấm Inlined Raw `<svg>` trên Page*: Bắt buộc dùng `lucide-react` hoặc UI primitive `<Icon>`.
  4. *Cấm Hardcoded API URLs trong JSX*: Bắt buộc gọi tập trung qua services và custom query hooks.
  5. *Cấm Falsy Leakage*: `{items.length > 0 ? <List /> : null}` thay vì `{items.length && <List />}`.
  6. *Giới hạn File Size*: Component `.tsx` <= 250 dòng vật lý; JSX nesting depth <= 4; prop drilling <= 2.
  7. *Cấm Tạo Class/Token Màu Trùng Lặp*: Bắt buộc tái sử dụng tokens hiện hữu (`primary`, `accent`, `card`, `border`, `success`), cấm tạo thêm class CSS lưu mã màu đã có gây phình bundle và lỗi contrast.

---

## 4. Phân Tầng State 4 Lớp & Derived State

1. **Server State**: TanStack Query v5 (`useQuery`, `useMutation`). Bắt buộc dùng Query Key Factory từ `@/lib/query-keys` (10 domains cốt lõi). Cấm gọi API trực tiếp trong `useEffect`.
2. **Global Client State**: Zustand stores (`useAuthStore`, `useExamStore`, `mockExamStore`).
3. **URL State**: `useSearchParams` cho tab, bộ lọc, trang phân trang.
4. **Local State**: `useState` / `useReducer` cho UI toggles nội bộ.
- **Derived State**: *"Compute, Don't Duplicate"* — Tính toán trực tiếp trong render. Không dùng `useEffect` để đồng bộ state phụ; không dùng premature `useMemo` cho chuỗi đơn giản.

---

## 5. Đa Ngôn Ngữ (i18n) & Xử Lý Ngày Tháng

- **i18n (`react-i18next`)**: Hỗ trợ song ngữ Tiếng Việt (`vi`) và Tiếng Nhật (`ja`).
  - Dùng hook `const { t } = useTranslation()`.
  - **CẤM hardcode raw text hiển thị** trực tiếp trong JSX trên các trang nghiệp vụ; đưa text vào file từ điển ngôn ngữ.
- **Ngày tháng (`@/lib/date`)**:
  - Dùng các tiện ích chuẩn hóa từ `@/lib/date` (`formatDate`, `formatDateTime`, `formatTimeSlot`).
  - Tránh tự format bằng chuỗi regex tự do hoặc `toLocaleDateString` tùy ý gây lệch định dạng.

---

## 6. Trải Nghiệm Giao Diện Di Động & Vùng Chạm Cảm Ứng (Touch Target & Mobile View)

- Viewport cơ sở 375px (Mobile-First); breakpoints `sm:`, `md:`, `lg:`.
- **Touch Target**: Mọi phần tử tương tác (button, input, switch, chip, thẻ phương án trắc nghiệm A/B/C/D) phải có kích thước tối thiểu **$44 \times 44\text{px}$** (`min-h-[44px]`, `touch-manipulation`).
- **Safe Area Insets**: Hỗ trợ `env(safe-area-inset-top)` và `env(safe-area-inset-bottom)` cho thanh điều hướng và nút nộp bài cố định trên di động.
- **Responsive Testing**: Kiểm thử giao diện hiển thị tối ưu trên cả thiết bị di động (Học viên thi/luyện tập) và máy tính (Giáo viên quản lý đề/giám sát).

---

## 7. Xử Lý Lỗi Tập Trung, Toast & Logging

- **Toast Notifications**: Sử dụng hàm tiện ích từ `@/lib/toast` (Sonner), ví dụ: `toast.success(...)`, `toast.error(...)`.
- **API Errors**: Parse lỗi qua `@/lib/api-error` (`getApiErrorMessage(error)`), phân loại rõ HTTP 400 (Validation), 401 (Auth), 403 (Forbidden), 404, 500.
- **Console Log**: Cấm sót lại `console.log` trong production code.

---

## 8. Phân Quyền Người Dùng Hệ Thống mooc-clone

- Các vai trò trong hệ thống: `teacher`, `student`, `admin`, `user`.
- **Giáo viên (`teacher`)**: Quản lý đề thi, ngân hàng câu hỏi, tạo và giám sát phòng thi realtime, trích xuất báo cáo kết quả.
- **Học viên (`student`)**: Tham gia phòng thi qua socket/mã phòng, làm bài thi trực tuyến, làm bài luyện tập, xem kết quả và giải thích.
- **Quản trị viên (`admin`)**: Quản trị tài khoản người dùng, cấu hình thông số hệ thống, theo dõi nhật ký hoạt động (System Log).
- Sử dụng các guards và shell có sẵn tại `@/components/shared/` (`RoleNavGuard`, `ProtectedRoute`, `RequireRole`).
- Sử dụng hook `useRoleAccess` để kiểm tra quyền hạn trước khi render các hành động nhạy cảm.

---

## 9. Kiểm Thử Vitest 2.1 & W3C APG Accessibility

- Triết lý Behavior-Driven: Kiểm tra theo hành vi người dùng, không test chi tiết cài đặt nội bộ.
- **Accessible Queries Priority**:
  1. `getByRole(role, { name: '...' })` (Ưu tiên số 1)
  2. `getByLabelText('...')`
  3. `getByPlaceholderText('...')`
  4. `getByText('...')`
  - Cấm lạm dụng `getByTestId` (chỉ cho phép khi test canvas, svg, mã QR kèm chú thích ngoại lệ).
- Server State Mocking: Dùng `createTestQueryClient` và `renderWithQueryClient` từ `@/test/query-test-utils`. Cấm mock `useQuery`.

---

## 10. Bộ Lệnh Kiểm Tra & Thẩm Định Tự Động (Automation Suite)

Trước khi hoàn tất bất kỳ thay đổi nào trong `client/`, bắt buộc chạy:

```bash
# 1. Quét tĩnh 19 Rules Conventions kết hợp Baseline Snapshot (Boy Scout Rule)
npm --prefix client run audit:summary
npm --prefix client run audit:strict

# 2. Kiểm tra tính toàn vẹn tài liệu Markdown & Link Paths
npm --prefix client run verify:docs

# 3. Chạy toàn bộ test suites Vitest
npm --prefix client test

# 4. Kiểm tra TypeScript & Vite build
npm --prefix client run type-check
npm --prefix client run build
```

---

## 11. Mục Lục Tài Liệu Chuyên Sâu (Deep References)

Khi cần thông tin chi tiết hoặc ví dụ code mở rộng, đọc trực tiếp các chuyên đề:

- [Cổng Quy Chuẩn Master Portal](../../../FRONTEND_CONVENTIONS.md)
- [Chuyên Đề 01: Kiến Trúc & Cấu Trúc Thư Mục](../../../docs/01-architecture-and-structure.md)
- [Chuyên Đề 02: Quản Trị State 4 Lớp](../../../docs/02-state-management.md)
- [Chuyên Đề 03: 19 Tiêu Chuẩn Coding & Bảng Ánh Xạ 1-1](../../../docs/03-coding-standards.md)
- [Chuyên Đề 04: React Component Patterns Nâng Cao](../../../docs/04-component-patterns.md)
- [Chuyên Đề 05: Kiến Trúc Form & Validation](../../../docs/05-forms-and-validation.md)
- [Chuyên Đề 06: Styling & Design Tokens 100% HEX](../../../docs/06-styling-and-design-tokens.md)
- [Chuyên Đề 07: Kiểm Thử Vitest & Definition of Done](../../../docs/07-testing-and-quality-assurance.md)
- [Chuyên Đề 08: Semantic Design System & Token Architecture](../../../docs/08-semantic-design-system.md)
- [Chuyên Đề 09: Tiêu Chuẩn Khả Năng Tiếp Cận & WCAG 2.1 AA](../../../docs/09-accessibility.md)

---

## 12. Quy Chuẩn Tài Liệu Markdown & Biểu Đồ Mermaid

- **Cấm Tuyệt Đối Đường Dẫn Tuyệt Đối (`file:///`, `C:\`, `/Users/`)**: Mọi tài liệu Markdown phải dùng đường dẫn tương đối (Relative Paths) tính từ vị trí tệp hiện tại.
- **Biểu Đồ Mermaid An Toàn**: Bọc nhãn node chứa ngoặc đơn trong cặp nháy kép `["..."]` và nhãn cạnh có ngoặc trong `|"..."|` để triệt tiêu lỗi cú pháp `got 'PS'`.
- Tham chiếu chi tiết: [Quy Chuẩn Tài Liệu Markdown & Đường Dẫn](../../rules/markdown-standards.md).



