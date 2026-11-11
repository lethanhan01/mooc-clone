package com.example.server.exception;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(500, "Lỗi máy chủ nội bộ không xác định"),
    INVALID_KEY(400, "Thông báo lỗi không hợp lệ"),
    RESOURCE_NOT_FOUND(404, "Không tìm thấy tài nguyên yêu cầu trong hệ thống"),
    USER_NOT_EXISTED(404, "Người dùng không tồn tại trong hệ thống"),
    USER_EXISTED(400, "Tên tài khoản hoặc email đã tồn tại trong hệ thống"),
    ROOM_NOT_FOUND(404, "Không tìm thấy phòng thi tương ứng"),
    ROOM_FULL(400, "Phòng thi đã đạt giới hạn số lượng thí sinh"),
    ROOM_ALREADY_STARTED(400, "Phòng thi đã bắt đầu, không thể thực hiện thao tác này"),
    ROOM_ALREADY_ENDED(400, "Phòng thi đã kết thúc"),
    UNAUTHENTICATED(401, "Yêu cầu xác thực tài khoản (Token không hợp lệ hoặc đã hết hạn)"),
    UNAUTHORIZED(403, "Bạn không có quyền thực hiện thao tác này"),
    VALIDATION_FAILED(400, "Dữ liệu gửi lên không đúng định dạng");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() { return code; }
    public String getMessage() { return message; }
}
