#include "http_parser.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <ctype.h>

const char *http_method_str(http_method_t method) {
    switch (method) {
        case HTTP_METHOD_GET: {
            return "GET";
        }
        case HTTP_METHOD_POST: {
            return "POST";
        }
        case HTTP_METHOD_PUT: {
            return "PUT";
        }
        case HTTP_METHOD_DELETE: {
            return "DELETE";
        }
        case HTTP_METHOD_OPTIONS: {
            return "OPTIONS";
        }
        case HTTP_METHOD_HEAD: {
            return "HEAD";
        }
        default: {
            return "UNKNOWN";
        }
    }
}

http_method_t http_method_from_str(const char *str) {
    if (!str) {
        return HTTP_METHOD_UNKNOWN;
    }
    if (strcmp(str, "GET") == 0) {
        return HTTP_METHOD_GET;
    }
    if (strcmp(str, "POST") == 0) {
        return HTTP_METHOD_POST;
    }
    if (strcmp(str, "PUT") == 0) {
        return HTTP_METHOD_PUT;
    }
    if (strcmp(str, "DELETE") == 0) {
        return HTTP_METHOD_DELETE;
    }
    if (strcmp(str, "OPTIONS") == 0) {
        return HTTP_METHOD_OPTIONS;
    }
    if (strcmp(str, "HEAD") == 0) {
        return HTTP_METHOD_HEAD;
    }
    return HTTP_METHOD_UNKNOWN;
}

const char *http_status_phrase(http_status_t status) {
    switch (status) {
        case HTTP_STATUS_OK: {
            return "OK";
        }
        case HTTP_STATUS_CREATED: {
            return "Created";
        }
        case HTTP_STATUS_NO_CONTENT: {
            return "No Content";
        }
        case HTTP_STATUS_BAD_REQUEST: {
            return "Bad Request";
        }
        case HTTP_STATUS_UNAUTHORIZED: {
            return "Unauthorized";
        }
        case HTTP_STATUS_FORBIDDEN: {
            return "Forbidden";
        }
        case HTTP_STATUS_NOT_FOUND: {
            return "Not Found";
        }
        case HTTP_STATUS_METHOD_NOT_ALLOWED: {
            return "Method Not Allowed";
        }
        case HTTP_STATUS_CONFLICT: {
            return "Conflict";
        }
        case HTTP_STATUS_INTERNAL_ERROR: {
            return "Internal Server Error";
        }
        default: {
            return "Unknown Status";
        }
    }
}

void http_parser_init(http_parser_t *parser) {
    if (!parser) {
        return;
    }
    memset(parser, 0, sizeof(http_parser_t));
    parser->state = FSM_STATE_START;
}

void http_request_init(http_request_t *req) {
    if (!req) {
        return;
    }
    memset(req, 0, sizeof(http_request_t));
    // Theo đặc tả RFC 9112 (HTTP/1.1), kết nối mặc định là persistent (Keep-Alive)
    // trừ khi client gửi kèm tường minh "Connection: close".
    req->keep_alive = true;
}

void http_request_free(http_request_t *req) {
    if (!req) {
        return;
    }
    if (req->body) {
        free(req->body);
        req->body = NULL;
    }
    req->body_len = 0;
    req->header_count = 0;
    req->param_count = 0;
}

const char *http_request_get_header(const http_request_t *req, const char *key) {
    if (!req || !key) {
        return NULL;
    }
    // Tên trường HTTP Header không phân biệt chữ hoa/thường theo chuẩn RFC 9110
    for (size_t i = 0; i < req->header_count; i++) {
        if (strcasecmp(req->headers[i].key, key) == 0) {
            return req->headers[i].value;
        }
    }
    return NULL;
}

const char *http_request_get_param(const http_request_t *req, const char *param_name) {
    if (!req || !param_name) {
        return NULL;
    }
    for (size_t i = 0; i < req->param_count; i++) {
        if (strcmp(req->param_keys[i], param_name) == 0) {
            return req->param_values[i];
        }
    }
    return NULL;
}

void http_request_set_param(http_request_t *req, const char *key, const char *value) {
    if (!req || !key || !value || req->param_count >= HTTP_MAX_PARAMS) {
        return;
    }
    strncpy(req->param_keys[req->param_count], key, sizeof(req->param_keys[0]) - 1);
    strncpy(req->param_values[req->param_count], value, sizeof(req->param_values[0]) - 1);
    req->param_count++;
}

