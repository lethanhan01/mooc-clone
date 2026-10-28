#include "http_router.h"
#include "http_parser.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * @brief Handler mặc định trả về phản hồi JSON 404 Not Found khi không khớp route nào.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
static void default_not_found_handler(const http_request_t *req, http_response_t *res) {
    (void)req;
    http_response_init(res, HTTP_STATUS_NOT_FOUND);
    http_response_set_body_json(res, "{\"error\":\"Not Found\",\"status\":404}");
}

void http_router_init(http_router_t *router) {
    if (!router) {
        return;
    }
    memset(router, 0, sizeof(http_router_t));
    router->enable_cors = true;
    router->not_found_handler = default_not_found_handler;
}

void http_router_enable_cors(http_router_t *router, bool enable) {
    if (!router) {
        return;
    }
    router->enable_cors = enable;
}

int http_router_register(http_router_t *router,
                         http_method_t method,
                         const char *path_pattern,
                         http_handler_func_t handler) {
    if (!router || !path_pattern || !handler || router->route_count >= HTTP_MAX_ROUTES) {
        return -1;
    }
    http_route_entry_t *entry = &router->routes[router->route_count++];
    entry->method = method;
    strncpy(entry->path_pattern, path_pattern, HTTP_MAX_PATH_LEN - 1);
    entry->handler = handler;
    return 0;
}

/**
 * @brief So khớp đường dẫn yêu cầu thực tế với mẫu route (hỗ trợ tham số động :param).
 *
 * Sử dụng strtok_r (reentrant) để tách từng phân đoạn URL một cách an toàn đa luồng.
 * Các tham số động chỉ được ghi vào cấu trúc req sau khi toàn bộ các phân đoạn đều khớp.
 *
 * @param[in]     pattern Chuỗi mẫu đường dẫn đã đăng ký (ví dụ "/api/v1/exams/:id").
 * @param[in]     path    Đường dẫn URL thực tế từ HTTP request.
 * @param[in,out] req     Con trỏ HTTP request để lưu các cặp tham số động trích xuất được.
 * @return bool true nếu đường dẫn khớp hoàn toàn với mẫu, false nếu không khớp.
 */
static bool match_route(const char *pattern, const char *path, http_request_t *req) {
    char pattern_buf[HTTP_MAX_PATH_LEN];
    char path_buf[HTTP_MAX_PATH_LEN];
    memset(pattern_buf, 0, sizeof(pattern_buf));
    memset(path_buf, 0, sizeof(path_buf));
    strncpy(pattern_buf, pattern, sizeof(pattern_buf) - 1);
    strncpy(path_buf, path, sizeof(path_buf) - 1);

    char *pattern_saveptr = NULL;
    char *path_saveptr = NULL;
    char *pattern_token = strtok_r(pattern_buf, "/", &pattern_saveptr);
    char *request_token = strtok_r(path_buf, "/", &path_saveptr);

    // Lưu tạm các tham số động; chỉ commit vào req khi toàn bộ đường dẫn khớp hoàn toàn
    char temp_keys[HTTP_MAX_PARAMS][HTTP_MAX_PARAM_KEY_LEN];
    char temp_vals[HTTP_MAX_PARAMS][HTTP_MAX_PARAM_VAL_LEN];
    size_t temp_count = 0;

    while (pattern_token && request_token) {
        if (pattern_token[0] == ':') {
            if (temp_count < HTTP_MAX_PARAMS) {
                memset(temp_keys[temp_count], 0, sizeof(temp_keys[0]));
                memset(temp_vals[temp_count], 0, sizeof(temp_vals[0]));
                strncpy(temp_keys[temp_count],
                        pattern_token + 1,
                        sizeof(temp_keys[0]) - 1);
                strncpy(temp_vals[temp_count],
                        request_token,
                        sizeof(temp_vals[0]) - 1);
                temp_count++;
            }
        } else if (strcmp(pattern_token, request_token) != 0) {
            return false;
        }
        pattern_token = strtok_r(NULL, "/", &pattern_saveptr);
        request_token = strtok_r(NULL, "/", &path_saveptr);
    }

    if (pattern_token == NULL && request_token == NULL) {
        for (size_t i = 0; i < temp_count; i++) {
            http_request_set_param(req, temp_keys[i], temp_vals[i]);
        }
        return true;
    }
    return false;
}

void http_router_dispatch(http_router_t *router, http_request_t *req, http_response_t *res) {
    if (!router || !req || !res) {
        return;
    }

    // 1. Xử lý yêu cầu CORS Preflight (phương thức OPTIONS từ trình duyệt)
    if (req->method == HTTP_METHOD_OPTIONS) {
        http_response_init(res, HTTP_STATUS_NO_CONTENT);
        if (router->enable_cors) {
            http_response_add_header(res, "Access-Control-Allow-Origin", "*");
            http_response_add_header(res,
                                     "Access-Control-Allow-Methods",
                                     "GET, POST, PUT, DELETE, OPTIONS");
            http_response_add_header(res,
                                     "Access-Control-Allow-Headers",
                                     "Content-Type, Authorization");
            http_response_add_header(res, "Access-Control-Max-Age", "86400");
        }
        return;
    }

    // 2. Duyệt bảng định tuyến để tìm handler khớp cả Method lẫn URL Pattern
    for (size_t i = 0; i < router->route_count; i++) {
        http_route_entry_t *entry = &router->routes[i];
        if (entry->method == req->method) {
            req->param_count = 0;
            if (match_route(entry->path_pattern, req->path, req)) {
                entry->handler(req, res);
                if (router->enable_cors) {
                    http_response_add_header(res, "Access-Control-Allow-Origin", "*");
                }
                return;
            }
        }
    }

    // 3. Không khớp route nào -> gọi handler 404 Not Found
    router->not_found_handler(req, res);
    if (router->enable_cors) {
        http_response_add_header(res, "Access-Control-Allow-Origin", "*");
    }
}
