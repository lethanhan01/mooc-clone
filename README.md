# mooc-clone — Hệ thống Thi Trắc nghiệm Trực tuyến

Hệ thống thi trắc nghiệm trực tuyến thời gian thực (Online Examination System) theo mô hình Client-Server đa nền tảng, hỗ trợ phòng thi đồng bộ qua Socket, chế độ luyện tập cá nhân, quản lý ngân hàng câu hỏi phân cấp và trực quan hóa kết quả bằng biểu đồ thống kê.

---

## 1. Cấu trúc Dự án (Monorepo Architecture)

Dự án được tổ chức theo kiến trúc Monorepo phân tách rõ ràng giữa tầng giao diện người dùng và tầng máy chủ dịch vụ:

```text
mooc-clone/
├── client/          # Ứng dụng Single Page Application (SPA)
│   ├── src/         # Mã nguồn React 19, TypeScript, Tailwind CSS v4
│   ├── docs/        # 17 chuyên đề kỹ thuật chi tiết của Frontend
│   └── FRONTEND_CONVENTIONS.md  # Bộ quy chuẩn phát triển Frontend
├── server/          # Máy chủ Backend & Dịch vụ Socket thời gian thực
│   ├── src/         # Mã nguồn Java Spring Boot
│   ├── online_exam_database_design.md  # Thiết kế chi tiết cơ sở dữ liệu
│   └── online_exam_schema.sql          # Kịch bản khởi tạo CSDL PostgreSQL
└── README.md        # Tài liệu tổng quan dự án và thang điểm
```

---

## 2. Danh sách Chức năng Chi tiết

Hệ thống cung cấp đầy đủ các tính năng phục vụ cho cả thí sinh, người tạo phòng và quản trị viên:

### 2.1 Chế độ thi (Exam Room Mode)
* **Tạo và thiết lập phòng thi:** Người dùng có thể tạo phòng thi mới, cấu hình số lượng câu hỏi, thời gian thi cho phòng thi. Chủ phòng có toàn quyền quyết định bắt đầu thi cũng như thời điểm kết thúc cho phòng thi.
* **Danh sách phòng thi & Trạng thái:** Xem danh sách toàn bộ các phòng thi kèm trạng thái trực quan theo thời gian thực (chưa bắt đầu, đang diễn ra, đã kết thúc).
* **Tham gia phòng thi:** Cho phép thí sinh tham gia vào một phòng thi khi phòng thi chưa bắt đầu.
* **Cấp phát đề thi đồng bộ:** Khi bắt đầu thi, máy chủ (server) sẽ gửi lại cho người dùng đề thi bao gồm các câu hỏi thi tương ứng với cấu hình phòng.
* **Làm bài linh hoạt:** Cho phép người dùng thay đổi các câu hỏi đã trả lời nếu còn thời gian làm bài.
* **Nộp bài sớm:** Người dùng có thể chủ động nộp bài sớm trước khi thời gian thi kết thúc.
* **Tự động chấm điểm & Thông báo:** Sau khi hết giờ thi, server tự động chốt bài và thông báo số câu trả lời đúng cho người thi tương ứng.
* **Xem kết quả phòng thi:** Xem kết quả thi chi tiết của các phòng thi đã kết thúc.

### 2.2 Chế độ luyện tập (Practice Mode)
* Trong chế độ này, người dùng làm các bài thi luyện tập cá nhân với số lượng câu hỏi và thời gian làm bài nhất định.
* Sau khi hoàn thành bài thi, ứng dụng lập tức thông báo số câu trả lời đúng và kết quả chi tiết.

### 2.3 Phân loại câu hỏi & Quản lý đề thi
* Phân loại câu hỏi theo độ khó (Dễ, Trung bình, Khó) cũng như theo từng chủ đề.
* Lựa chọn thiết lập số lượng từng loại câu hỏi cho đề thi linh hoạt khi tạo phòng thi.

### 2.4 Lưu trữ lịch sử & Thống kê đồ thị
* Lưu trữ toàn diện thông tin các bài thi người dùng đã làm và hiển thị lại theo yêu cầu.
* Thống kê trực quan bằng đồ thị về tiến độ, điểm số và hiệu suất các bài thi người dùng đã thực hiện.

### 2.5 Giao diện & Kết nối mạng thời gian thực
* **Giao diện đồ họa (GUI):** Thiết kế trực quan, hiện đại, tối ưu trải nghiệm người dùng trên máy tính và thiết bị di động.
* **Cơ chế mạng:** Cài đặt cơ chế vào/ra socket trên server, xử lý truyền dòng dữ liệu đồng bộ đa kết nối.

---

## 3. Bảng Điểm & Tiêu chí Đánh giá (Rubric)

Toàn bộ các tiêu chí tính điểm của hệ thống được quy định chi tiết trong bảng dưới đây:

