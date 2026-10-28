#ifndef HTTP_PARSER_H
#define HTTP_PARSER_H

#include "http_types.h"

/**
 * @brief Các trạng thái của máy trạng thái hữu hạn (FSM) phân tích gói tin HTTP/1.1.
 */
typedef enum {
    FSM_STATE_START = 0,
    FSM_STATE_METHOD,
    FSM_STATE_URI,
    FSM_STATE_VERSION,
    FSM_STATE_LINE_CR,
    FSM_STATE_HEADER_KEY,
    FSM_STATE_HEADER_COLON,
    FSM_STATE_HEADER_VALUE,
    FSM_STATE_HEADER_CR,
    FSM_STATE_HEADERS_END_LF,
    FSM_STATE_BODY,
    FSM_STATE_COMPLETE,
    FSM_STATE_ERROR
} http_fsm_state_t;

/**
 * @brief Cấu trúc lưu trạng thái phân tích tăng dần (Incremental Stateful Parser).
 *
 * Lưu giữ con trỏ vị trí bytes_parsed và các bộ đệm token tạm để khi gói tin TCP
 * bị phân mảnh (fragmented), lần gọi tiếp theo nối tiếp chính xác từ byte dừng lại
 * với độ phức tạp O(N) mà không cần quét lại từ đầu.
 */
typedef struct {
    http_fsm_state_t state;
    size_t bytes_parsed;
    size_t body_bytes_read;
    char temp_method[HTTP_MAX_METHOD_LEN];
    size_t method_idx;
    char temp_uri[HTTP_MAX_PATH_LEN + HTTP_MAX_QUERY_LEN];
    size_t uri_idx;
    char temp_ver[HTTP_MAX_VERSION_LEN];
    size_t ver_idx;
    char temp_key[HTTP_MAX_HEADER_KEY_LEN];
    char temp_val[HTTP_MAX_HEADER_VAL_LEN];
    size_t key_len;
    size_t val_len;
} http_parser_t;

/**
 * @brief Khởi tạo hoặc đặt lại máy trạng thái HTTP FSM về trạng thái bắt đầu.
 *
 * @param[out] parser Con trỏ tới cấu trúc http_parser_t cần khởi tạo.
 */
void http_parser_init(http_parser_t *parser);

/**
 * @brief Khởi tạo cấu trúc http_request_t với các giá trị mặc định của HTTP/1.1.
 *
 * @param[out] req Con trỏ tới cấu trúc http_request_t cần khởi tạo.
 */
void http_request_init(http_request_t *req);

/**
 * @brief Giải phóng vùng nhớ cấp phát động (body) bên trong http_request_t.
 *
 * @param[in,out] req Con trỏ tới cấu trúc http_request_t cần giải phóng.
 */
void http_request_free(http_request_t *req);

/**
 * @brief Thực thi máy trạng thái FSM để phân tích dữ liệu HTTP từ bộ đệm tích lũy.
 *
 * Hỗ trợ xử lý cả gói tin TCP bị phân mảnh (Fragmentation) lẫn nhiều gói tin HTTP
 * dính liền nhau trên một kết nối Keep-Alive (Sticky Packets / HTTP Pipelining).
 *
 * @param[in,out] parser Con trỏ trạng thái bộ phân tích FSM.
 * @param[in,out] req    Con trỏ cấu trúc lưu kết quả HTTP request đang bóc tách.
 * @param[in]     data   Con trỏ tới bộ đệm dữ liệu thô nhận từ socket.
 * @param[in]     len    Tổng số byte hiện có trong bộ đệm data.
 * @return int > 0: Tổng số byte của 1 HTTP request hoàn chỉnh đã tiêu thụ;
 *             = 0: Chưa đủ dữ liệu tạo thành 1 khung tin hoàn chỉnh (cần recv thêm);
 *             < 0: Lỗi cú pháp giao thức HTTP (cần phản hồi 400 Bad Request).
 */
