#include "http_router.h"
#include "http_parser.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void default_not_found_handler(const http_request_t *req, http_response_t *res) {
    (void)req;
    http_response_init(res, HTTP_STATUS_NOT_FOUND);
    http_response_set_body_json(res, "{\"error\":\"Not Found\",\"status\":404}");
}

void http_router_init(http_router_t *router) {
    if (!router) return;
    memset(router, 0, sizeof(http_router_t));
    router->enable_cors = true;
    router->not_found_handler = default_not_found_handler;
}

void http_router_enable_cors(http_router_t *router, bool enable) {
    if (!router) return;
    router->enable_cors = enable;
}

int http_router_register(http_router_t *router, http_method_t method, const char *path_pattern, http_handler_func_t handler) {
    if (!router || !path_pattern || !handler || router->route_count >= 128) return -1;
    http_route_entry_t *entry = &router->routes[router->route_count++];
    entry->method = method;
    strncpy(entry->path_pattern, path_pattern, HTTP_MAX_PATH_LEN - 1);
    entry->handler = handler;
    return 0;
}

// Hàm so khớp đường dẫn tĩnh và tham số động (:id)
static bool match_route(const char *pattern, const char *path, http_request_t *req) {
    char pat_buf[HTTP_MAX_PATH_LEN];
    char path_buf[HTTP_MAX_PATH_LEN];
    strncpy(pat_buf, pattern, sizeof(pat_buf) - 1);
    strncpy(path_buf, path, sizeof(path_buf) - 1);

    char *pat_save = NULL;
    char *path_save = NULL;
    char *p_tok = strtok_r(pat_buf, "/", &pat_save);
    char *r_tok = strtok_r(path_buf, "/", &path_save);

    // Lưu tạm các params nếu match toàn bộ mới commit vào req
    char temp_keys[8][32];
    char temp_vals[8][64];
    size_t temp_count = 0;

    while (p_tok && r_tok) {
        if (p_tok[0] == ':') {
            // Dynamic parameter segment
            if (temp_count < 8) {
                strncpy(temp_keys[temp_count], p_tok + 1, sizeof(temp_keys[0]) - 1);
                strncpy(temp_vals[temp_count], r_tok, sizeof(temp_vals[0]) - 1);
                temp_count++;
            }
        } else if (strcmp(p_tok, r_tok) != 0) {
            return false;
        }
        p_tok = strtok_r(NULL, "/", &pat_save);
        r_tok = strtok_r(NULL, "/", &path_save);
    }

    if (p_tok == NULL && r_tok == NULL) {
        // Cả 2 cùng kết thúc -> Match thành công!
        for (size_t i = 0; i < temp_count; i++) {
            http_request_set_param(req, temp_keys[i], temp_vals[i]);
        }
        return true;
    }
    return false;
}

void http_router_dispatch(http_router_t *router, http_request_t *req, http_response_t *res) {
    if (!router || !req || !res) return;

    // 1. CORS Preflight Handling (OPTIONS method)
    if (req->method == HTTP_METHOD_OPTIONS) {
        http_response_init(res, HTTP_STATUS_NO_CONTENT);
        if (router->enable_cors) {
            http_response_add_header(res, "Access-Control-Allow-Origin", "*");
            http_response_add_header(res, "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            http_response_add_header(res, "Access-Control-Allow-Headers", "Content-Type, Authorization");
            http_response_add_header(res, "Access-Control-Max-Age", "86400");
        }
        return;
    }

    // 2. Route Matching
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

    // 3. Fallback Not Found
    router->not_found_handler(req, res);
    if (router->enable_cors) {
        http_response_add_header(res, "Access-Control-Allow-Origin", "*");
    }
}
