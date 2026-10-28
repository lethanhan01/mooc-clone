#include "test_framework.h"
#include "http_parser.h"

#include <stdlib.h>
#include <string.h>

void test_parse_simple_get(void) {
    const char *raw = "GET /api/v1/health?param=1 HTTP/1.1\r\nHost: localhost:8080\r\nUser-Agent: curl/7.81.0\r\n\r\n";
    http_parser_t parser;
    http_request_t req;

    http_parser_init(&parser);
    http_request_init(&req);

    int res = http_parser_execute(&parser, &req, raw, strlen(raw));
    ASSERT_TRUE(res > 0, "Parser should return bytes parsed > 0");
    ASSERT_EQ_INT(HTTP_METHOD_GET, req.method, "Method should be GET");
    ASSERT_EQ_STR("/api/v1/health", req.path, "Path should match");
    ASSERT_EQ_STR("param=1", req.query, "Query string should match");
    ASSERT_EQ_STR("localhost:8080", http_request_get_header(&req, "Host"), "Host header should match");
    ASSERT_EQ_STR("curl/7.81.0", http_request_get_header(&req, "user-agent"), "Header search should be case-insensitive");
    ASSERT_TRUE(req.keep_alive, "Default keep-alive should be true in HTTP/1.1");

    http_request_free(&req);
}

void test_parse_post_with_body(void) {
    const char *raw = "POST /api/v1/exams HTTP/1.1\r\n"
                      "Host: localhost\r\n"
                      "Content-Type: application/json\r\n"
                      "Content-Length: 20\r\n"
                      "\r\n"
                      "{\"title\":\"C Exam 1\"}";
    http_parser_t parser;
    http_request_t req;

    http_parser_init(&parser);
    http_request_init(&req);

    int res = http_parser_execute(&parser, &req, raw, strlen(raw));
    ASSERT_TRUE(res > 0, "Parser should complete request with body");
    ASSERT_EQ_INT(HTTP_METHOD_POST, req.method, "Method should be POST");
    ASSERT_EQ_INT(20, (int)req.content_length, "Content-Length should be 20");
    ASSERT_NOT_NULL(req.body, "Body pointer must not be NULL");
    ASSERT_EQ_STR("{\"title\":\"C Exam 1\"}", req.body, "Body content should match exactly");

    http_request_free(&req);
}

void test_parse_fragmented_input(void) {
    const char *chunk1 = "POST /frag";
    const char *chunk2 = "mented HTTP/1.1\r\nHost: local";
    const char *chunk3 = "host\r\nContent-Length: 13\r\n\r\n{\"part\":";
    const char *chunk4 = "\"ok\"}";

    http_parser_t parser;
    http_request_t req;

    http_parser_init(&parser);
    http_request_init(&req);

    char buffer[256] = {0};
    size_t buf_len = 0;

    // Chunk 1: Partial Request-Line
    memcpy(buffer + buf_len, chunk1, strlen(chunk1));
    buf_len += strlen(chunk1);
    int res1 = http_parser_execute(&parser, &req, buffer, buf_len);
    ASSERT_EQ_INT(0, res1, "Incomplete chunk1 should return 0");

    // Chunk 2: Rest of Request-Line + Partial Header (NO parser re-init!)
    memcpy(buffer + buf_len, chunk2, strlen(chunk2));
    buf_len += strlen(chunk2);
    int res2 = http_parser_execute(&parser, &req, buffer, buf_len);
    ASSERT_EQ_INT(0, res2, "Incomplete chunk2 should return 0");

    // Chunk 3: Rest of Headers + Partial Body (8 of 13 bytes)
    memcpy(buffer + buf_len, chunk3, strlen(chunk3));
    buf_len += strlen(chunk3);
    int res3 = http_parser_execute(&parser, &req, buffer, buf_len);
    ASSERT_EQ_INT(0, res3, "Incomplete body chunk3 should return 0");

    // Chunk 4: Remaining 5 bytes of Body
    memcpy(buffer + buf_len, chunk4, strlen(chunk4));
    buf_len += strlen(chunk4);
    int res4 = http_parser_execute(&parser, &req, buffer, buf_len);
    ASSERT_EQ_INT((int)buf_len, res4, "Complete buffer should return exact total bytes parsed");
    ASSERT_EQ_INT(HTTP_METHOD_POST, req.method, "Method should be POST");
    ASSERT_EQ_STR("/fragmented", req.path, "Path should match concatenated input without state corruption");
    ASSERT_EQ_STR("localhost", http_request_get_header(&req, "Host"), "Host header should be preserved across chunks");
    ASSERT_NOT_NULL(req.body, "Body must not be NULL");
    ASSERT_EQ_STR("{\"part\":\"ok\"}", req.body, "Fragmented body should be reassembled accurately");

    http_request_free(&req);
}

