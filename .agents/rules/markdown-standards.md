# RoGym Markdown Documentation & Link Architecture Standards

> **Tiêu chuẩn Kỹ thuật Tài liệu Markdown & Cấu trúc Đường dẫn RoGym**  
> *Phiên bản:* 1.0.0 (Strict Enterprise Rule)  
> *Phạm vi áp dụng:* Toàn bộ lập trình viên, AI Agents, công cụ tự động hóa khi tạo mới, biên tập hoặc kiểm tra các tệp tài liệu Markdown (`.md`) trong kho mã nguồn RoGym.

---

## 1. NGUYÊN TẮC BẤT KHẢ XÂM PHẠM: CẤM TUYỆT ĐỐI ĐƯỜNG DẪN TUYỆT ĐỐI (ABSOLUTE PATHS)

### 1.1 Danh mục Cấm Tuyệt đối trong nội dung Markdown:
- ❌ **CẤM URI lược đồ tệp cục bộ:** `file:///...`, `file://c:/...`, `file:///C:/...`
- ❌ **CẤM Đường dẫn ổ đĩa Windows:** `C:\Users\...`, `c:/Users/...`, `D:\...`
- ❌ **CẤM Đường dẫn thư mục gốc người dùng Unix/macOS:** `/home/...`, `/Users/...`, `/root/...`
- ❌ **CẤM Che giấu đường dẫn tuyệt đối dưới nhãn tương đối:**
  - *Sai phạm nghiêm trọng:* `[ui/Button.tsx]` trỏ tới `file:///...`
  - *Chuẩn mực:* `[ui/Button.tsx]` trỏ tới `ui/Button.tsx`

### 1.2 Nguyên nhân kỹ thuật:
1. **Tính di động (Portability):** Đường dẫn tuyệt đối phụ thuộc vào cấu trúc thư mục của máy trạm cá nhân, lập tức bị hỏng khi chạy trên máy lập trình viên khác, môi trường CI/CD (GitHub Actions), Docker, hoặc Vercel deployment.
2. **Bảo mật mã nguồn (Security & Privacy):** Tránh lộ tên người dùng hệ thống (`Users/An`), cấu trúc thư mục máy cá nhân vào kho lưu trữ git.
3. **Trải nghiệm đọc Markdown (Developer Experience):** GitHub, GitLab, VS Code Markdown Preview, và Antigravity IDE chỉ điều hướng chính xác giữa các tài liệu khi sử dụng đường dẫn tương đối (Relative Path).

---

## 2. QUY CHUẨN ĐƯỜNG DẪN TƯƠNG ĐỐI (RELATIVE PATHS RESOLUTION)

Mọi liên kết tới tệp mã nguồn, tệp tài liệu, hoặc thư mục bắt buộc phải tính **tương đối từ vị trí tệp Markdown hiện tại**:

| Vị trí file Markdown | Tệp cần liên kết tới | Cách viết ĐÚNG (Relative Path) | Cách viết SAI (Cấm) |
| :--- | :--- | :--- | :--- |
| `client/src/components/README.md` | `client/src/components/ui/Button.tsx` | Nhãn `ui/Button.tsx` trỏ `ui/Button.tsx` | `file:///[cấm]...` hoặc `/ui/Button.tsx` |
| `client/src/components/README.md` | `client/src/components/shared/Spinner.tsx` | Nhãn `shared/Spinner.tsx` trỏ `shared/Spinner.tsx` | `client/src/components/shared/Spinner.tsx` |
| `client/FRONTEND_CONVENTIONS.md` | `client/docs/01-architecture-and-structure.md` | Nhãn `Chuyên Đề 01` trỏ `docs/01-architecture-and-structure.md` | `file:///[cấm]...` |
| `client/docs/01-architecture-and-structure.md` | `client/FRONTEND_CONVENTIONS.md` | Nhãn `Quy chuẩn` trỏ `../FRONTEND_CONVENTIONS.md` | `file:///[cấm]...` |
| `.agents/skills/.../SKILL.md` | `client/FRONTEND_CONVENTIONS.md` | Nhãn `Portal` trỏ `../../../client/FRONTEND_CONVENTIONS.md` | `file:///[cấm]...` |

