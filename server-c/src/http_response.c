#include "http_parser.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void http_response_init(http_response_t *res, http_status_t status) {
    if (!res) return;
    memset(res, 0, sizeof(http_response_t));
    res->status_code = status;
    res->status_phrase = http_status_phrase(status);
}

void http_response_add_header(http_response_t *res, const char *key, const char *value) {
    if (!res || !key || !value || res->header_count >= HTTP_MAX_HEADERS) return;
    strncpy(res->headers[res->header_count].key, key, HTTP_MAX_HEADER_KEY_LEN - 1);
    strncpy(res->headers[res->header_count].value, value, HTTP_MAX_HEADER_VAL_LEN - 1);
    res->header_count++;
}

void http_response_set_body_json(http_response_t *res, const char *json_str) {
    if (!res) return;
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
    if (!res) return;
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
    if (!res) return NULL;

    // Tính toán kích thước ước lượng cho headers
    size_t est_header_len = 256;
    for (size_t i = 0; i < res->header_count; i++) {
        est_header_len += strlen(res->headers[i].key) + strlen(res->headers[i].value) + 4;
    }
    est_header_len += 64; // Content-Length header

    size_t total_alloc = est_header_len + res->body_len + 16;
    char *buf = (char *)malloc(total_alloc);
    if (!buf) return NULL;

    int written = snprintf(buf, total_alloc, "HTTP/1.1 %d %s\r\n", res->status_code,
                           res->status_phrase ? res->status_phrase : "OK");

    // Thêm Content-Length nếu chưa có
    char cl_header[64];
    snprintf(cl_header, sizeof(cl_header), "%zu", res->body_len);
    written += snprintf(buf + written, total_alloc - written, "Content-Length: %s\r\n", cl_header);

    for (size_t i = 0; i < res->header_count; i++) {
        written += snprintf(buf + written, total_alloc - written, "%s: %s\r\n",
                            res->headers[i].key, res->headers[i].value);
    }

    written += snprintf(buf + written, total_alloc - written, "\r\n");

    if (res->body && res->body_len > 0) {
        memcpy(buf + written, res->body, res->body_len);
        written += (int)res->body_len;
    }

    buf[written] = '\0';
    if (out_len) {
        *out_len = (size_t)written;
    }
    return buf;
}

void http_response_free(http_response_t *res) {
    if (!res) return;
    if (res->body) {
        free(res->body);
        res->body = NULL;
    }
    res->body_len = 0;
    res->header_count = 0;
}
