package com.example.server.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(500, "Lỗi máy chủ nội bộ không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(400, "Thông báo lỗi không hợp lệ", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(404, "Không tìm thấy tài nguyên yêu cầu trong hệ thống", HttpStatus.NOT_FOUND),
    USER_NOT_EXISTED(404, "Người dùng không tồn tại trong hệ thống", HttpStatus.NOT_FOUND),
    USER_EXISTED(400, "Tên tài khoản hoặc email đã tồn tại trong hệ thống", HttpStatus.BAD_REQUEST),
    ROOM_NOT_FOUND(404, "Không tìm thấy phòng thi tương ứng", HttpStatus.NOT_FOUND),
    ROOM_FULL(400, "Phòng thi đã đạt giới hạn số lượng thí sinh", HttpStatus.BAD_REQUEST),
    ROOM_ALREADY_STARTED(400, "Phòng thi đã bắt đầu, không thể thực hiện thao tác này", HttpStatus.BAD_REQUEST),
    ROOM_ALREADY_ENDED(400, "Phòng thi đã kết thúc", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(401, "Yêu cầu xác thực tài khoản (Token không hợp lệ hoặc đã hết hạn)", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(403, "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    VALIDATION_FAILED(400, "Dữ liệu gửi lên không đúng định dạng", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    public int getCode() { return code; }
    public String getMessage() { return message; }
    public HttpStatus getHttpStatus() { return httpStatus; }
}
