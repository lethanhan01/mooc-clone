#ifndef HTTP_ROUTER_H
#define HTTP_ROUTER_H

#include "http_types.h"

#define HTTP_MAX_ROUTES 128

/**
 * @brief Kiểu con trỏ hàm xử lý một yêu cầu HTTP (Controller Handler).
 */
typedef void (*http_handler_func_t)(const http_request_t *req, http_response_t *res);

/**
 * @brief Cấu trúc biểu diễn một mục định tuyến (Route Entry) trong bảng định tuyến.
 */
typedef struct {
    http_method_t method;
    char path_pattern[HTTP_MAX_PATH_LEN];
    http_handler_func_t handler;
} http_route_entry_t;

/**
 * @brief Cấu trúc quản lý bảng định tuyến URL và cấu hình CORS của máy chủ HTTP.
 */
typedef struct {
    http_route_entry_t routes[HTTP_MAX_ROUTES];
    size_t route_count;
    http_handler_func_t not_found_handler;
    bool enable_cors;
} http_router_t;

/**
 * @brief Khởi tạo bộ định tuyến HTTP với cấu hình CORS bật mặc định và handler 404.
 *
 * @param[out] router Con trỏ tới cấu trúc http_router_t cần khởi tạo.
 */
void http_router_init(http_router_t *router);

/**
 * @brief Bật hoặc tắt tính năng tự động đính kèm các trường CORS Header vào phản hồi.
 *
 * @param[in,out] router Con trỏ tới cấu trúc http_router_t.
 * @param[in]     enable true để bật CORS, false để tắt.
 */
void http_router_enable_cors(http_router_t *router, bool enable);

/**
 * @brief Đăng ký một điểm cuối (endpoint) mới vào bảng định tuyến.
 *
 * Hỗ trợ cả đường dẫn tĩnh (ví dụ "/api/v1/health") lẫn đường dẫn chứa tham số động
 * bắt đầu bằng dấu hai chấm (ví dụ "/api/v1/exams/:id").
 *
 * @param[in,out] router       Con trỏ tới bộ định tuyến.
 * @param[in]     method       Phương thức HTTP áp dụng cho route.
 * @param[in]     path_pattern Mẫu đường dẫn URL.
 * @param[in]     handler      Con trỏ hàm xử lý nghiệp vụ khi khớp route.
 * @return int 0 nếu đăng ký thành công, -1 nếu tham số không hợp lệ hoặc bảng đầy.
 */
int http_router_register(http_router_t *router,
                         http_method_t method,
                         const char *path_pattern,
                         http_handler_func_t handler);

/**
 * @brief Điều phối HTTP request tới hàm xử lý tương ứng hoặc trả về 404 Not Found.
 *
 * Tự động xử lý yêu cầu CORS Preflight (phương thức OPTIONS) với mã 204 No Content.
 *
 * @param[in]     router Con trỏ tới bộ định tuyến.
 * @param[in,out] req    Con trỏ tới HTTP request (sẽ được điền thêm param động nếu khớp).
 * @param[out]    res    Con trỏ tới HTTP response nhận kết quả trả về.
 */
void http_router_dispatch(http_router_t *router, http_request_t *req, http_response_t *res);

#endif // HTTP_ROUTER_H
