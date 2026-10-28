#include "http_parser.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define HTTP_HEADER_EST_BASE_SIZE 256
#define HTTP_HEADER_OVERHEAD_BYTES 4
#define HTTP_CONTENT_LEN_BUF_SIZE 64
#define HTTP_SERIALIZE_PADDING_SIZE 16

void http_response_init(http_response_t *res, http_status_t status) {
    if (!res) {
        return;
    }
    memset(res, 0, sizeof(http_response_t));
    res->status_code = status;
    res->status_phrase = http_status_phrase(status);
}

void http_response_add_header(http_response_t *res, const char *key, const char *value) {
    if (!res || !key || !value || res->header_count >= HTTP_MAX_HEADERS) {
        return;
    }
    strncpy(res->headers[res->header_count].key, key, HTTP_MAX_HEADER_KEY_LEN - 1);
    strncpy(res->headers[res->header_count].value, value, HTTP_MAX_HEADER_VAL_LEN - 1);
    res->header_count++;
}

void http_response_set_body_json(http_response_t *res, const char *json_str) {
    if (!res) {
        return;
    }
    if (res->body) {
        free(res->body);
        res->body = NULL;
    }
    if (json_str) {
        res->body_len = strlen(json_str);
        res->body = (char *)malloc(res->body_len + 1);
        if (res->body) {
            memcpy(res->body, json_str, res->body_len);
            res->body[res->body_len] = '\0';
        }
    } else {
        res->body_len = 0;
    }
    http_response_add_header(res, "Content-Type", "application/json; charset=utf-8");
}

void http_response_set_body_text(http_response_t *res, const char *text) {
    if (!res) {
        return;
    }
    if (res->body) {
        free(res->body);
        res->body = NULL;
    }
    if (text) {
        res->body_len = strlen(text);
        res->body = (char *)malloc(res->body_len + 1);
        if (res->body) {
            memcpy(res->body, text, res->body_len);
            res->body[res->body_len] = '\0';
        }
    } else {
        res->body_len = 0;
    }
    http_response_add_header(res, "Content-Type", "text/plain; charset=utf-8");
}

char *http_response_serialize(const http_response_t *res, size_t *out_len) {
    if (!res) {
        return NULL;
    }

    // Ước lượng dung lượng bộ đệm cần cấp phát cho Status-Line và toàn bộ Headers
    size_t est_header_len = HTTP_HEADER_EST_BASE_SIZE;
    for (size_t i = 0; i < res->header_count; i++) {
        est_header_len += strlen(res->headers[i].key) +
                          strlen(res->headers[i].value) +
                          HTTP_HEADER_OVERHEAD_BYTES;
    }
    est_header_len += HTTP_CONTENT_LEN_BUF_SIZE;

    size_t total_alloc = est_header_len + res->body_len + HTTP_SERIALIZE_PADDING_SIZE;
    char *buffer = (char *)malloc(total_alloc);
    if (!buffer) {
        return NULL;
    }

    int written = snprintf(buffer,
                           total_alloc,
                           "HTTP/1.1 %d %s\r\n",
                           res->status_code,
                           res->status_phrase ? res->status_phrase : "OK");

    // Đính kèm Content-Length để phía Client xác định chính xác ranh giới gói tin (Framing)
    char content_len_hdr[HTTP_CONTENT_LEN_BUF_SIZE];
    snprintf(content_len_hdr, sizeof(content_len_hdr), "%zu", res->body_len);
    written += snprintf(buffer + written,
                        total_alloc - (size_t)written,
                        "Content-Length: %s\r\n",
                        content_len_hdr);

    for (size_t i = 0; i < res->header_count; i++) {
        written += snprintf(buffer + written,
                            total_alloc - (size_t)written,
                            "%s: %s\r\n",
                            res->headers[i].key,
                            res->headers[i].value);
    }

    written += snprintf(buffer + written, total_alloc - (size_t)written, "\r\n");

    if (res->body && res->body_len > 0) {
        memcpy(buffer + written, res->body, res->body_len);
        written += (int)res->body_len;
    }

    buffer[written] = '\0';
    if (out_len) {
        *out_len = (size_t)written;
    }
    return buffer;
}

void http_response_free(http_response_t *res) {
    if (!res) {
        return;
    }
    if (res->body) {
        free(res->body);
        res->body = NULL;
    }
    res->body_len = 0;
    res->header_count = 0;
}
