# Chuyên Đề 03: Tiêu Chuẩn Coding Standards Doanh Nghiệp & TypeScript Strict

> **Dự án:** Khung Tiêu Chuẩn Doanh Nghiệp & RoGym Management System Profile  
> **Cổng quy chuẩn chính:** [`FRONTEND_CONVENTIONS.md`](../FRONTEND_CONVENTIONS.md) | [Bản Đồ Tài Liệu](./README.md)  
> **Tài liệu liên quan:** [`docs/01-architecture-and-structure.md`](./01-architecture-and-structure.md) | [`docs/02-state-management.md`](./02-state-management.md) | [`docs/04-component-patterns.md`](./04-component-patterns.md) | [`docs/05-forms-and-validation.md`](./05-forms-and-validation.md) | [`docs/06-styling-and-design-tokens.md`](./06-styling-and-design-tokens.md) | [`docs/07-testing-and-quality-assurance.md`](./07-testing-and-quality-assurance.md) | [`docs/08-semantic-design-system.md`](./08-semantic-design-system.md) | [`docs/09-accessibility.md`](./09-accessibility.md)  
> **Cơ sở tham chiếu quốc tế:**  
> - [MDN Web Docs - AbortController & AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)  
> - [MDN Web Docs - Intl.DateTimeFormat Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)  
> - [RFC 9457 - Problem Details for HTTP APIs (Thay thế RFC 7807)](https://datatracker.ietf.org/doc/html/rfc9457)  
> - [TypeScript 5.x Handbook - Narrowing & Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)  
> - [React.dev - Keeping Components Pure](https://react.dev/learn/keeping-components-pure)  
> **Phiên bản:** 8.0 (Enterprise Quality Standard — 15 Spokes & Universal Decoupling)  
> **Áp dụng cho:** Toàn bộ kỹ sư và mã nguồn phát triển giao diện trong thư mục `src/`  
> **Trạng thái:** Bắt buộc tuân thủ 100% (Strict Mandatory Enforcement)  
> **Vị trí tài liệu:** Nguồn Dữ Liệu Chuẩn Duy Nhất (SSOT) cho **Quy tắc An toàn kiểu (TypeScript Strict), Xử lý Bất đồng bộ (AbortController), Quy chuẩn Thời gian (UTC & Intl), Phân cấp Lỗi Miền (RFC 9457), Clean Code, và Quy trình Kiểm toán Tĩnh (Static Audit CLI)**. Đối với các miền kiến trúc chuyên biệt khác, tài liệu này đóng vai trò Router điều hướng tới các chuyên đề tương ứng.

---

## MỤC LỤC
1. [Triết Lý Coding Standards & Bảng Điều Hướng Quy Chuẩn Tập Trung (Master Standards Router)](#1-triết-lý-coding-standards-bảng-điều-hướng-quy-chuẩn-tập-trung-master-standards-router)
2. [An Toàn Kiểu Tuyệt Đối (TypeScript Strict Discipline)](#2-an-toàn-kiểu-tuyệt-đối-typescript-strict-discipline)
   - [2.1. Tuyệt Đối Cấm Kiểu `any` (`STD-TS-001`)](#21-tuyệt-đối-cấm-kiểu-any-std-ts-001)
   - [2.2. Discriminated Unions & Thu Hẹp Kiểu An Toàn (`STD-TS-002`)](#22-discriminated-unions-thu-hẹp-kiểu-an-toàn-std-ts-002)
   - [2.3. Cấu Hình `noUncheckedIndexedAccess` & Truy Cập Mảng (`STD-TS-003`)](#23-cấu-hình-nouncheckedindexedaccess-truy-cập-mảng-std-ts-003)
3. [Quy Tắc Xử Lý Bất Đồng Bộ & Hủy Request Bắt Buộc (`AbortController`)](#3-quy-tắc-xử-lý-bất-đồng-bộ-hủy-request-bắt-buộc-abortcontroller)
   - [3.1. Rủi Ro Rò Rỉ Bộ Nhớ & Race Conditions](#31-rủi-ro-rò-rỉ-bộ-nhớ-race-conditions)
   - [3.2. Chuẩn Mực Liên Kết `AbortSignal` (`STD-ASYNC-001`)](#32-chuẩn-mực-liên-kết-abortsignal-std-async-001)
4. [Quy Chuẩn Thời Gian: UTC Server & Hiển Thị Đa Múi Giờ](#4-quy-chuẩn-thời-gian-utc-server-hiển-thị-đa-múi-giờ)
   - [4.1. Lưu Trữ Chuỗi ISO-8601 UTC Trên Server (`STD-TIME-001`)](#41-lưu-trữ-chuỗi-iso-8601-utc-trên-server-std-time-001)
   - [4.2. Định Dạng Hiển Thị Qua `Intl.DateTimeFormat` (`STD-TIME-002`)](#42-định-dạng-hiển-thị-qua-intldatetimeformat-std-time-002)
5. [Cây Phân Cấp Lỗi Miền Doanh Nghiệp (RFC 9457 Problem Details)](#5-cây-phân-cấp-lỗi-miền-doanh-nghiệp-rfc-9457-problem-details)
   - [5.1. Phân Định Các Lớp Lỗi Miền (`STD-ERR-001`)](#51-phân-định-các-lớp-lỗi-miền-std-err-001)
   - [5.2. Chuẩn Hóa Schema Lỗi Problem Details RFC 9457](#52-chuẩn-hóa-schema-lỗi-problem-details-rfc-9457)
6. [Chuẩn Mực Clean Code, Pure Render & Giữ Gìn Mã Nguồn](#6-chuẩn-mực-clean-code-pure-render-giữ-gìn-mã-nguồn)
   - [6.1. Pure Render & Bất Biến Dữ Liệu (Immutability) (`STD-PURE-001`)](#61-pure-render-bất-biến-dữ-liệu-immutability-std-pure-001)
   - [6.2. Quy Ước Đặt Tên Đối Xứng (`STD-NAME-001`)](#62-quy-ước-đặt-tên-đối-xứng-std-name-001)
   - [6.3. Giới Hạn Kích Thước File (.tsx <= 250 dòng) (`STD-SIZE-001`)](#63-giới-hạn-kích-thước-file-tsx-250-dòng-std-size-001)
   - [6.4. Chuẩn Hóa Tham Chiếu `ref`: React 18 vs React 19 (`STD-REF-001`)](#std-ref-001)
   - [6.5. Khử Rác Debugging: Cấm `console.log`, `debugger` (`STD-CLEAN-001`)](#65-khử-rác-debugging-cấm-consolelog-debugger-std-clean-001)
   - [6.6. Chú Thích Ngoại Lệ Có Cấu Trúc (`rogym-convention-exempt`) (`STD-EXEMPT-001`)](#66-chú-thích-ngoại-lệ-có-cấu-trúc-rogym-convention-exempt-std-exempt-001)
   - [6.7. Tối Ưu Memoization Tỉnh Táo (`STD-MEMO-001`)](#67-tối-ưu-memoization-tỉnh-táo-std-memo-001)
7. [Hệ Thống Kiểm Toán Tĩnh Tự Động & Quy Tắc Hướng Đạo Sinh (Boy Scout Rule)](#7-hệ-thống-kiểm-toán-tĩnh-tự-động-quy-tắc-hướng-đạo-sinh-boy-scout-rule)
   - [7.1. Cơ Chế Hoạt Động Của `audit-conventions.mjs`](#71-cơ-chế-hoạt-động-của-audit-conventionsmjs)
   - [7.2. Bộ Lọc Ngữ Cảnh Bảo Toàn Số Dòng (Line-preserving Masking)](#72-bộ-lọc-ngữ-cảnh-bảo-toàn-số-dòng-line-preserving-masking)
   - [7.3. Cơ Chế Baseline Snapshot (`audit-baseline.json`) & Boy Scout Rule](#73-cơ-chế-baseline-snapshot-audit-baselinejson-boy-scout-rule)
   - [7.4. Hướng Dẫn Vận Hành CLI & CI Gatekeeper](#74-hướng-dẫn-vận-hành-cli-ci-gatekeeper)
8. [Checklist Định Lượng Coding Standards Trước Khi Mở PR (12 Tiêu Chí)](#8-checklist-định-lượng-coding-standards-trước-khi-mở-pr-12-tiêu-chí)

---

## 1. Triết Lý Coding Standards & Bảng Điều Hướng Quy Chuẩn Tập Trung (Master Standards Router)

Mục tiêu của tiêu chuẩn viết mã trong doanh nghiệp là đảm bảo **tính dự đoán được (Predictability)**, **tính an toàn khi bảo trì (Maintainability)** và **loại bỏ hoàn toàn tính tùy tiện cá nhân**. Mã nguồn do bất kỳ kỹ sư nào viết ra đều phải nhất quán về phong cách, an toàn kiểu và đạt cùng một đẳng cấp chất lượng.

Để tránh việc nội dung bị phân mảnh hay trùng lặp, toàn bộ **22 Tiêu chuẩn** kỹ thuật của hệ thống được quản trị tập trung thông qua **Bảng Điều Hướng Quy Chuẩn Doanh Nghiệp (Master Standards Router)**:

| STT | Lĩnh Vực / Tiêu Chuẩn | Mã Quy Tắc Gốc | Nguồn Dữ Liệu Chuẩn Duy Nhất (SSOT) | Nội Dung Trọng Tâm |
| :---: | :--- | :---: | :--- | :--- |
| **01** | Semantic HTML First & Tháp Phân Tầng | `SEM-HTML-001..003` | [`08-semantic-design-system.md §2`](./08-semantic-design-system.md#2-s1-semantic-html-primitives-boundary) | Tháp ngữ nghĩa 4 tầng; cấm thẻ raw interactive ngoài UI/Shared. |
| **02** | Quản Trị Ngoại Lệ Có Cấu Trúc | `STD-EXEMPT-001` | [Mục 6.6 Trong Tài Liệu Này](#66-chú-thích-ngoại-lệ-có-cấu-trúc-rogym-convention-exempt-std-exempt-001) | Cú pháp `rogym-convention-exempt: RULE_ID [Lý do]`. |
| **03** | Primitive Boundary Enforcement | `SEM-HTML-001` | [`08-semantic-design-system.md §2`](./08-semantic-design-system.md#2-s1-semantic-html-primitives-boundary) | 100% thẻ tương tác đi qua `<Button>`, `<Input>`, `<Form>`. |
| **04** | Performance & Memoization Tỉnh Táo | `STD-MEMO-001` | [Mục 6.7 Trong Tài Liệu Này](#67-tối-ưu-memoization-tỉnh-táo-std-memo-001) | Chỉ dùng `useMemo`, `useCallback` khi có tính toán nặng hoặc truyền callback. |
| **05** | Server State qua TanStack Query v5 | `Chuyên đề 02` | [`02-state-management.md §9.1`](./02-state-management.md#server-state) | Query Key Factory, Stale Time, Optimistic Updates. |
| **06** | Global Client State Tối Giản qua Zustand | `Chuyên đề 02` | [`02-state-management.md §9.2`](./02-state-management.md#global-client-state) | Atomic Selectors, cấm lưu server response vào Zustand. |
| **07** | URL State First Cho Phân Trang & Lọc | `Chuyên đề 02` | [`02-state-management.md §9.3`](./02-state-management.md#url-state) | Bộ lọc, trang hiện tại, tab đồng bộ qua URL params. |
| **08** | Design Tokens & 100% Mã Màu HEX | `SEM-TOKEN-001` | [`06-styling-and-design-tokens.md §3`](./06-styling-and-design-tokens.md#3-quy-chuẩn-tuyệt-đối-100-hex-tokens-trong-css-primitives-sem-token-001) | Mọi mã màu trong stylesheet bắt buộc là HEX 6/8 ký tự. |
| **09** | Quy Chuẩn Tailwind CSS & BEM Boundaries | `SEM-TOKEN-006` | [`06-styling-and-design-tokens.md §7`](./06-styling-and-design-tokens.md#7-kiến-trúc-styling-tailwind-first-biến-thể-cva-primitives) | Cấm arbitrary classes (`bg-[#...]`); dùng semantic classes. |
| **10** | Form Architecture Chuẩn Mực Tầng 1 & 2 | `Chuyên đề 05` | [`05-forms-and-validation.md §2`](./05-forms-and-validation.md#form-primitives) | Bộ ba `<Form>`, `<FormField>`, `<SubmitButton>` + Zod Schema. |
| **11** | Type Safety & TypeScript Strict | `STD-TS-001..003` | [Mục 2 Trong Tài Liệu Này](#2-an-toàn-kiểu-tuyệt-đối-typescript-strict-discipline) | Tuyệt đối cấm `any`, Discriminated Unions, Narrowing. |
| **12** | Khả Năng Tiếp Cận Tự Nhiên (a11y) | `A11Y-001..012` | [`09-accessibility.md §2`](./09-accessibility.md) | Tương phản $\ge 4.5:1$, touch target $\ge 44\text{px}$, ARIA APG. |
| **13** | Xử Lý Lỗi Tập Trung & Error Boundaries | `Chuyên đề 04` | [`04-component-patterns.md §4`](./04-component-patterns.md#4-pattern-3-multi-level-error-boundaries-phân-tầng-bắt-lỗi-3-cấp) | Phân tầng Error Boundaries 3 cấp: App -> Page -> Widget. |
| **14** | Clean Code & Khử Rác Debugging | `STD-CLEAN-001` | [Mục 6.5 Trong Tài Liệu Này](#65-khử-rác-debugging-cấm-consolelog-debugger-std-clean-001) | Cấm `console.log`, `debugger`, comment rác. |
| **15** | ForwardRef & DisplayName Bắt Buộc | `STD-REF-001` | [Mục 6.4 Trong Tài Liệu Này](#std-ref-001) | 100% Primitive dùng `forwardRef` phải có `displayName`. |
| **16** | Kiểm Thử Vitest 2.1 & Testing Library | `Chuyên đề 07` | [`07-testing-and-quality-assurance.md §2`](./07-testing-and-quality-assurance.md#testing-pyramid) | Accessible Queries (`getByRole`), vitest-axe, MSW mocking. |
| **17** | Giới Hạn Kích Thước File (.tsx <= 250 dòng)| `STD-SIZE-001` | [Mục 6.3 Trong Tài Liệu Này](#63-giới-hạn-kích-thước-file-tsx-250-dòng-std-size-001) | Tách nhỏ component khi vượt quá 250 dòng code. |
| **18** | Anti-Magic Values & Đo Đạc Kích Thước | `STD-MAGIC-001` | [Mục 6.3 Trong Tài Liệu Này](#63-giới-hạn-kích-thước-file-tsx-250-dòng-std-size-001) | Bội số 4px cho spacing; dùng biến Z-index từ Chuyên đề 06. |
| **19** | Pure Render, Immutability & Naming | `STD-PURE-001` | [Mục 6.1 & 6.2 Trong Tài Liệu Này](#61-pure-render-bất-biến-dữ-liệu-immutability-std-pure-001) | Cấm mutate state/props; đặt tên đối xứng `is/has`, `handle/on`. |
| **20** | Hủy Request Bất Đồng Bộ (`AbortController`)| `STD-ASYNC-001` | [Mục 3 Trong Tài Liệu Này](#3-quy-tắc-xử-lý-bất-đồng-bộ-hủy-request-bắt-buộc-abortcontroller) | Bắt buộc liên kết `AbortSignal` cho async requests. |
| **21** | Quy Chuẩn Thời Gian UTC Server & Đa Múi Giờ | `STD-TIME-001` | [Mục 4 Trong Tài Liệu Này](#4-quy-chuẩn-thời-gian-utc-server-hiển-thị-đa-múi-giờ) | ISO-8601 UTC trên server; format hiển thị qua `Intl.DateTimeFormat`. |
| **22** | Cây Phân Cấp Lỗi Miền Doanh Nghiệp | `STD-ERR-001` | [Mục 5 Trong Tài Liệu Này](#5-cây-phân-cấp-lỗi-miền-doanh-nghiệp-rfc-9457-problem-details) | Chuẩn hóa cấu trúc lỗi RFC 9457 Problem Details. |

---

## 2. An Toàn Kiểu Tuyệt Đối (TypeScript Strict Discipline)

<a id="std-ts-001"></a>
### 2.1. Tuyệt Đối Cấm Kiểu `any` (`STD-TS-001`)
* **Quy định:** Tuyệt đối cấm khai báo biến, tham số hàm, hoặc giá trị trả về mang kiểu `any`. Khi chưa xác định rõ kiểu dữ liệu, bắt buộc dùng `unknown` và thu hẹp kiểu bằng Type Guards.
* **Vì sao cần làm:** Kiểu `any` vô hiệu hóa hoàn toàn trình biên dịch TypeScript, lây lan rủi ro runtime crash (`Cannot read property of undefined`) sang toàn bộ codebase.
* **Cách thực hiện:**

```typescript
// ❌ Không nên (Anti-pattern): Dùng any làm mất an toàn kiểu
export function parseApiResponse(payload: any) {
  return payload.data.items.map((item: any) => item.title.toUpperCase())
}

// ✅ Nên làm (Best practice): Dùng unknown kết hợp Type Guards an toàn
export interface ApiResponseItem {
  id: string
  title: string
}

export function isApiResponseItem(value: unknown): value is ApiResponseItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    typeof (value as { title: unknown }).title === 'string'
  )
}

export function parseApiResponse(payload: unknown): ApiResponseItem[] {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    const data = (payload as { data: { items?: unknown } }).data
    if (Array.isArray(data.items)) {
      return data.items.filter(isApiResponseItem)
    }
  }
  return []
}
```

<a id="std-ts-002"></a>
### 2.2. Discriminated Unions & Thu Hẹp Kiểu An Toàn (`STD-TS-002`)
* **Quy định:** Khi xử lý các đối tượng có nhiều trạng thái khác nhau (ví dụ: kết quả request, phiên đăng nhập, giao dịch thanh toán), bắt buộc sử dụng **Discriminated Unions** với trường định danh `status` hoặc `type`. Cấm ép kiểu cưỡng bức `as unknown as Type`.
* **Vì sao cần làm:** Giúp TypeScript tự động thu hẹp kiểu dữ liệu trong các nhánh `switch/case` hoặc `if/else`, đảm bảo không thể truy cập thuộc tính của trạng thái này khi đang ở trạng thái khác.

```typescript
// ✅ Nên làm: Discriminated Union mô tả chính xác trạng thái bất đồng bộ
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

export function renderContent<T>(state: AsyncState<T>, renderData: (data: T) => React.ReactNode) {
  switch (state.status) {
    case 'idle':
      return null
    case 'loading':
      return <LoadingSpinner />
    case 'error':
      return <ErrorMessage message={state.error.message} />
    case 'success':
      // TypeScript tự động biết state.data tồn tại và an toàn
      return renderData(state.data)
  }
}
```

<a id="std-ts-003"></a>
### 2.3. Cấu Hình `noUncheckedIndexedAccess` & Truy Cập Mảng (`STD-TS-003`)
* **Quy định:** Hệ thống bật tùy chọn `noUncheckedIndexedAccess` trong `tsconfig.json`. Khi truy cập phần tử mảng bằng index (`arr[0]`) hoặc Record (`dict[key]`), kiểu trả về luôn kèm theo `| undefined`.
* **Vì sao cần làm:** Ngăn chặn lỗi kinh điển khi mảng rỗng nhưng lập trình viên vẫn mặc định phần tử đầu tiên luôn tồn tại.

```typescript
// ❌ Không nên: Giả định phần tử luôn tồn tại
const firstItem = items[0]
// firstItem có thể undefined nếu items rỗng!

// ✅ Nên làm: Kiểm tra an toàn trước khi sử dụng
import { logger } from '@/lib/logger'

const firstItem = items[0]
if (firstItem) {
  logger.info('Truy cập phần tử mảng an toàn', { itemName: firstItem.name })
}
```

---

<a id="std-async-001"></a>
## 3. Quy Tắc Xử Lý Bất Đồng Bộ & Hủy Request Bắt Buộc (`AbortController`)

### 3.1. Rủi Ro Rò Rỉ Bộ Nhớ & Race Conditions
Khi người dùng nhập từ khóa vào ô tìm kiếm hoặc chuyển trang nhanh, các API request cũ vẫn tiếp tục chạy ngầm. Nếu request cũ phản hồi chậm hơn request mới, dữ liệu cũ sẽ ghi đè lên dữ liệu mới (**Race Condition**), hoặc cố gắng cập nhật state của component đã bị hủy (**Memory Leak**).

### 3.2. Chuẩn Mực Liên Kết `AbortSignal` (`STD-ASYNC-001`)
* **Quy định:** 100% các hàm gọi API dài hoặc tìm kiếm tức thì bắt buộc phải nhận tham số `signal?: AbortSignal` và chuyển tiếp cho Axios / Fetch API.
* **Cách thực hiện:**

```typescript
// ✅ Nên làm: Service API hỗ trợ AbortSignal
import api from '@/services/api'

export interface SearchUsersParams {
  query: string
  signal?: AbortSignal
}

export async function searchUsers({ query, signal }: SearchUsersParams): Promise<User[]> {
  const response = await api.get<User[]>('/users/search', {
    params: { q: query },
    signal, // Tự động hủy kết nối khi signal kích hoạt
  })
  return response.data
}

// ✅ Cách sử dụng trong Custom Query Hook (TanStack Query v5):
// TanStack Query tự động inject AbortSignal vào queryFn và tự hủy request khi queryKey đổi hoặc unmount
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.members.search(query),
    queryFn: ({ signal }) => searchUsers({ query, signal }),
    enabled: query.trim().length > 0,
    staleTime: 30_000,
  })
}
```

---

<a id="std-time-001"></a>
## 4. Quy Chuẩn Thời Gian: UTC Server & Hiển Thị Đa Múi Giờ

### 4.1. Lưu Trữ Chuỗi ISO-8601 UTC Trên Server (`STD-TIME-001`)
* **Quy định:** Mọi dữ liệu thời gian lưu trữ trong database và truyền qua API payload bắt buộc phải sử dụng chuỗi định dạng chuẩn **ISO-8601 UTC** kết thúc bằng ký tự `Z` (ví dụ: `2026-10-15T08:30:00.000Z`).
* **Vì sao cần làm:** Tránh hoàn toàn sự sai lệch thời gian khi người dùng và máy chủ nằm ở các múi giờ khác nhau. Tuyệt đối không lưu trữ chuỗi thời gian địa phương thiếu múi giờ (`2026-10-15 15:30:00`).

<a id="std-time-002"></a>
### 4.2. Định Dạng Hiển Thị Qua `Intl.DateTimeFormat` (`STD-TIME-002`)
* **Quy định:** Không tự format chuỗi ngày tháng bằng nối chuỗi thủ công (`date.getDate() + '/' + ...`). Bắt buộc sử dụng API chuẩn của trình duyệt `Intl.DateTimeFormat` thông qua tiện ích dùng chung `@/utils/date`.
* **Cách thực hiện:**

```typescript
// ❌ Không nên: Ghép chuỗi ngày tháng thủ công
const formatted = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`

// ✅ Nên làm: Dùng Intl.DateTimeFormat tự động định dạng theo ngôn ngữ
import { formatDate } from '@/utils/date'

// Tiếng Việt: "15 tháng 10, 2026, 15:30"
// Tiếng Anh: "Oct 15, 2026, 3:30 PM"
export function SessionTimeDisplay({ sessionDate }: { sessionDate: string }) {
  return (
    <time dateTime={sessionDate} className="text-sm text-surface-card-muted">
      {formatDate(sessionDate, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}
    </time>
  )
}
```

---

<a id="std-err-001"></a>
## 5. Cây Phân Cấp Lỗi Miền Doanh Nghiệp (RFC 9457 Problem Details)

### 5.1. Phân Định Các Lớp Lỗi Miền (`STD-ERR-001`)
* **Quy định:** Mọi lỗi phát sinh trong ứng dụng phải được phân loại thành các lớp lỗi có cấu trúc kế thừa từ `Error`, thay vì ném ra các chuỗi string thô (`throw "Lỗi mạng"`).

```typescript
// ✅ Cây phân cấp lỗi chuẩn doanh nghiệp
export class AppError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fieldErrors: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR')
  }
}

export class NetworkError extends AppError {
  constructor(message: string, public isOffline: boolean = false) {
    super(message, 'NETWORK_ERROR')
  }
}

export class ProblemDetailsError extends AppError {
  constructor(
    public status: number,
    public title: string,
    public detail: string,
    public errors?: Record<string, string[]>
  ) {
    super(detail || title, `HTTP_${status}`)
  }
}
```

### 5.2. Chuẩn Hóa Schema Lỗi Problem Details RFC 9457
Toàn bộ phản hồi lỗi từ Backend được phân tích và chuẩn hóa theo chuẩn quốc tế **RFC 9457 (Problem Details for HTTP APIs)**:
```json
{
  "type": "https://api.rogym.com/errors/package-expired",
  "title": "Gói Tập Đã Hết Hạn",
  "status": 403,
  "detail": "Gói tập của hội viên Nguyễn Văn A đã kết thúc vào ngày 14/10/2026. Vui lòng gia hạn để tiếp tục đặt lịch.",
  "instance": "/api/sessions/book/pt-102",
  "code": "PACKAGE_EXPIRED"
}
```

---

## 6. Chuẩn Mực Clean Code, Pure Render & Giữ Gìn Mã Nguồn

<a id="std-pure-001"></a>
### 6.1. Pure Render & Bất Biến Dữ Liệu (Immutability) (`STD-PURE-001`)
* **Quy định:** React Component phải hoạt động như một Pure Function: Với cùng một tập hợp props và state, component luôn trả về cùng một kết quả JSX. Cấm tuyệt đối việc mutate trực tiếp biến props hoặc state.
* **Cách thực hiện:**

```typescript
// ❌ Không nên: Mutate trực tiếp mảng state
function addItem(newItem: Item) {
  items.push(newItem) // Mutate state trực tiếp!
  setItems(items)     // React có thể không nhận diện được thay đổi để re-render
}

// ✅ Nên làm: Sử dụng cú pháp spread để tạo mảng mới
function addItem(newItem: Item) {
  setItems((prevItems) => [...prevItems, newItem])
}
```

<a id="std-name-001"></a>
### 6.2. Quy Ước Đặt Tên Đối Xứng (`STD-NAME-001`)
* **Quy định:**
  - Biến và props kiểu boolean bắt buộc bắt đầu bằng: `is`, `has`, `should`, `can` (ví dụ: `isLoading`, `hasPermission`, `canEdit`).
  - Hàm xử lý sự kiện trong component bắt đầu bằng `handle` (ví dụ: `handleSubmit`, `handleSelectTab`).
  - Props nhận callback sự kiện từ cha truyền xuống bắt đầu bằng `on` (ví dụ: `onSubmit`, `onSelectTab`).

<a id="std-size-001"></a>
<a id="std-magic-001"></a>
### 6.3. Giới Hạn Kích Thước File (.tsx <= 250 dòng) (`STD-SIZE-001`)
* **Quy định:** Mỗi tệp tin component `.tsx` không được vượt quá **250 dòng code**.
* **Vì sao cần làm:** Khi một component vượt quá 250 dòng, nó thường đang ôm đồm quá nhiều trách nhiệm (God Component), gây khó khăn cho việc đọc hiểu, kiểm thử và tái sử dụng.
* **Giải pháp:** Phân tách thành các sub-components cùng thư mục (Co-location) hoặc tách logic tính toán ra Custom Hooks.

<a id="std-ref-001"></a>
### 6.4. Chuẩn Hóa Tham Chiếu `ref`: React 18 (`forwardRef`) vs React 19 (`ref as prop`) (`STD-REF-001`)
* **Bối cảnh tiến hóa công nghệ:**
  - **Trên React 18:** 100% các UI Primitive Components sử dụng `React.forwardRef` bắt buộc phải gán thuộc tính `displayName`:
    ```tsx
    export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
      return <input ref={ref} {...props} />
    })
    Input.displayName = 'Input' // Bắt buộc trên React 18 để DevTools hiển thị tên component
    ```
  - **Trên React 19 (`react19-no-forwardref`):** `forwardRef` chính thức bị deprecated. `ref` giờ đây là một prop thông thường được truyền thẳng vào function component mà không cần bọc qua HOC:
    ```tsx
    // Chuẩn mực React 19 hiện đại:
    export function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
      return <input ref={ref} {...props} />
    }
    ```

<a id="std-clean-001"></a>
### 6.5. Khử Rác Debugging: Cấm `console.log`, `debugger` (`STD-CLEAN-001`)
* **Quy định:** Cấm để sót lại các câu lệnh `console.log()`, `debugger` hoặc các khối comment mã cũ không dùng trong mã nguồn production. Sử dụng tiện ích `logger` từ `@/lib/logger` khi cần ghi log hệ thống có phân cấp.

### 6.6. Chú Thích Ngoại Lệ Có Cấu Trúc (`rogym-convention-exempt`) (`STD-EXEMPT-001`)
* **Quy định:** Trong các trường hợp kỹ thuật đặc thù bắt buộc phải dùng thẻ thô (như container cho biểu đồ), bắt buộc sử dụng cú pháp:
`{/* rogym-convention-exempt: RULE_ID [Lý do kỹ thuật cụ thể] */}`.

<a id="std-memo-001"></a>
### 6.7. Tối Ưu Memoization Tỉnh Táo (`STD-MEMO-001`)
* **Quy định:** Không lạm dụng `useMemo`, `useCallback` bừa bãi cho các phép tính đơn giản (như cộng trừ chuỗi, lọc mảng nhỏ < 50 items). Chỉ sử dụng khi:
  1. Phép tính toán chuyển đổi dữ liệu nặng ($>1000$ phần tử).
  2. Truyền callback xuống component con được bọc bởi `React.memo` để tránh re-render thừa.

<a id="std-vcl-001"></a>
### 6.8. Hiển Thị Điều Kiện Tường Minh Chống Rò Rỉ Falsy (`STD-VCL-001` [rendering-conditional-render])
* **Quy định:** Tuyệt đối cấm sử dụng toán tử `&&` để render có điều kiện khi biến điều kiện là số (number), độ dài mảng (`length`) hoặc chuỗi có thể rỗng. Bắt buộc sử dụng toán tử ba ngôi `? : null`.
* **Vì sao cần làm:** Biểu thức `{items.length && <List />}` khi `items.length = 0` sẽ in ký tự `"0"` lên giao diện web và gây crash ứng dụng trên React Native.
```tsx
// ❌ CẤM
{unreadCount && <Badge>{unreadCount}</Badge>}

// ✅ CHUẨN MỰC
{unreadCount > 0 ? <Badge>{unreadCount}</Badge> : null}
```

<a id="std-js-001"></a>
### 6.9. Bộ 14 Chuẩn Mực Hiệu Năng JavaScript Doanh Nghiệp (Vercel JS Performance Standards)
Hệ thống tích hợp đầy đủ 14 quy tắc tối ưu hóa vi mô JavaScript từ **Vercel Engineering**:
1. `STD-JS-001 [js-early-exit]`: Thoát hàm sớm (Early Exit) với guard clauses thay vì lồng nhiều khối `if/else`.
2. `STD-JS-002 [js-combine-iterations]`: Kết hợp các thao tác `filter` và `map` vào một vòng lặp đơn hoặc dùng `flatMap`.
3. `STD-JS-003 [js-set-map-lookups]`: Sử dụng `Set` hoặc `Map` cho các tra cứu tồn tại để đạt độ phức tạp $O(1)$ thay vì `array.includes()` độ phức tạp $O(N)$.
4. `STD-JS-004 [js-tosorted-immutable]`: Sử dụng `array.toSorted()` hoặc spread `[...array].sort()` để bảo toàn tính bất biến (Immutability), cấm gọi trực tiếp `array.sort()` mutate mảng gốc.
5. `STD-JS-005 [js-batch-dom-css]`: Gom cụm các thao tác đọc và ghi DOM tách biệt, thay đổi style qua CSS classes thay vì gán từng thuộc tính style inline.
6. `STD-JS-006 [js-index-maps]`: Xây dựng Map lập chỉ mục khi cần tra cứu các phần tử theo ID nhiều lần trong vòng đời component.
7. `STD-JS-007 [js-cache-function-results]`: Cache kết quả của các hàm tính toán nặng thuần túy (pure functions) qua module-level Map.
8. `STD-JS-008 [js-cache-storage]`: Cache giá trị đọc từ `localStorage`/`sessionStorage` vào bộ nhớ RAM, tránh đọc ổ đĩa liên tục trong vòng lặp render.
9. `STD-JS-009 [js-cache-property-access]`: Lưu tham chiếu thuộc tính đối tượng lồng sâu vào biến cục bộ khi truy cập nhiều lần trong vòng lặp lớn.
10. `STD-JS-010 [js-length-check-first]`: Kiểm tra độ dài mảng `arr1.length === arr2.length` trước khi thực hiện so sánh sâu tốn kém.
11. `STD-JS-011 [js-hoist-regexp]`: Hoist các biểu thức chính quy `RegExp` ra ngoài phạm vi hàm render để tránh khởi tạo lại nhiều lần.
12. `STD-JS-012 [js-min-max-loop]`: Sử dụng vòng lặp đơn tìm min/max thay vì `array.sort()` để đạt độ phức tạp $O(N)$ thay vì $O(N \log N)$.
13. `STD-JS-013 [js-flatmap-filter]`: Dùng `array.flatMap()` để vừa map vừa lọc phần tử trong một lần duyệt duy nhất.
14. `STD-JS-014 [js-request-idle-callback]`: Trì hoãn các tác vụ phân tích đo lường (telemetry), logging hoặc tính toán thứ cấp sang thời gian rảnh của trình duyệt qua `requestIdleCallback`.

<a id="std-adv-001"></a>
### 6.10. Chuẩn Mực Advanced Patterns Doanh Nghiệp (Vercel Advanced Patterns)
1. `STD-ADV-001 [advanced-effect-event-deps]`: Không đưa hàm sinh từ `useEffectEvent` vào mảng dependencies của effect.
2. `STD-ADV-002 [advanced-event-handler-refs]`: Lưu các event handlers trong `useRef` khi cần giữ tham chiếu ổn định mà không kích hoạt re-render.
3. `STD-ADV-003 [advanced-init-once]`: Khởi tạo cấu hình ứng dụng một lần duy nhất ở module scope hoặc root entry.
4. `STD-ADV-004 [advanced-use-latest]`: Sử dụng hook `useLatest` để đọc giá trị mới nhất trong asynchronous callbacks mà không cần thêm vào deps.

---

## 7. Hệ Thống Kiểm Toán Tĩnh Tự Động & Quy Tắc Hướng Đạo Sinh (Boy Scout Rule)

### 7.1. Cơ Chế Hoạt Động Của `audit-conventions.mjs`
Công cụ kiểm toán tĩnh [`client/scripts/audit-conventions.mjs`](../scripts/audit-conventions.mjs) là chốt chặn tự động kiểm soát chất lượng mã nguồn:
- Quét toàn bộ mã nguồn trong `src/`.
- Áp dụng các quy tắc kiểm tra AST và biểu thức chính quy (Regex).
- Phát hiện các vi phạm về thẻ native, màu hardcode, inline styles, console.log...

### 7.2. Bộ Lọc Ngữ Cảnh Bảo Toàn Số Dòng (Line-preserving Masking)
Trước khi quét lỗi, kịch bản tự động che giấu (masking) các vùng an toàn (như chuỗi template string, import statements, comments) bằng khoảng trắng giữ nguyên số dòng, đảm bảo vị trí dòng báo lỗi luôn trùng khớp 100% với file thực tế trên IDE.

<a id="std-exempt-001"></a>
### 7.3. Cơ Chế Baseline Snapshot (`audit-baseline.json`) & Boy Scout Rule
Để vừa đảm bảo nâng cao chất lượng code, vừa không làm tắc nghẽn tiến độ dự án, hệ thống áp dụng **Quy Tắc Hướng Đạo Sinh (Boy Scout Rule - "Luôn để khu cắm trại sạch hơn khi bạn đến")**:
- Trạng thái lỗi kỹ thuật của toàn bộ dự án được chụp lại trong snapshot [`client/scripts/audit-baseline.json`](../scripts/audit-baseline.json).
- Khi lập trình viên sửa đổi một file, số lượng lỗi/cảnh báo trong file đó **chỉ được phép giữ nguyên hoặc giảm bớt**, tuyệt đối không được phép tăng thêm.

### 7.4. Hướng Dẫn Vận Hành CLI & CI Gatekeeper
```bash
# Quét kiểm toán toàn bộ mã nguồn và hiển thị bảng tổng kết
npm run audit:summary

# Chạy kiểm toán chế độ nghiêm ngặt đối chiếu baseline snapshot
npm run audit:strict

# Cập nhật baseline snapshot khi đã tối ưu làm sạch mã nguồn
npm run audit:update-baseline
```

---

## 8. Checklist Định Lượng Coding Standards Trước Khi Mở PR (12 Tiêu Chí)

Trước khi tạo Pull Request, kỹ sư tự đánh giá mã nguồn theo 12 tiêu chí bắt buộc:

- [ ] **1. Type Safety:** 100% code mới không sử dụng kiểu `any`; không ép kiểu cưỡng bức `as unknown as`.
- [ ] **2. Request Cancellation:** Các API search/fetch kéo dài đều đã gắn `AbortSignal`.
- [ ] **3. UTC Time:** Mọi ngày giờ gửi/nhận API đều là ISO UTC; hiển thị qua `formatDate`.
- [ ] **4. Error Handling:** Sử dụng các lớp lỗi miền có cấu trúc (`ProblemDetailsError`), không throw string thô.
- [ ] **5. File Size:** Tệp `.tsx` không vượt quá 250 dòng code.
- [ ] **6. DisplayName:** Mọi component dùng `forwardRef` đều đã khai báo `displayName`.
- [ ] **7. Pure Render:** Không mutate trực tiếp state hoặc props; không tạo side-effects trong hàm render.
- [ ] **8. Debugging Clean:** Đã xóa toàn bộ `console.log`, `debugger` và comment thừa.
- [ ] **9. Naming Symmetry:** Đặt tên đúng chuẩn: boolean (`is/has`), handler (`handle...`), prop callback (`on...`).
- [ ] **10. Primitive Boundary:** 100% thẻ tương tác đi qua UI Primitives (`<Button>`, `<Input>`).
- [ ] **11. Boy Scout Audit:** Lệnh `npm run audit:strict` trả về Exit Code 0, không làm tăng lỗi so với baseline.
- [ ] **12. TypeScript Type-Check:** Lệnh `npm run type-check` vượt qua 100% với 0 lỗi.



