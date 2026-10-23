# mooc-clone System — Master AI Agent Directives (`AGENTS.md`)

> **Chỉ thị Cốt lõi dành cho Toàn bộ AI Coding Assistants & Subagents**  
> Áp dụng cho: Antigravity IDE, Claude Code, GitHub Copilot, và các công cụ phát triển AI trong kho lưu trữ `mooc-clone`.

---

## 1. CẤU TRÚC DỰ ÁN & BẢN ĐỒ CHỈ DẪN

Hệ thống thi trắc nghiệm trực tuyến mooc-clone là một Monorepo gồm 2 phân hệ độc lập hoàn toàn:
- `client/`: Single Page Application (React 19 + Vite + Tailwind CSS v4 + Radix UI + TanStack Query v5 + Zustand + Socket.IO client).
- `server/`: Backend dịch vụ & Socket server (quản lý phòng thi, đếm giờ, kết nối mạng thời gian thực).
- `.agents/`: Hệ thống Customizations của Antigravity (10 Skills & Rules).

### Các Tài Liệu Quy Chuẩn Chuyên Sâu Cần Tuân Thủ:
1. **Frontend Architecture & Conventions:**
   - `client/FRONTEND_CONVENTIONS.md` — Cổng quy chuẩn Master 19 Rules & Bảng tra cứu.
2. **Markdown Documentation & Path Rules:**
   - `.agents/rules/markdown-standards.md` — Tiêu chuẩn viết Markdown, cấu trúc đường dẫn tương đối và cú pháp Mermaid an toàn.
3. **Agent Skills:**
   - `.agents/skills/mooc-frontend-conventions/SKILL.md` — Cẩm nang phát triển mooc-clone Frontend.

---

## 2. QUY CHUẨN ĐƯỜNG DẪN TÀI LIỆU MARKDOWN (MARKDOWN PATH STANDARDS)

Khi tạo mới, chỉnh sửa, hoặc trích dẫn mã nguồn trong bất kỳ tệp Markdown (`.md`) nào:
- ❌ **TUYỆT ĐỐI CẤM** dùng đường dẫn tuyệt đối: `file:///...`, `c:/Users/...`, `C:\...`, `/home/...`.
- ✅ **BẮT BUỘC** dùng đường dẫn tương đối (Relative Paths) tính từ vị trí tệp Markdown hiện tại.

---

## 3. QUY TRÌNH KIỂM SOÁT TOÀN VẸN TRƯỚC KHI HOÀN TẤT TASK

Trước khi bàn giao bất kỳ tính năng hoặc tài liệu nào, Agent bắt buộc chạy bộ kiểm tra tự động:
```bash
# 1. Kiểm tra tính toàn vẹn tài liệu Markdown & Link Paths
npm --prefix client run verify:docs

# 2. Kiểm tra tuân thủ Static Audit Frontend
npm --prefix client run audit:strict

# 3. Chạy toàn bộ Test Suites
npm --prefix client test
```