### Quy tắc đồng bộ Nhãn và Đường dẫn:
- Nhãn hiển thị của link file nên ngắn gọn, phản ánh đúng cấu trúc logic (ví dụ nhãn `ui/SubmitButton.tsx` trỏ tới `ui/SubmitButton.tsx`).
- Không để link target rỗng `[]()` hoặc link trỏ vào file không tồn tại (Dead links).

---

## 3. QUY CHUẨN CÚ PHÁP BIỂU ĐỒ MERMAID AN TOÀN (ZERO PARSE ERRORS)

Để đảm bảo các khối sơ đồ Mermaid hiển thị hoàn hảo trên mọi trình đọc (GitHub, Antigravity IDE, VS Code, Docusaurus) và không bao giờ gặp lỗi biên dịch cú pháp (`got 'PS'` / `got 'PIPE'`):

### 3.1 Quy tắc Node có chứa dấu ngoặc hoặc ký tự đặc biệt:
Khi văn bản trong node chứa dấu ngoặc đơn `()`, ngoặc vuông `[]`, dấu phẩy `,`, dấu gạch đứng `|`, hoặc `<br/>`:
- **BẮT BUỘC** bọc toàn bộ chuỗi văn bản trong cặp nháy kép `["..."]`.
- Đối với node hình stadium `([ ... ])`:
  - ❌ **SAI:** `Start([Cần hiển thị thông tin dạng lớp phủ (Overlay)?])` *(Gây lỗi `got 'PS'`)*
  - ✅ **ĐÚNG:** `Start(["Cần hiển thị thông tin dạng lớp phủ (Overlay)?"])`
- Đối với node hình chữ nhật `[ ... ]`:
  - ❌ **SAI:** `F8[Button variant='primary' | 'outline']` *(Gây lỗi `got 'PIPE'`)*
  - ✅ **ĐÚNG:** `F8["Button (variant: primary / outline / danger...)"]`

### 3.2 Quy tắc Nhãn trên Cạnh / Đường Nối (`|...|`):
Khi nhãn trên đường nối cạnh có chứa dấu ngoặc đơn `()` hoặc ký tự ngắt:
- **BẮT BUỘC** bọc chuỗi nhãn trong cặp nháy kép `|"..."|`.
  - ❌ **SAI:** `LabelType -->|Thẻ số liệu thống kê Dashboard (KPI, doanh thu)| L2` *(Gây lỗi `got 'PS'`)*
  - ✅ **ĐÚNG:** `LabelType -->|"Thẻ số liệu thống kê Dashboard (KPI, doanh thu)"| L2`
  - ❌ **SAI:** `ModalType -->|Panel trượt từ cạnh phải/trái (Drawer)| M3`
  - ✅ **ĐÚNG:** `ModalType -->|"Panel trượt từ cạnh phải/trái (Drawer)"| M3`

---

## 4. TỰ ĐỘNG HÓA KIỂM SOÁT TOÀN VẸN (AUTOMATED AUDIT & VERIFICATION)

Mọi tệp Markdown trong hệ thống được bảo vệ và kiểm tra tự động bởi script kiểm toán toàn vẹn:
```bash
npm --prefix client run verify:docs
# Hoặc chạy kiểm tra toàn diện:
npm --prefix client run verify:batch-3
```

Kịch bản kiểm tra tự động sẽ lập tức đánh **FAIL** nếu phát hiện:
1. Bất kỳ ký tự `file:///`, `C:`, `c:/`, `/Users/` nào xuất hiện trong các tệp Markdown.
2. Bất kỳ khối Mermaid nào có node stadium hoặc nhãn cạnh chứa unquoted parentheses `(`.
3. Bất kỳ liên kết nội bộ nào trỏ tới tệp hoặc neo tiêu đề (#heading-slug) không tồn tại.
