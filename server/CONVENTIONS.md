# Quy Chuẩn Lập Trình Backend & Kiến Trúc Mạng (IT4062 - mooc-clone)

> **Học phần:** IT4062 - Lập Trình Mạng  
> **Dự án:** mooc-clone — Hệ thống Thi Trắc nghiệm Trực tuyến  
> **Phân hệ:** Máy chủ Headless Java TCP Worker (`server/`) & Máy chủ C Communication Engine ([server-c/](../server-c/README.md))  
> **Quy chuẩn Lập trình Socket C11 (POSIX):** Xem tài liệu gốc tại [server-c/CONVENTIONS.md](../server-c/CONVENTIONS.md)  
> **Kiến trúc Mạng & Đồng bộ Thời gian thực:** Xem tại [docs/realtime-network-subsystem.md](docs/realtime-network-subsystem.md)

---

## 1. Phân Định Quy Chuẩn Giữa Hai Phân Hệ Máy Chủ (`server-c/` & `server/`)

Hệ thống `mooc-clone` bao gồm 2 phân hệ máy chủ phối hợp qua kênh TCP bền vững:
1. **Phân hệ C Communication Engine (`server-c/`):**
   - Cài đặt trực tiếp từ tầng TCP Socket POSIX (`socket`, `bind`, `listen`, `accept`), dồn kênh đơn luồng không chặn bằng POSIX `poll()`, cắt khung nhị phân **16-byte TLV Framing** ([engine_protocol.c](../server-c/src/engine_protocol.c)) và định tuyến bản tin Unicast/Broadcast tại [c_gateway_main.c](../server-c/src/c_gateway_main.c).
   - Toàn bộ quy ước đặt tên biến Socket, xử lý Partial Read/Write (`tcp_send_all`) và chuẩn Doxygen của phân hệ C11 được quy định bắt buộc tại **[server-c/CONVENTIONS.md](../server-c/CONVENTIONS.md)**.
2. **Phân hệ Dịch vụ Nghiệp vụ & CSDL (`server/`):**
   - Xây dựng trên nền tảng **Java 21 LTS & Spring Boot 3.4.3** ở chế độ **Headless TCP Worker** (`spring.main.web-application-type=none`), loại bỏ hoàn toàn HTTP/Tomcat (`:8080`).
   - Kết nối trực tiếp vào C Gateway (`:9000`) qua [`GatewayWorkerClient`](src/main/java/com/example/server/gateway/GatewayWorkerClient.java) (kèm cơ chế bảo vệ chống chạy trùng Single-Instance Lock), điều phối Opcodes tại [`GatewayMessageDispatcher`](src/main/java/com/example/server/gateway/GatewayMessageDispatcher.java) và lưu trữ PostgreSQL 14+ chuẩn 3NF.

---

## 2. Naming & Package Structure (Đặt tên & Cấu trúc Package Java 21)

- **Nguyên tắc cốt lõi:** Định danh phải phản ánh chính xác ngữ cảnh nghiệp vụ, vòng đời tài nguyên và tính an toàn đồng thời.
- **Cấu trúc Package (`com.example.server.<domain>`):**
  - `gateway`: Kết nối TCP Worker bền vững (`GatewayWorkerClient`), đóng/mở gói Header TLV 16B (`EngineHeader`, `EngineProtocolConstants`), điều phối Opcodes (`GatewayMessageDispatcher`) và phát sự kiện thời gian thực (`GatewayBroadcastSender`).
  - `service` & `service.impl`: Xử lý toàn bộ logic nghiệp vụ, máy trạng thái phòng thi (`WAITING` -> `RUNNING` -> `ENDED`), đánh giá hết hạn lười (Lazy Expiration) và cửa sổ ân hạn nộp bài (Grace Period 2000ms).
  - `repository`: Giao tiếp với PostgreSQL qua Spring Data JPA.
  - `dto`: Các đối tượng truyền tải dữ liệu bất biến khai báo 100% bằng **Java 21 Record**.
  - `security`: Quản lý ngữ cảnh người dùng theo luồng xử lý bằng `ThreadLocal` thuần ([`SecurityUtil`](src/main/java/com/example/server/security/SecurityUtil.java)).
