#ifndef HTTP_TYPES_H
#define HTTP_TYPES_H

#include <stddef.h>
#include <stdbool.h>

#define HTTP_MAX_HEADERS 64
#define HTTP_MAX_HEADER_KEY_LEN 128
#define HTTP_MAX_HEADER_VAL_LEN 512
#define HTTP_MAX_PATH_LEN 1024
#define HTTP_MAX_QUERY_LEN 1024
#define HTTP_MAX_METHOD_LEN 16
#define HTTP_MAX_VERSION_LEN 16
#define HTTP_MAX_PARAMS 8
#define HTTP_MAX_PARAM_KEY_LEN 32
#define HTTP_MAX_PARAM_VAL_LEN 64

/**
 * @brief Tập hợp các phương thức HTTP/1.1 được máy chủ hỗ trợ.
 */
typedef enum {
    HTTP_METHOD_UNKNOWN = 0,
    HTTP_METHOD_GET,
    HTTP_METHOD_POST,
    HTTP_METHOD_PUT,
    HTTP_METHOD_DELETE,
    HTTP_METHOD_OPTIONS,
    HTTP_METHOD_HEAD
} http_method_t;

/**
 * @brief Các mã trạng thái phản hồi HTTP chuẩn (RFC 9110).
 */
typedef enum {
    HTTP_STATUS_OK = 200,
    HTTP_STATUS_CREATED = 201,
    HTTP_STATUS_NO_CONTENT = 204,
    HTTP_STATUS_BAD_REQUEST = 400,
    HTTP_STATUS_UNAUTHORIZED = 401,
    HTTP_STATUS_FORBIDDEN = 403,
    HTTP_STATUS_NOT_FOUND = 404,
    HTTP_STATUS_METHOD_NOT_ALLOWED = 405,
    HTTP_STATUS_CONFLICT = 409,
    HTTP_STATUS_INTERNAL_ERROR = 500
} http_status_t;

/**
 * @brief Cấu trúc lưu trữ một cặp khóa - giá trị của HTTP Header.
 */
typedef struct {
    char key[HTTP_MAX_HEADER_KEY_LEN];
    char value[HTTP_MAX_HEADER_VAL_LEN];
} http_header_t;

/**
 * @brief Cấu trúc biểu diễn một thông điệp HTTP Request đã được phân tích.
 */
typedef struct {
    http_method_t method;
    char path[HTTP_MAX_PATH_LEN];
    char query[HTTP_MAX_QUERY_LEN];
    char http_version[HTTP_MAX_VERSION_LEN];
    http_header_t headers[HTTP_MAX_HEADERS];
    size_t header_count;
    char *body;
    size_t body_len;
    size_t content_length;
    bool keep_alive;

    // Danh sách các tham số đường dẫn động bóc tách từ URL (ví dụ :id, :code)
    char param_keys[HTTP_MAX_PARAMS][HTTP_MAX_PARAM_KEY_LEN];
    char param_values[HTTP_MAX_PARAMS][HTTP_MAX_PARAM_VAL_LEN];
    size_t param_count;
} http_request_t;

/**
 * @brief Cấu trúc biểu diễn thông điệp HTTP Response chuẩn bị đóng gói gửi về Client.
 */
typedef struct {
    http_status_t status_code;
    const char *status_phrase;
    http_header_t headers[HTTP_MAX_HEADERS];
    size_t header_count;
    char *body;
    size_t body_len;
} http_response_t;

/**
 * @brief Chuyển đổi giá trị enum http_method_t sang chuỗi tên phương thức HTTP.
 *
 * @param[in] method Giá trị enum phương thức HTTP.
 * @return const char* Chuỗi hằng tương ứng ("GET", "POST", ..., hoặc "UNKNOWN").
 */
const char *http_method_str(http_method_t method);

/**
 * @brief Ánh xạ chuỗi tên phương thức HTTP sang giá trị enum http_method_t.
 *
 * @param[in] str Chuỗi văn bản chứa tên phương thức (ví dụ "GET", "POST").
 * @return http_method_t Giá trị enum tương ứng, hoặc HTTP_METHOD_UNKNOWN nếu không khớp.
 */
http_method_t http_method_from_str(const char *str);

/**
 * @brief Lấy chuỗi mô tả ngắn (Reason-Phrase) tương ứng với mã trạng thái HTTP.
 *
 * @param[in] status Mã trạng thái HTTP (ví dụ HTTP_STATUS_OK = 200).
 * @return const char* Chuỗi Reason-Phrase chuẩn (ví dụ "OK", "Not Found").
 */
const char *http_status_phrase(http_status_t status);

#endif // HTTP_TYPES_H