void test_response_serialize(void) {
    http_response_t res;
    http_response_init(&res, HTTP_STATUS_OK);
    http_response_set_body_json(&res, "{\"status\":\"UP\"}");

    size_t out_len = 0;
    char *serialized = http_response_serialize(&res, &out_len);
    ASSERT_NOT_NULL(serialized, "Serialized response must not be NULL");
    ASSERT_TRUE(strstr(serialized, "HTTP/1.1 200 OK") != NULL, "Status line must contain HTTP/1.1 200 OK");
    ASSERT_TRUE(strstr(serialized, "Content-Type: application/json") != NULL, "Must have JSON Content-Type");
    ASSERT_TRUE(strstr(serialized, "{\"status\":\"UP\"}") != NULL, "Must contain body JSON");

    free(serialized);
    http_response_free(&res);
}

void test_parse_sticky_pipelined_requests(void) {
    const char *req1_raw = "GET /api/v1/health HTTP/1.1\r\nHost: localhost\r\n\r\n";
    const char *req2_raw = "DELETE /api/v1/exams/exam-1 HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n";

    char accum[512] = {0};
    size_t accum_len = 0;
    memcpy(accum, req1_raw, strlen(req1_raw));
    accum_len += strlen(req1_raw);
    memcpy(accum + accum_len, req2_raw, strlen(req2_raw));
    accum_len += strlen(req2_raw);

    http_parser_t parser;
    http_request_t req;
    http_parser_init(&parser);
    http_request_init(&req);

    // 1. Parse first sticky request
    int parsed1 = http_parser_execute(&parser, &req, accum, accum_len);
    ASSERT_EQ_INT((int)strlen(req1_raw), parsed1, "First pipelined request length should match");
    ASSERT_EQ_INT(HTTP_METHOD_GET, req.method, "First method should be GET");
    ASSERT_EQ_STR("/api/v1/health", req.path, "First path should be /api/v1/health");
    ASSERT_TRUE(req.keep_alive, "First request should default to keep-alive");
    http_request_free(&req);

    // Shift buffer via memmove just like Reactor
    size_t consumed = (size_t)parsed1;
    memmove(accum, accum + consumed, accum_len - consumed);
    accum_len -= consumed;
    http_parser_init(&parser);
    http_request_init(&req);

    // 2. Parse second sticky request from remaining buffer
    int parsed2 = http_parser_execute(&parser, &req, accum, accum_len);
    ASSERT_EQ_INT((int)strlen(req2_raw), parsed2, "Second pipelined request length should match");
    ASSERT_EQ_INT(HTTP_METHOD_DELETE, req.method, "Second method should be DELETE");
    ASSERT_EQ_STR("/api/v1/exams/exam-1", req.path, "Second path should be /api/v1/exams/exam-1");
    ASSERT_TRUE(!req.keep_alive, "Second request Connection: close should set keep_alive = false");
    http_request_free(&req);
}

void test_parse_malformed_request(void) {
    const char *bad_raw = "INVALID_METHOD /api/v1/health HTTP/1.1\r\n\r\n";
    http_parser_t parser;
    http_request_t req;
    http_parser_init(&parser);
    http_request_init(&req);

    int res = http_parser_execute(&parser, &req, bad_raw, strlen(bad_raw));
    ASSERT_EQ_INT(-1, res, "Malformed HTTP method should return -1");
    ASSERT_EQ_INT(FSM_STATE_ERROR, parser.state, "Parser state should be FSM_STATE_ERROR");
    http_request_free(&req);
}