- **Hằng số (`public static final`):** Sử dụng `UPPER_SNAKE_CASE`, tuyệt đối không dùng hằng số ma thuật (magic numbers) rải rác trong logic nghiệp vụ.

---

## 3. Formatting & Code Structure (Định dạng & Cấu trúc Code Java 21)

- **Thụt lề:** Sử dụng **4 spaces**; tuyệt đối không dùng ký tự Tab.
- **Dấu mở ngoặc nhọn `{`:** Đặt cùng dòng với câu lệnh điều khiển (`if`, `while`, `for`, `try`, `switch`) và khai báo lớp/hàm (chuẩn K&R).
- **Độ dài dòng:** Giới hạn tối đa 120 ký tự.
- **Chuẩn cú pháp Java 21 hiện đại:**
  - Sử dụng **Java Records** cho toàn bộ Request/Response DTOs (ví dụ: `RoomDetailResponse`, `RoomSummaryDto`).
  - Sử dụng **Pattern Matching cho `instanceof`** và **Switch Expressions**.
  - Không phụ thuộc vào Lombok để đảm bảo tương thích tuyệt đối với trình biên dịch Java 21+.

---

## 4. Quy Chuẩn Đồng Bộ Phòng Thi Thời Gian Thực & Đa Luồng

1. **Đồng hồ chuẩn máy chủ (Server Authoritative Timestamp):**
   - Mọi phản hồi chi tiết phòng thi từ [`RoomServiceImpl.java`](src/main/java/com/example/server/service/impl/RoomServiceImpl.java) đính kèm `serverNow` và `endsAt` để Client tính độ lệch đồng hồ chống gian lận chỉnh giờ hệ điều hành.
2. **Đánh giá hết hạn lười (Lazy State Transition) & Grace Period:**
   - Khi xử lý truy vấn đọc hoặc nộp bài mà thời gian máy chủ đã chạm mốc `endsAt`, tự động chuyển trạng thái phòng sang `ENDED` và áp dụng dung sai trễ mạng `2000ms` (Grace Period) cho các yêu cầu nộp bài cuối giờ.
3. **Ghi log chuẩn với SLF4J:**
   - ❌ **TUYỆT ĐỐI CẤM:** Dùng `System.out.println()`, `System.err.println()`, hoặc `e.printStackTrace()`.
   - ✅ **BẮT BUỘC:** Sử dụng `org.slf4j.Logger` thông qua `LoggerFactory.getLogger(...)`.

---

## 5. Quick Review Checklist Trước Khi Commit (Definition of Done)

- [ ] **1. Tuân thủ chuẩn C11 (`server-c/`):** Đạt 0 cảnh báo với `make lint`, vượt qua 100% `make test` và `make memcheck` (0 memory leaks) theo [server-c/CONVENTIONS.md](../server-c/CONVENTIONS.md).
- [ ] **2. Cấu trúc phân tầng (`server/`):** Luồng gọi đi một chiều `GatewayMessageDispatcher -> Service -> Repository`, 100% DTO là Java 21 Record, không phụ thuộc HTTP/Servlet.
- [ ] **3. Bảo vệ Single-Instance & Cô lập Test:** `GatewayWorkerClient` khóa tệp `.lock` trước khi mở kết nối, các `@SpringBootTest` đặt `mooc.gateway.enabled=false`.
- [ ] **4. Ghi Log & Xử lý lỗi:** Sử dụng SLF4J `Logger` và quản lý mã lỗi tập trung qua `ErrorCode` + `AppException`.
- [ ] **5. Kiểm thử Tự động:** Toàn bộ bộ kiểm thử đơn vị và tích hợp chạy thành công (`.\mvnw.cmd test` và `npm --prefix client run verify:docs`).
