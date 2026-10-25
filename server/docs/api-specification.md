# Đặc Tả Chuẩn Hóa RESTful API, Khung Phản Hồi ApiResponse & Swagger UI

> **Phân hệ:** Máy chủ Backend (`server/`) — Nền tảng Spring Boot 3.4.3 & SpringDoc OpenAPI 2.8.5  
> **Cấu trúc bao gói:** Chuẩn hóa dữ liệu JSON đầu ra qua [ApiResponse.java](../src/main/java/com/example/server/dto/common/ApiResponse.java)  
> **Phân trang:** Chuẩn hóa cấu trúc phân trang qua [PageResponse.java](../src/main/java/com/example/server/dto/common/PageResponse.java)  
> **Giao diện trực quan:** Swagger UI tích hợp tại `http://localhost:8080/swagger-ui/index.html`

---

## 1. Chuẩn Hóa Khung Phản Hồi Duy Nhất (`ApiResponse<T>`)

Mọi yêu cầu gửi tới REST API của `mooc-clone` đều nhận được cấu trúc phản hồi đồng nhất, giúp Client dễ dàng bóc tách dữ liệu và hiển thị thông báo lỗi nhất quán.

### 1.1. Cấu Trúc Khi Thành Công (Success Envelope)
Khi xử lý thành công, trường `code` luôn có giá trị `1000` và trường `errors` là `null`:

```json
{
  "code": 1000,
  "message": "Thành công",
  "data": {
    "id": 1,
    "name": "Đề thi giữa kỳ Lập trình mạng",
    "status": "ACTIVE"
  },
  "errors": null,
  "timestamp": "2026-10-26T03:15:00.000Z"
}
```

### 1.2. Cấu Trúc Khi Có Lỗi Dữ Liệu Đầu Vào (Validation Error)
Khi vi phạm Bean Validation (`@NotBlank`, `@Size`, `@NotNull`), mã `code` là `1002` kèm danh sách chi tiết các trường bị lỗi trong mảng `errors`:

```json
{
  "code": 1002,
  "message": "Dữ liệu yêu cầu không hợp lệ",
  "data": null,
  "errors": [
    {
      "field": "content",
      "message": "Nội dung câu hỏi không được để trống"
    },
    {
      "field": "options",
      "message": "Câu hỏi phải có tối thiểu 2 phương án lựa chọn"
    }
  ],
  "timestamp": "2026-10-26T03:15:00.000Z"
}
```

### 1.3. Cấu Trúc Phân Trang Chuẩn (`PageResponse<T>`)
Đối với các API danh sách có phân trang (`GET /api/<resource>/page?page=0&size=20`), phần `data` được bọc trong đối tượng `PageResponse`:

```json
{
  "code": 1000,
  "message": "Thành công",
  "data": {
    "content": [ ... ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 85,
    "totalPages": 5,
    "last": false
  },
  "errors": null,
  "timestamp": "2026-10-26T03:15:00.000Z"
}
```

---

## 2. Bảng Danh Mục Mã Lỗi Nghiệp Vụ Hệ Thống (System Error Codes)

Định nghĩa tập trung tại [ErrorCode.java](../src/main/java/com/example/server/exception/ErrorCode.java):

| Mã Lỗi (Code) | Tên Định Danh Enum | HTTP Status | Ý Nghĩa Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| `1000` | `SUCCESS` | `200 OK` | Yêu cầu xử lý thành công |
| `1001` | `UNCATEGORIZED_EXCEPTION` | `500 INTERNAL_SERVER_ERROR` | Lỗi máy chủ không xác định |
| `1002` | `INVALID_REQUEST` | `400 BAD_REQUEST` | Dữ liệu đầu vào không hợp lệ hoặc sai định dạng |
| `1003` | `RESOURCE_NOT_FOUND` | `404 NOT_FOUND` | Không tìm thấy bản ghi theo ID |
| `1004` | `UNAUTHORIZED` | `401 UNAUTHORIZED` | Chưa đăng nhập hoặc mã phiên làm việc không hợp lệ |
| `1005` | `FORBIDDEN` | `403 FORBIDDEN` | Không đủ quyền hạn thực hiện thao tác này |
| `1010` | `USER_ALREADY_EXISTS` | `400 BAD_REQUEST` | Tên đăng nhập hoặc email đã được sử dụng |
| `1011` | `INVALID_CREDENTIALS` | `400 BAD_REQUEST` | Tên đăng nhập hoặc mật khẩu không chính xác |
| `1020` | `EXAM_ROOM_NOT_FOUND` | `404 NOT_FOUND` | Phòng thi không tồn tại hoặc đã kết thúc |
| `1030` | `EXAM_ALREADY_SUBMITTED` | `400 BAD_REQUEST` | Bài thi đã được nộp hoặc đã hết hạn làm bài |
| `1031` | `EXAM_DEADLINE_EXCEEDED`| `400 BAD_REQUEST` | Đã quá hạn thời gian nộp bài thi quy định |

---

## 3. Danh Mục Chi Tiết Toàn Bộ Endpoints RESTful

