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
    const char *chunk1 = "GET /frag";
    const char *chunk2 = "mented HTTP/1.1\r\nHost: local";
    const char *chunk3 = "host\r\n\r\n";

    http_parser_t parser;
    http_request_t req;

    http_parser_init(&parser);
    http_request_init(&req);

    int res1 = http_parser_execute(&parser, &req, chunk1, strlen(chunk1));
    ASSERT_EQ_INT(0, res1, "Incomplete chunk1 should return 0");

    char buffer[256];
    snprintf(buffer, sizeof(buffer), "%s%s", chunk1, chunk2);
    http_parser_init(&parser);
    http_request_init(&req);
    int res2 = http_parser_execute(&parser, &req, buffer, strlen(buffer));
    ASSERT_EQ_INT(0, res2, "Incomplete chunk2 should return 0");

    snprintf(buffer, sizeof(buffer), "%s%s%s", chunk1, chunk2, chunk3);
    http_parser_init(&parser);
    http_request_init(&req);
    int res3 = http_parser_execute(&parser, &req, buffer, strlen(buffer));
    ASSERT_TRUE(res3 > 0, "Complete buffer should parse successfully");
    ASSERT_EQ_STR("/fragmented", req.path, "Path should match concatenated input");

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