| STT | Tiêu chí đánh giá | Điểm số | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | **Xử lý truyền dòng** | **1 điểm** | Tối ưu luồng dữ liệu stream, xử lý buffer và phân đoạn gói tin |
| 2 | **Cài đặt cơ chế vào/ra socket trên server** | **2 điểm** | Kiến trúc non-blocking/multi-threaded I/O, lắng nghe và xử lý sự kiện |
| 3 | **Đăng ký và quản lý tài khoản** | **2 điểm** | Đăng ký tài khoản mới, kiểm tra trùng lặp, bảo mật thông tin người dùng |
| 4 | **Đăng nhập và quản lý phiên** | **2 điểm** | Xác thực người dùng, cấp phát token/session hash, kiểm tra hết hạn |
| 5 | **Kiểm soát quyền truy cập** | **1 điểm** | Phân quyền vai trò (User/Admin, chủ phòng vs thành viên phòng) |
| 6 | **Tham gia chế độ luyện tập** | **1 điểm** | Khởi tạo attempt luyện tập cá nhân độc lập, tính điểm tức thì |
| 7 | **Tạo phòng thi** | **2 điểm** | Thiết lập cấu hình phòng, thời gian, số câu hỏi theo độ khó |
| 8 | **Xem danh sách phòng thi** | **1 điểm** | Hiển thị trạng thái phòng (chưa bắt đầu, đang diễn ra, kết thúc) |
| 9 | **Tham gia vào phòng thi** | **2 điểm** | Kiểm tra điều kiện phòng chờ, đồng bộ danh sách thành viên tham gia |
| 10 | **Bắt đầu bài thi** | **1 điểm** | Đồng bộ thời gian bắt đầu, phân phối đề thi nhất quán cho toàn bộ thí sinh |
| 11 | **Thay đổi phương án trả lời trước đó** | **1 điểm** | Cập nhật câu trả lời linh hoạt trong suốt thời gian làm bài còn hiệu lực |
| 12 | **Nộp bài và chấm điểm** | **2 điểm** | Cơ chế nộp bài chủ động, tự động thu bài khi hết giờ, chấm điểm tự động |
| 13 | **Xem kết quả thi của các phòng thi** | **1 điểm** | Bảng xếp hạng và kết quả chi tiết của phòng thi sau khi kết thúc |
| 14 | **Ghi log hoạt động** | **1 điểm** | Ghi nhận sự kiện nghiệp vụ và bảo mật (audit logs) |
| 15 | **Phân loại câu hỏi theo độ khó, chủ đề** | **1 – 3 điểm** | Phân chia ngân hàng câu hỏi, hỗ trợ lọc và sinh đề theo tỷ lệ |
| 16 | **Lưu trữ thông tin bài thi + đồ thị** | **2 điểm** | Lưu lịch sử snapshot bài thi, trực quan hóa tiến trình qua biểu đồ |
| 17 | **Giao diện đồ họa** | **3 điểm** | Giao diện hiện đại, thân thiện, tương tác phản hồi mượt mà |
| 18 | **Các chức năng nâng cao khác** | **1 – 10 điểm** | Các tính năng mở rộng (chống gian lận, tối ưu hiệu năng, v.v.) |

---

## 4. Hướng dẫn Khởi chạy (Quick Start Guide)

### 4.1 Khởi tạo Cơ sở Dữ liệu (PostgreSQL 14+)
1. Tạo một cơ sở dữ liệu trống trên PostgreSQL (ví dụ: `online_exam_db`).
2. Thực thi kịch bản tạo bảng và view tại [server/online_exam_schema.sql](server/online_exam_schema.sql):
   ```bash
   psql -U postgres -d online_exam_db -f server/online_exam_schema.sql
   ```

### 4.2 Khởi chạy Máy chủ Backend (Java Spring Boot)
Di chuyển vào thư mục `server/` và khởi chạy qua Maven Wrapper:
```bash
# Trên Windows (PowerShell / Command Prompt)
cd server
.\mvnw.cmd spring-boot:run

# Trên Linux / macOS
cd server
./mvnw spring-boot:run
```

### 4.3 Khởi chạy Ứng dụng Giao diện Client (Vite + React)
Di chuyển vào thư mục `client/`, cài đặt gói thư viện và chạy máy chủ phát triển:
```bash
cd client
npm install
npm run dev
```

---

## 5. Tài liệu Kỹ thuật Liên quan

* **Thiết kế Cơ sở Dữ liệu Backend:** Chi tiết 15 bảng, 4 views và các ràng buộc toàn vẹn tại [server/online_exam_database_design.md](server/online_exam_database_design.md).
* **Quy chuẩn Phát triển Frontend:** Tiêu chuẩn 19 Master Rules, Design Tokens và Semantic Architecture tại [client/FRONTEND_CONVENTIONS.md](client/FRONTEND_CONVENTIONS.md).