int http_parser_execute(http_parser_t *parser, http_request_t *req, const char *data, size_t len);

/**
 * @brief Tra cứu giá trị của một HTTP Header (không phân biệt chữ hoa/thường).
 *
 * @param[in] req Con trỏ tới HTTP request đã phân tích.
 * @param[in] key Tên trường Header cần tìm (ví dụ "Content-Length", "Host").
 * @return const char* Chuỗi giá trị của Header, hoặc NULL nếu không tồn tại.
 */
const char *http_request_get_header(const http_request_t *req, const char *key);

/**
 * @brief Lấy giá trị của tham số đường dẫn động (ví dụ "id" từ route "/exams/:id").
 *
 * @param[in] req        Con trỏ tới HTTP request.
 * @param[in] param_name Tên tham số động (không bao gồm dấu hai chấm).
 * @return const char* Chuỗi giá trị tham số, hoặc NULL nếu không tìm thấy.
 */
const char *http_request_get_param(const http_request_t *req, const char *param_name);

/**
 * @brief Gán một cặp khóa - giá trị tham số đường dẫn động vào HTTP request.
 *
 * @param[in,out] req   Con trỏ tới HTTP request.
 * @param[in]     key   Tên tham số đường dẫn.
 * @param[in]     value Giá trị trích xuất được từ URL thực tế.
 */
void http_request_set_param(http_request_t *req, const char *key, const char *value);

/**
 * @brief Khởi tạo cấu trúc http_response_t với mã trạng thái HTTP chỉ định.
 *
 * @param[out] res    Con trỏ tới cấu trúc http_response_t cần khởi tạo.
 * @param[in]  status Mã trạng thái HTTP phản hồi.
 */
void http_response_init(http_response_t *res, http_status_t status);

/**
 * @brief Thêm một cặp khóa - giá trị Header vào thông điệp phản hồi HTTP.
 *
 * @param[in,out] res   Con trỏ tới cấu trúc http_response_t.
 * @param[in]     key   Tên trường Header.
 * @param[in]     value Giá trị của trường Header.
 */
void http_response_add_header(http_response_t *res, const char *key, const char *value);

/**
 * @brief Thiết lập nội dung body định dạng JSON và tự động gắn Header Content-Type.
 *
 * @param[in,out] res      Con trỏ tới cấu trúc http_response_t.
 * @param[in]     json_str Chuỗi JSON hợp lệ cần sao chép vào body phản hồi.
 */
void http_response_set_body_json(http_response_t *res, const char *json_str);

/**
 * @brief Thiết lập nội dung body văn bản thuần (text/plain) cho phản hồi HTTP.
 *
 * @param[in,out] res  Con trỏ tới cấu trúc http_response_t.
 * @param[in]     text Chuỗi văn bản cần sao chép vào body phản hồi.
 */
void http_response_set_body_text(http_response_t *res, const char *text);

/**
 * @brief Đóng gói cấu trúc http_response_t thành chuỗi byte chuẩn giao thức HTTP/1.1.
 *
 * Tự động tính toán và đính kèm Header Content-Length để đóng khung thông điệp
 * (Application-level Framing) chính xác trên luồng TCP.
 *
 * @param[in]  res     Con trỏ tới cấu trúc http_response_t cần đóng gói.
 * @param[out] out_len Con trỏ nhận tổng độ dài chuỗi byte sau khi đóng gói.
 * @return char* Vùng nhớ chứa chuỗi HTTP response hoàn chỉnh (người gọi phải free()),
 *               hoặc NULL nếu lỗi cấp phát bộ nhớ.
 */
char *http_response_serialize(const http_response_t *res, size_t *out_len);

/**
 * @brief Giải phóng bộ nhớ cấp phát động bên trong http_response_t.
 *
 * @param[in,out] res Con trỏ tới cấu trúc http_response_t cần giải phóng.
 */
void http_response_free(http_response_t *res);

#endif // HTTP_PARSER_H
