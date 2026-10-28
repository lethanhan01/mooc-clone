#include "test_framework.h"

int g_tests_run = 0;
int g_tests_failed = 0;

/**
 * @brief Kiểm thử khởi tạo socket lắng nghe, thiết lập non-blocking và đóng kết nối.
 */
void test_tcp_server_init_and_close(void);

/**
 * @brief Kiểm thử phân tích gói tin HTTP GET cơ bản có Query String và Headers.
 */
void test_parse_simple_get(void);

/**
 * @brief Kiểm thử phân tích gói tin HTTP POST đính kèm JSON Body theo Content-Length.
 */
void test_parse_post_with_body(void);

/**
 * @brief Kiểm thử khả năng chịu phân mảnh dòng byte TCP (Stream Fragmentation).
 */
void test_parse_fragmented_input(void);

/**
 * @brief Kiểm thử khả năng bóc tách nhiều gói tin HTTP dính liền (HTTP Pipelining).
 */
void test_parse_sticky_pipelined_requests(void);

/**
 * @brief Kiểm thử phát hiện gói tin sai cú pháp HTTP và chuyển sang FSM_STATE_ERROR.
 */
void test_parse_malformed_request(void);

/**
 * @brief Kiểm thử đóng gói cấu trúc http_response_t sang chuỗi byte chuẩn HTTP/1.1.
 */
void test_response_serialize(void);

/**
 * @brief Kiểm thử định tuyến URL tĩnh, tham số động (:id), CORS OPTIONS và 404.
 */
void test_router_static_and_dynamic_routes(void);

/**
 * @brief Kiểm thử các thao tác CRUD đề thi trên kho lưu trữ RAM.
 */
void test_store_crud_basic(void);

/**
 * @brief Kiểm thử vòng đời phòng thi Short Polling, Lazy Expiration và Grace Period.
 */
void test_store_room_polling_and_lazy_expiration(void);

/**
 * @brief Điểm chạy chính của toàn bộ bộ kiểm thử đơn vị (Unit Test Runner).
 *
 * @return int 0 nếu 100% bài kiểm thử vượt qua, 1 nếu có bất kỳ bài kiểm thử nào lỗi.
 */
int main(void) {
    printf("====================================================\n");
    printf("       RUNNING SERVER-C UNIT TEST SUITES           \n");
    printf("====================================================\n");

    // Kiểm thử tầng Socket TCP (Giai đoạn 1)
    RUN_TEST(test_tcp_server_init_and_close);

    // Kiểm thử tầng Giao thức HTTP/1.1 FSM & Framing (Giai đoạn 2)
    RUN_TEST(test_parse_simple_get);
    RUN_TEST(test_parse_post_with_body);
    RUN_TEST(test_parse_fragmented_input);
    RUN_TEST(test_parse_sticky_pipelined_requests);
    RUN_TEST(test_parse_malformed_request);
    RUN_TEST(test_response_serialize);

    // Kiểm thử tầng Định tuyến & Kho lưu trữ Đa luồng (Giai đoạn 3)
    RUN_TEST(test_router_static_and_dynamic_routes);
    RUN_TEST(test_store_crud_basic);
    RUN_TEST(test_store_room_polling_and_lazy_expiration);

    printf("====================================================\n");
    printf("Results: %d/%d tests passed (%d failed)\n",
           g_tests_run - g_tests_failed, g_tests_run, g_tests_failed);
    printf("====================================================\n");

    return g_tests_failed == 0 ? 0 : 1;
}
