# Quy Chuẩn Lập Trình Backend & Kiến Trúc Mạng (IT4062 - mooc-clone)

> **Học phần:** IT4062 - Lập Trình Mạng  
> **Dự án:** mooc-clone — Hệ thống Thi Trắc nghiệm Trực tuyến  
> **Phân hệ:** Máy chủ Backend (`server/`) & Máy chủ C11 HTTP/REST Reactor ([server-c/](../server-c/README.md))  
> **Quy chuẩn Lập trình Socket C11 (POSIX):** Xem tài liệu gốc tại [server-c/CONVENTIONS.md](../server-c/CONVENTIONS.md)  
> **Kiến trúc Mạng & Đồng bộ Thời gian thực:** Xem tại [docs/realtime-network-subsystem.md](docs/realtime-network-subsystem.md)

---

## 1. Phân Định Quy Chuẩn Giữa Hai Phân Hệ Máy Chủ (`server-c/` & `server/`)

Hệ thống `mooc-clone` bao gồm 2 phân hệ máy chủ bổ trợ cho nhau:
1. **Phân hệ Mạng C11/POSIX (`server-c/`):**
   - Cài đặt trực tiếp từ tầng TCP Socket POSIX (`socket`, `bind`, `listen`, `accept4`), dồn kênh không chặn bằng Linux `epoll` (`EPOLLIN | EPOLLET | EPOLLRDHUP | EPOLLONESHOT`), máy trạng thái phân tích HTTP/1.1 FSM 13 trạng thái ([http_parser.c](../server-c/src/http_parser.c)) và điều phối kết nối theo mô hình **Doug Lea Classic Reactor + Worker ThreadPool** ([reactor.c](../server-c/src/reactor.c)).
   - Toàn bộ quy ước đặt tên biến Socket, xử lý Partial Read/Write (`tcp_send_all`), đóng khung thông điệp HTTP/1.1 và chuẩn Doxygen của phân hệ C11 được quy định bắt buộc tại **[server-c/CONVENTIONS.md](../server-c/CONVENTIONS.md)**.
2. **Phân hệ Dịch vụ Nghiệp vụ & CSDL (`server/`):**
   - Xây dựng trên nền tảng **Java 21 LTS & Spring Boot 3.4.3**, quản lý xác thực Opaque Session Token SHA-256, lưu trữ PostgreSQL 14+ (chuẩn 3NF + 5 Dynamic Views) và cung cấp RESTful API Stateless kết hợp đồng hồ chuẩn máy chủ (`serverNow`, `endsAt`) phục vụ HTTP Short Polling.

---

## 2. Naming & Package Structure (Đặt tên & Cấu trúc Package Java 21)

- **Nguyên tắc cốt lõi:** Định danh phải phản ánh chính xác ngữ cảnh nghiệp vụ, vòng đời tài nguyên và tính an toàn đồng thời.
- **Cấu trúc Package (`com.example.server.<domain>`):**
  - `controller`: Tiếp nhận HTTP Request, kích hoạt `@Valid` và trả về khung chuẩn `ApiResponse<T>`.
  - `service` & `service.impl`: Xử lý toàn bộ logic nghiệp vụ, máy trạng thái phòng thi (`WAITING` $\rightarrow$ `RUNNING` $\rightarrow$ `ENDED`), đánh giá hết hạn lười (Lazy Expiration) và cửa sổ ân hạn nộp bài (Grace Period 2000ms).
  - `repository`: Giao tiếp với PostgreSQL qua Spring Data JPA và các Dynamic Views.
  - `dto`: Các đối tượng truyền tải dữ liệu bất biến khai báo 100% bằng **Java 21 Record**.
- **Hằng số (`public static final`):** Sử dụng `UPPER_SNAKE_CASE`, tuyệt đối không dùng hằng số ma thuật (magic numbers) rải rác trong logic nghiệp vụ.

---

## 3. Formatting & Code Structure (Định dạng & Cấu trúc Code Java 21)

- **Thụt lề:** Sử dụng **4 spaces**; tuyệt đối không dùng ký tự Tab.
- **Dấu mở ngoặc nhọn `{`:** Đặt cùng dòng với câu lệnh điều khiển (`if`, `while`, `for`, `try`, `switch`) và khai báo lớp/hàm (chuẩn K&R).
- **Độ dài dòng:** Giới hạn tối đa 120 ký tự.
- **Chuẩn cú pháp Java 21 hiện đại:**
  - Sử dụng **Java Records** cho toàn bộ Request/Response DTOs (ví dụ: `RoomDetailResponse`, `RoomSummaryDto`).
  - Sử dụng **Pattern Matching cho `instanceof`** và **Switch Expressions dạng mũi tên (`->`)**.
  - Không phụ thuộc vào Lombok để đảm bảo tương thích tuyệt đối với trình biên dịch Java 21+.

---

## 4. Quy Chuẩn Đồng Bộ Phòng Thi Stateless REST & Đa Luồng

1. **Đồng hồ chuẩn máy chủ (Server Authoritative Timestamp):**
   - Mọi phản hồi trạng thái phòng thi từ [ExamRoomController.java](src/main/java/com/example/server/controller/ExamRoomController.java) và [RoomServiceImpl.java](src/main/java/com/example/server/service/impl/RoomServiceImpl.java) (tương đồng với [rest_controllers.c](../server-c/src/rest_controllers.c)) phải đính kèm `serverNow` và `endsAt` để Client tính độ lệch đồng hồ $\Delta t$ chống gian lận chỉnh giờ hệ điều hành.
2. **Đánh giá hết hạn lười (Lazy State Transition) & Grace Period:**
   - Không tạo luồng Timer chạy ngầm cho từng phòng thi. Khi xử lý truy vấn đọc hoặc nộp bài mà thời gian máy chủ đã chạm mốc `endsAt`, tự động chuyển trạng thái phòng sang `ENDED` và áp dụng dung sai trễ mạng `2000ms` (Grace Period) cho các yêu cầu auto-submit cuối giờ.
3. **Ghi log chuẩn với SLF4J:**
   - ❌ **TUYỆT ĐỐI CẤM:** Dùng `System.out.println()`, `System.err.println()`, hoặc `e.printStackTrace()`.
   - ✅ **BẮT BUỘC:** Sử dụng `org.slf4j.Logger` thông qua `LoggerFactory.getLogger(...)`.

---

## 5. Quick Review Checklist Trước Khi Commit (Definition of Done)

- [ ] **1. Tuân thủ chuẩn C11 (`server-c/`):** Đạt 0 cảnh báo với `make lint`, vượt qua 100% `make test` và `make memcheck` (0 memory leaks) theo [server-c/CONVENTIONS.md](../server-c/CONVENTIONS.md).
- [ ] **2. Cấu trúc phân tầng (`server/`):** Luồng gọi đi một chiều `Controller -> Service -> Repository`, 100% DTO là Java 21 Record.
- [ ] **3. Đồng bộ thời gian chuẩn:** Phản hồi phòng thi luôn trả kèm mốc thời gian chuẩn của máy chủ và kiểm tra Lazy Expiration + Grace Period.
- [ ] **4. Ghi Log & Xử lý lỗi:** Sử dụng SLF4J `Logger` và quản lý mã lỗi tập trung qua `ErrorCode` + `AppException`.
- [ ] **5. Kiểm thử Tự động:** Toàn bộ bộ kiểm thử đơn vị và tích hợp chạy thành công (`.\mvnw.cmd test` và `npm --prefix client run verify:docs`).