### 3.1. Phân Hệ Xác Thực (`/api/auth`)
- `POST /api/auth/register`: Đăng ký tài khoản mới cho thí sinh (`username`, `password`, `email`, `fullName`).
- `POST /api/auth/login`: Xác thực tài khoản, cấp Session Token 64 ký tự hex.
- `POST /api/auth/logout`: Thu hồi token hiện tại (`revoked_at = now()`).
- `GET /api/auth/me`: Tra cứu thông tin hồ sơ của tài khoản đang đăng nhập.

### 3.2. Phân Hệ Ngân Hàng Câu Hỏi (`/api/questions`) — Kế thừa `BaseController`
- `GET /api/questions`: Lấy toàn bộ danh sách câu hỏi hoạt động.
- `GET /api/questions/page?page=0&size=20`: Phân trang danh sách câu hỏi.
- `GET /api/questions/{id}`: Tra cứu chi tiết một câu hỏi kèm các phương án lựa chọn.
- `POST /api/questions`: *(Quyền ADMIN)* Tạo câu hỏi mới kèm tối thiểu 2 phương án và 1 phương án đúng.
- `PUT /api/questions/{id}`: *(Quyền ADMIN)* Cập nhật nội dung câu hỏi và các phương án.
- `DELETE /api/questions/{id}`: *(Quyền ADMIN)* Xóa mềm câu hỏi (`status = 'ARCHIVED'`).
- `GET /api/questions/topic/{topic}`: Lọc câu hỏi theo chủ đề chuyên biệt.

### 3.3. Phân Hệ Phòng Thi (`/api/rooms`) — Kế thừa `BaseController`
- `GET /api/rooms`: Danh sách toàn bộ phòng thi.
- `GET /api/rooms/page?page=0&size=20`: Phân trang danh sách phòng thi.
- `GET /api/rooms/{id}`: Xem chi tiết phòng thi theo ID.
- `GET /api/rooms/code/{code}`: Tra cứu thông tin tóm tắt phòng thi theo mã phòng `room_code`.
- `POST /api/rooms`: Tạo phòng thi mới kèm cấu hình số lượng câu hỏi (`easy_count`, `medium_count`, `hard_count`).
- `POST /api/rooms/{code}/join`: Thí sinh tham gia phòng thi.
- `POST /api/rooms/{code}/leave`: Thí sinh rời khỏi phòng thi.
- `POST /api/rooms/{code}/start`: *(Chủ phòng)* Bắt đầu phòng thi và phát lệnh đếm ngược.
- `POST /api/rooms/{code}/finish`: *(Chủ phòng)* Kết thúc phòng thi và khóa nộp bài.

### 3.4. Phân Hệ Lượt Thi & Chấm Điểm (`/api/attempts`) — Custom API
- `POST /api/attempts/start`: Bắt đầu lượt thi chính thức hoặc luyện tập (sinh ngẫu nhiên danh sách câu hỏi).
- `POST /api/attempts/{id}/answers`: Lưu lựa chọn đáp án cho từng câu hỏi trong quá trình thi.
- `POST /api/attempts/{id}/submit`: Nộp bài thi chính thức, chốt điểm và kết quả.
- `GET /api/attempts/{id}/result`: Tra cứu kết quả chi tiết của lượt thi (điểm số, tỷ lệ đúng, đáp án chi tiết).

---

## 4. Tích Hợp Swagger UI & OpenAPI 3

Hệ thống sử dụng thư viện **SpringDoc OpenAPI WebMVC**, tự động phân tích mã nguồn Controller và DTO Record để tạo tài liệu tương tác trực quan.

### 4.1. Đường Dẫn Truy Cập Cục Bộ
- **Giao diện Swagger UI:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Đặc tả OpenAPI 3 định dạng JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### 4.2. Hướng Dẫn Xác Thực (Authorize) Trên Swagger UI
Cấu hình tại [OpenApiConfig.java](../src/main/java/com/example/server/config/OpenApiConfig.java) đã bật sẵn `BearerAuth`. Để thử nghiệm các API yêu cầu quyền đăng nhập:
1. Gọi API `POST /api/auth/login` trên giao diện Swagger UI để nhận chuỗi `token`.
2. Nhấn nút **Authorize** màu xanh ở góc trên bên phải màn hình Swagger.
3. Dán chuỗi token vào ô `Value` (không cần gõ thêm chữ `Bearer `) và nhấn **Authorize**.
4. Mọi yêu cầu thử nghiệm tiếp theo sẽ tự động đính kèm Header `Authorization: Bearer <TOKEN>`.

---

## 5. Liên Kết Đối Chiếu

- Hướng dẫn thêm mới API CRUD chuẩn: [API_GENERATION_GUIDE.md](ai-guides/API_GENERATION_GUIDE.md).
- Hướng dẫn thêm mới API nghiệp vụ chuyên biệt: [CUSTOM_API_GUIDE.md](ai-guides/CUSTOM_API_GUIDE.md).
- Kiến trúc bảo mật và xác thực Session Token: [security-architecture.md](security-architecture.md).