int http_parser_execute(http_parser_t *parser, http_request_t *req, const char *data, size_t len) {
    if (!parser || !req || !data || len == 0) {
        return 0;
    }
    if (parser->state == FSM_STATE_ERROR) {
        return -1;
    }
    if (parser->state == FSM_STATE_COMPLETE) {
        return (int)parser->bytes_parsed;
    }

    // Tiếp tục quét từ vị trí bytes_parsed của lần gọi trước để hỗ trợ gói tin TCP bị phân mảnh
    // mà không phải phân tích lại từ đầu buffer.
    size_t i = parser->bytes_parsed;
    while (i < len &&
           parser->state != FSM_STATE_COMPLETE &&
           parser->state != FSM_STATE_ERROR) {
        char current_char = data[i];

        switch (parser->state) {
            case FSM_STATE_START:
            case FSM_STATE_METHOD: {
                if (current_char == ' ') {
                    parser->temp_method[parser->method_idx] = '\0';
                    req->method = http_method_from_str(parser->temp_method);
                    if (req->method == HTTP_METHOD_UNKNOWN) {
                        parser->state = FSM_STATE_ERROR;
                        return -1;
                    }
                    parser->state = FSM_STATE_URI;
                } else if (parser->method_idx < sizeof(parser->temp_method) - 1 &&
                           isalpha((unsigned char)current_char)) {
                    parser->temp_method[parser->method_idx++] = current_char;
                    parser->state = FSM_STATE_METHOD;
                } else {
                    parser->state = FSM_STATE_ERROR;
                    return -1;
                }
                break;
            }

            case FSM_STATE_URI: {
                if (current_char == ' ') {
                    parser->temp_uri[parser->uri_idx] = '\0';
                    char *query_sep = strchr(parser->temp_uri, '?');
                    if (query_sep) {
                        *query_sep = '\0';
                        strncpy(req->path, parser->temp_uri, sizeof(req->path) - 1);
                        strncpy(req->query, query_sep + 1, sizeof(req->query) - 1);
                    } else {
                        strncpy(req->path, parser->temp_uri, sizeof(req->path) - 1);
                        req->query[0] = '\0';
                    }
                    parser->state = FSM_STATE_VERSION;
                } else if (parser->uri_idx < sizeof(parser->temp_uri) - 1 &&
                           current_char != '\r' &&
                           current_char != '\n') {
                    parser->temp_uri[parser->uri_idx++] = current_char;
                } else {
                    parser->state = FSM_STATE_ERROR;
                    return -1;
                }
                break;
            }

            case FSM_STATE_VERSION: {
                if (current_char == '\r') {
                    parser->temp_ver[parser->ver_idx] = '\0';
                    strncpy(req->http_version, parser->temp_ver, sizeof(req->http_version) - 1);
                    parser->state = FSM_STATE_LINE_CR;
                } else if (parser->ver_idx < sizeof(parser->temp_ver) - 1 &&
                           current_char != '\n') {
                    parser->temp_ver[parser->ver_idx++] = current_char;
                } else {
                    parser->state = FSM_STATE_ERROR;
                    return -1;
                }
                break;
            }

            case FSM_STATE_LINE_CR: {
                if (current_char == '\n') {
                    parser->key_len = 0;
                    parser->val_len = 0;
                    parser->state = FSM_STATE_HEADER_KEY;
                } else {
                    parser->state = FSM_STATE_ERROR;
                    return -1;
                }
                break;
            }

            case FSM_STATE_HEADER_KEY: {
                if (current_char == '\r') {
                    // Gặp dòng trống \r\n ngay đầu dòng Header -> Kết thúc khối Headers
                    parser->state = FSM_STATE_HEADERS_END_LF;
                } else if (current_char == ':') {
                    parser->temp_key[parser->key_len] = '\0';
                    parser->state = FSM_STATE_HEADER_COLON;
                } else if (parser->key_len < sizeof(parser->temp_key) - 1 &&
                           current_char != '\n') {
                    parser->temp_key[parser->key_len++] = current_char;
                } else {
                    parser->state = FSM_STATE_ERROR;
                    return -1;
                }
                break;
            }

            case FSM_STATE_HEADER_COLON: {
                if (current_char == ' ' || current_char == '\t') {
                    // Bỏ qua khoảng trắng tùy chọn (OWS - Optional Whitespace) sau dấu ':'
                } else if (current_char == '\r') {
                    parser->temp_val[0] = '\0';
                    parser->state = FSM_STATE_HEADER_CR;
                } else {
                    parser->temp_val[0] = current_char;
                    parser->val_len = 1;
                    parser->state = FSM_STATE_HEADER_VALUE;
                }
                break;
            }

            case FSM_STATE_HEADER_VALUE: {
                if (current_char == '\r') {
                    parser->temp_val[parser->val_len] = '\0';
                    parser->state = FSM_STATE_HEADER_CR;
                } else if (parser->val_len < sizeof(parser->temp_val) - 1 &&
                           current_char != '\n') {
                    parser->temp_val[parser->val_len++] = current_char;
                } else {
                    parser->state = FSM_STATE_ERROR;
                    return -1;
                }
                break;
            }

            case FSM_STATE_HEADER_CR: {
                if (current_char == '\n') {
                    if (req->header_count < HTTP_MAX_HEADERS) {
                        strncpy(req->headers[req->header_count].key,
                                parser->temp_key,
                                HTTP_MAX_HEADER_KEY_LEN - 1);
                        strncpy(req->headers[req->header_count].value,
                                parser->temp_val,
                                HTTP_MAX_HEADER_VAL_LEN - 1);
                        req->header_count++;
                    }
                    parser->key_len = 0;
                    parser->val_len = 0;
                    parser->state = FSM_STATE_HEADER_KEY;
                } else {
                    parser->state = FSM_STATE_ERROR;
                    return -1;
                }
                break;
            }

            case FSM_STATE_HEADERS_END_LF: {
                if (current_char == '\n') {
                    // Đóng khung thông điệp (Application-level Framing):
                    // Dựa vào Header Content-Length để biết chính xác số byte phần Body cần đọc.
                    const char *content_len_str = http_request_get_header(req, "Content-Length");
                    if (content_len_str) {
                        req->content_length = (size_t)strtoul(content_len_str, NULL, 10);
                    } else {
                        req->content_length = 0;
                    }

                    const char *connection_hdr = http_request_get_header(req, "Connection");
                    if (connection_hdr && strcasecmp(connection_hdr, "close") == 0) {
                        req->keep_alive = false;
                    } else {
                        req->keep_alive = true;
                    }

                    if (req->content_length > 0) {
                        if (req->body) {
                            free(req->body);
                            req->body = NULL;
                        }
                        req->body = (char *)malloc(req->content_length + 1);
                        if (!req->body) {
                            parser->state = FSM_STATE_ERROR;
                            return -1;
                        }
                        parser->body_bytes_read = 0;
                        parser->state = FSM_STATE_BODY;
                    } else {
                        parser->state = FSM_STATE_COMPLETE;
                        i++;
                        parser->bytes_parsed = i;
                        return (int)parser->bytes_parsed;
                    }
                } else {
                    parser->state = FSM_STATE_ERROR;
                    return -1;
                }
                break;
            }

            case FSM_STATE_BODY: {
                size_t remaining_in_chunk = len - i;
                size_t needed = req->content_length - parser->body_bytes_read;
                size_t to_copy = remaining_in_chunk < needed ? remaining_in_chunk : needed;

                memcpy(req->body + parser->body_bytes_read, data + i, to_copy);
                parser->body_bytes_read += to_copy;
                i += to_copy;
                parser->bytes_parsed = i;

                if (parser->body_bytes_read == req->content_length) {
                    req->body[req->content_length] = '\0';
                    req->body_len = req->content_length;
                    parser->state = FSM_STATE_COMPLETE;
                    return (int)parser->bytes_parsed;
                }
                // Chưa nhận đủ số byte của Body theo Content-Length -> chờ lần recv() tiếp theo
                return 0;
            }

            default: {
                parser->state = FSM_STATE_ERROR;
                return -1;
            }
        }

        i++;
        parser->bytes_parsed = i;
    }

    if (parser->state == FSM_STATE_COMPLETE) {
        return (int)parser->bytes_parsed;
    }

    return 0;
}
