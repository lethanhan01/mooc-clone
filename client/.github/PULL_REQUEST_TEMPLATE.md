<!--
Cảm ơn bạn đã gửi Pull Request! Vui lòng điền đầy đủ các mục bên dưới.
Tiêu đề PR nên theo Conventional Commits, ví dụ:
  feat(client): thêm trang đăng ký hội viên
  fix(server): sửa lỗi tính phí gia hạn gói tập
  docs: cập nhật hướng dẫn cài đặt
  ci: thêm workflow tự động kiểm thử
-->

## Mô tả

<!-- Mô tả ngắn gọn những thay đổi trong PR này và *vì sao* lại làm như vậy. -->

## Issue liên quan

<!-- Liên kết tới issue được giải quyết. Dùng từ khoá "Closes" để tự đóng issue khi merge. -->

- Closes #

## Loại thay đổi

- [ ] Bug fix (sửa lỗi, không phá vỡ API)
- [ ] Feature (thêm tính năng mới, không phá vỡ API)
- [ ] Breaking change (thay đổi phá vỡ tương thích ngược)
- [ ] Documentation (chỉ thay đổi tài liệu)
- [ ] Refactor (không thay đổi hành vi, không sửa bug)
- [ ] Performance (cải thiện hiệu năng)
- [ ] Test (bổ sung hoặc sửa test)
- [ ] Chore / CI (build, công cụ, workflow)

## Khu vực ảnh hưởng

- [ ] `client/` (React/Vite)
- [ ] `server/` (NestJS/API)
- [ ] `server/prisma/` (Migration / Seed/ Models)
- [ ] `docs/`
- [ ] `.github/` (CI / Templates)

## Checklist của tác giả

- [ ] Code tuân thủ style guide (`npm run lint` và `npm run format` cho cả client/server đều pass).
- [ ] `npm run build` chạy thành công cho phần liên quan (client hoặc server).
- [ ] Đã tự kiểm thử các thay đổi trên máy local.
- [ ] Đã cập nhật / bổ sung test cho thay đổi (khi có test framework).
- [ ] Đã cập nhật README hoặc tài liệu trong `docs/` nếu thay đổi ảnh hưởng tới người dùng/dev.
- [ ] Đã cập nhật `.env.example` nếu có thêm biến môi trường mới.
- [ ] Không commit secret, key, hay file build (`dist/`, `node_modules/`).
- [ ] CI (GitHub Actions) đã pass trên nhánh này.

## Ghi chú dành cho Reviewer

<!-- Lưu ý đặc biệt, vùng code muốn được review kỹ, hoặc trade-off bạn đã chọn. -->
