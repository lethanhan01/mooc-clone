#ifndef HTTP_ROUTER_H
#define HTTP_ROUTER_H

#include "http_types.h"

typedef void (*http_handler_func_t)(const http_request_t *req, http_response_t *res);

typedef struct {
    http_method_t method;
    char path_pattern[HTTP_MAX_PATH_LEN];
    http_handler_func_t handler;
} http_route_entry_t;

typedef struct {
    http_route_entry_t routes[128];
    size_t route_count;
    http_handler_func_t not_found_handler;
    bool enable_cors;
} http_router_t;

void http_router_init(http_router_t *router);
void http_router_enable_cors(http_router_t *router, bool enable);
int http_router_register(http_router_t *router, http_method_t method, const char *path_pattern, http_handler_func_t handler);
void http_router_dispatch(http_router_t *router, http_request_t *req, http_response_t *res);

#endif // HTTP_ROUTER_H
