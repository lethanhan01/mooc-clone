#ifndef HTTP_TYPES_H
#define HTTP_TYPES_H

#include <stddef.h>
#include <stdbool.h>

#define HTTP_MAX_HEADERS 64
#define HTTP_MAX_HEADER_KEY_LEN 128
#define HTTP_MAX_HEADER_VAL_LEN 512
#define HTTP_MAX_PATH_LEN 1024
#define HTTP_MAX_QUERY_LEN 1024

typedef enum {
    HTTP_METHOD_UNKNOWN = 0,
    HTTP_METHOD_GET,
    HTTP_METHOD_POST,
    HTTP_METHOD_PUT,
    HTTP_METHOD_DELETE,
    HTTP_METHOD_OPTIONS,
    HTTP_METHOD_HEAD
} http_method_t;

typedef enum {
    HTTP_STATUS_OK = 200,
    HTTP_STATUS_CREATED = 201,
    HTTP_STATUS_NO_CONTENT = 204,
    HTTP_STATUS_BAD_REQUEST = 400,
    HTTP_STATUS_UNAUTHORIZED = 401,
    HTTP_STATUS_FORBIDDEN = 403,
    HTTP_STATUS_NOT_FOUND = 404,
    HTTP_STATUS_METHOD_NOT_ALLOWED = 405,
    HTTP_STATUS_INTERNAL_ERROR = 500
} http_status_t;

typedef struct {
    char key[HTTP_MAX_HEADER_KEY_LEN];
    char value[HTTP_MAX_HEADER_VAL_LEN];
} http_header_t;

typedef struct {
    http_method_t method;
    char path[HTTP_MAX_PATH_LEN];
    char query[HTTP_MAX_QUERY_LEN];
    char http_version[16];
    http_header_t headers[HTTP_MAX_HEADERS];
    size_t header_count;
    char *body;
    size_t body_len;
    size_t content_length;
    bool keep_alive;

    // Dynamic path parameters (:id, :exam_id, etc.)
    char param_keys[8][32];
    char param_values[8][64];
    size_t param_count;
} http_request_t;

typedef struct {
    http_status_t status_code;
    const char *status_phrase;
    http_header_t headers[HTTP_MAX_HEADERS];
    size_t header_count;
    char *body;
    size_t body_len;
} http_response_t;

const char *http_method_str(http_method_t method);
http_method_t http_method_from_str(const char *str);
const char *http_status_phrase(http_status_t status);

#endif // HTTP_TYPES_H
