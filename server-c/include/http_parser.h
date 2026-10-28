#ifndef HTTP_PARSER_H
#define HTTP_PARSER_H

#include "http_types.h"

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

typedef struct {
    http_fsm_state_t state;
    size_t bytes_parsed;
    size_t body_bytes_read;
    char temp_key[HTTP_MAX_HEADER_KEY_LEN];
    char temp_val[HTTP_MAX_HEADER_VAL_LEN];
    size_t key_len;
    size_t val_len;
} http_parser_t;

void http_parser_init(http_parser_t *parser);
void http_request_init(http_request_t *req);
void http_request_free(http_request_t *req);

// Phân tích dữ liệu từ raw buffer.
// Trả về:
// > 0: số byte đã parse tạo thành 1 request hoàn chỉnh
// = 0: chưa đủ dữ liệu (cần đọc tiếp từ socket)
// < 0: lỗi cú pháp HTTP (HTTP 400 Bad Request)
int http_parser_execute(http_parser_t *parser, http_request_t *req, const char *data, size_t len);

const char *http_request_get_header(const http_request_t *req, const char *key);
const char *http_request_get_param(const http_request_t *req, const char *param_name);
void http_request_set_param(http_request_t *req, const char *key, const char *value);

// Response serialization API
void http_response_init(http_response_t *res, http_status_t status);
void http_response_add_header(http_response_t *res, const char *key, const char *value);
void http_response_set_body_json(http_response_t *res, const char *json_str);
void http_response_set_body_text(http_response_t *res, const char *text);
char *http_response_serialize(const http_response_t *res, size_t *out_len);
void http_response_free(http_response_t *res);

#endif // HTTP_PARSER_H
