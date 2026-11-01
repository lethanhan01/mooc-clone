# Đặc Tả Giao Tiếp Hệ Thống mooc-clone (C Gateway TLV Protocol & Admin REST API)

> **Phân hệ trọng tâm:** C Communication Engine (`server-c/`) & Java Spring Boot Backend (`server/`)  
> **Kênh giao tiếp chính:** TCP Socket nhị phân qua C Gateway (Cổng 9000, 16-byte TLV Header + JSON Payload)  
> **Kênh quản trị phụ lục:** Spring Boot REST API & Swagger UI (Cổng 8080)  
> **Đặc tả khung nhị phân:** Xem tại [server-c/README.md](../../server-c/README.md)

---

## 1. Đặc Tả Giao Thức C Communication Engine (Kênh Chính Cổng :9000)

Mọi trao đổi dữ liệu nghiệp vụ thời gian thực giữa ứng dụng máy trạm **Electron Desktop** và **Java Spring Boot Worker** đều đi qua C Gateway theo cấu trúc **TLV (Type-Length-Value)** với **Header cố định 16 bytes** (Big-Endian):

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          MAGIC (0x4D43)       |    VERSION    |    MSG_TYPE   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         SEQUENCE_ID                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          CLIENT_ID                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         PAYLOAD_LEN                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     PAYLOAD (JSON UTF-8) ...                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 1.1. Bảng Danh Mục Opcodes & Payloads Chi Tiết

#### `0x00` — `OP_SYS_HANDSHAKE` (Đăng ký Worker nội bộ)
- **Chiều:** Java Worker -> C Gateway.
- **Payload:** `{"role": "WORKER"}`
- **Ý nghĩa:** C Gateway lưu lại `worker_fd` để chuyển tiếp toàn bộ yêu cầu từ các client.

#### `0x01` / `0x02` — `OP_AUTH_LOGIN_REQ` / `OP_AUTH_LOGIN_RESP`
- **Request Payload (`0x01`):**
  ```json
  {
    "usernameOrEmail": "student1",
    "password": "password123"
  }
  ```
- **Response Payload (`0x02`):**
  ```json
  {
    "token": "sess_8f3a9e2...",
    "userId": 1,
    "username": "student1",
    "displayName": "Nguyễn Văn A",
    "role": "STUDENT"
  }
  ```

#### `0x03` / `0x04` — `OP_AUTH_REGISTER_REQ` / `OP_AUTH_REGISTER_RESP`
- **Request Payload (`0x03`):**
  ```json
  {
    "username": "student2",
    "email": "student2@mooc.local",
    "password": "password123",
    "displayName": "Trần Thị B"
  }
  ```
- **Response Payload (`0x04`):**
  ```json
  {
    "id": 2,
    "username": "student2",
    "displayName": "Trần Thị B"
  }
  ```

#### `0x10` / `0x11` — `OP_ROOM_LIST_REQ` / `OP_ROOM_LIST_RESP`
- **Request Payload (`0x10`):** `{}`
- **Response Payload (`0x11`):**
  ```json
  [
    {
      "id": 1,
      "roomCode": "IT4062-01",
      "roomName": "Phòng thi Lập trình mạng",
      "status": "WAITING",
      "durationSeconds": 3600,
      "totalQuestions": 40,
      "participantsCount": 15
    }
  ]
  ```

#### `0x12` / `0x13` — `OP_ROOM_CREATE_REQ` / `OP_ROOM_CREATE_RESP`
- **Request Payload (`0x12`):**
  ```json
  {
    "roomCode": "ROOM88",
    "name": "Kiểm tra giữa kỳ",
    "durationSeconds": 2700,
    "easyCount": 10,
    "mediumCount": 15,
    "hardCount": 5,
    "visibility": "PUBLIC"
  }
  ```
- **Response Payload (`0x13`):** Trả về đối tượng `RoomSummaryDto` vừa được tạo.

#### `0x14` / `0x15` — `OP_ROOM_JOIN_REQ` / `OP_ROOM_JOIN_RESP`
- **Request Payload (`0x14`):**
  ```json
  {
    "roomCode": "ROOM88",
    "username": "student1",
    "displayName": "Nguyễn Văn A"
  }
  ```
- **Response Payload (`0x15`):** Xác nhận tham gia thành công kèm cấu hình phòng thi.

#### `0x20` / `0x21` — `OP_EXAM_START_REQ` / `OP_EXAM_START_RESP`
- **Request Payload (`0x20`):**
  ```json
  {
    "roomCode": "ROOM88"
  }
  ```
- **Response Payload (`0x21`):**
  ```json
  {
    "status": "EXAM_STARTED",
    "roomCode": "ROOM88"
  }
  ```

#### `0x22` / `0x23` — `OP_EXAM_SUBMIT_REQ` / `OP_EXAM_SUBMIT_RESP`
- **Request Payload (`0x22`):**
  ```json
  {
    "attemptId": 105,
    "answers": [
      { "questionId": 1, "selectedOptionId": 3 },
      { "questionId": 2, "selectedOptionId": 1 }
    ]
  }
  ```
- **Response Payload (`0x23`):**
  ```json
  {
    "attemptId": 105,
    "score": 8.5,
    "correctCount": 34,
    "totalCount": 40,
    "passed": true
  }
  ```

#### `0x80` — `OP_SERVER_BROADCAST` (Server Push Broadcast)
- **Chiều:** Java Worker -> C Gateway -> Toàn bộ Desktop Clients.
- **Payload Ví Dụ (Bắt đầu thi đồng bộ):**
  ```json
  {
    "eventType": "EXAM_STARTED",
    "roomCode": "ROOM88",
    "timestamp": 1730462400000
  }
  ```

---

## 2. Phụ Lục: RESTful API Phục Vụ Quản Trị & Swagger UI

Ngoài kênh TCP Gateway phục vụ thí sinh trên Desktop, máy chủ Java Spring Boot tiếp tục duy trì các REST Endpoints để quản trị dữ liệu và tích hợp Swagger UI:

- **Giao diện Swagger UI:** `http://localhost:8080/swagger-ui/index.html`
- **Đặc tả OpenAPI 3 định dạng JSON:** `http://localhost:8080/v3/api-docs`

### 2.1. Cấu Trúc Khung Phản Hồi Duy Nhất (`ApiResponse<T>`)
```json
{
  "code": 1000,
  "message": "Thành công",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-11-01T12:00:00.000Z"
}
```

### 2.2. Danh Mục Các Endpoint Quản Trị
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/rooms`, `POST /api/rooms`, `GET /api/rooms/{id}`
- `GET /api/questions`, `POST /api/questions`, `PUT /api/questions/{id}`, `DELETE /api/questions/{id}`
- `POST /api/attempts/start`, `POST /api/attempts/{id}/submit`, `GET /api/attempts/{id}/result`

### 2.3. Bảng Mã Lỗi Hệ Thống
| Mã Lỗi | Tên Định Danh | Ý Nghĩa |
| :--- | :--- | :--- |
| `1000` | `SUCCESS` | Yêu cầu xử lý thành công |
| `1001` | `UNCATEGORIZED_EXCEPTION` | Lỗi máy chủ không xác định |
| `1002` | `INVALID_REQUEST` | Dữ liệu đầu vào sai định dạng |
| `1003` | `RESOURCE_NOT_FOUND` | Không tìm thấy bản ghi |
| `1004` | `UNAUTHORIZED` | Chưa xác thực phiên |
| `1005` | `FORBIDDEN` | Không đủ quyền truy cập |
