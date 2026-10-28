#include "test_framework.h"
#include "http_router.h"
#include "http_parser.h"

#include <string.h>

#define TEST_RESP_BUF_SIZE 128

static void dummy_health_handler(const http_request_t *req, http_response_t *res) {
    (void)req;
    http_response_init(res, HTTP_STATUS_OK);
    http_response_set_body_json(res, "{\"status\":\"UP\"}");
}

static void dummy_exam_id_handler(const http_request_t *req, http_response_t *res) {
    const char *id = http_request_get_param(req, "id");
    http_response_init(res, HTTP_STATUS_OK);
    if (id) {
        char buf[TEST_RESP_BUF_SIZE];
        snprintf(buf, sizeof(buf), "{\"id\":\"%s\"}", id);
        http_response_set_body_json(res, buf);
    }
}

void test_router_static_and_dynamic_routes(void) {
    http_router_t router;
    http_router_init(&router);

    http_router_register(&router, HTTP_METHOD_GET, "/api/v1/health", dummy_health_handler);
    http_router_register(&router,
                         HTTP_METHOD_GET,
                         "/api/v1/exams/:id",
                         dummy_exam_id_handler);

    // 1. Kiểm thử đường dẫn tĩnh (Static Route)
    http_request_t req1;
    http_response_t res1;
    http_request_init(&req1);
    req1.method = HTTP_METHOD_GET;
    strncpy(req1.path, "/api/v1/health", sizeof(req1.path) - 1);

    http_router_dispatch(&router, &req1, &res1);
    ASSERT_EQ_INT(HTTP_STATUS_OK, res1.status_code, "Health route should return 200");
    ASSERT_NOT_NULL(res1.body, "Body must not be NULL");
    ASSERT_TRUE(strstr(res1.body, "UP") != NULL, "Response must contain UP");
    http_request_free(&req1);
    http_response_free(&res1);

    // 2. Kiểm thử đường dẫn chứa tham số động (:id)
    http_request_t req2;
    http_response_t res2;
    http_request_init(&req2);
    req2.method = HTTP_METHOD_GET;
    strncpy(req2.path, "/api/v1/exams/exam-999", sizeof(req2.path) - 1);

    http_router_dispatch(&router, &req2, &res2);
    ASSERT_EQ_INT(HTTP_STATUS_OK, res2.status_code, "Exams :id route should return 200");
    ASSERT_NOT_NULL(req2.param_keys[0], "Param key must be populated");
    ASSERT_NOT_NULL(res2.body, "Body must not be NULL");
    ASSERT_TRUE(strstr(res2.body, "exam-999") != NULL,
                "Extracted param exam-999 must appear in response");
    http_request_free(&req2);
    http_response_free(&res2);

    // 3. Kiểm thử yêu cầu CORS Preflight (OPTIONS)
    http_request_t req3;
    http_response_t res3;
    http_request_init(&req3);
    req3.method = HTTP_METHOD_OPTIONS;
    strncpy(req3.path, "/api/v1/exams", sizeof(req3.path) - 1);

    http_router_dispatch(&router, &req3, &res3);
    ASSERT_EQ_INT(HTTP_STATUS_NO_CONTENT,
                  res3.status_code,
                  "OPTIONS preflight should return 204");
    http_request_free(&req3);
    http_response_free(&res3);

    // 4. Kiểm thử đường dẫn không tồn tại (404 Not Found)
    http_request_t req4;
    http_response_t res4;
    http_request_init(&req4);
    req4.method = HTTP_METHOD_GET;
    strncpy(req4.path, "/not/existing/endpoint", sizeof(req4.path) - 1);

    http_router_dispatch(&router, &req4, &res4);
    ASSERT_EQ_INT(HTTP_STATUS_NOT_FOUND,
                  res4.status_code,
                  "Unknown route should return 404");
    http_request_free(&req4);
    http_response_free(&res4);
}
