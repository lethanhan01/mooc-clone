#include "test_framework.h"

int g_tests_run = 0;
int g_tests_failed = 0;

/**
 * @brief Kiểm thử khởi tạo socket lắng nghe, thiết lập non-blocking và đóng kết nối.
 */
void test_tcp_server_init_and_close(void);

/**
 * @brief Kiểm thử bộ giao thức C Communication Engine (TLV Framing & Sticky/Fragmented Stream).
 */
void test_engine_protocol_encode_decode(void);
void test_engine_protocol_invalid_magic(void);
void test_engine_protocol_invalid_version(void);
void test_engine_protocol_sticky_and_fragmented_stream(void);

/**
 * @brief Điểm chạy chính của toàn bộ bộ kiểm thử đơn vị C Communication Engine.
 *
 * @return int 0 nếu 100% bài kiểm thử vượt qua, 1 nếu có bất kỳ bài kiểm thử nào lỗi.
 */
int main(void) {
    printf("====================================================\n");
    printf("  RUNNING C COMMUNICATION ENGINE UNIT TEST SUITES   \n");
    printf("====================================================\n");

    // 1. Kiểm thử tầng Socket TCP POSIX cơ sở
    RUN_TEST(test_tcp_server_init_and_close);

    // 2. Kiểm thử tầng Giao thức TLV 16B & Xử lý truyền dòng
    RUN_TEST(test_engine_protocol_encode_decode);
    RUN_TEST(test_engine_protocol_invalid_magic);
    RUN_TEST(test_engine_protocol_invalid_version);
    RUN_TEST(test_engine_protocol_sticky_and_fragmented_stream);

    printf("====================================================\n");
    printf("Results: %d/%d tests passed (%d failed)\n",
           g_tests_run - g_tests_failed, g_tests_run, g_tests_failed);
    printf("====================================================\n");

    return g_tests_failed == 0 ? 0 : 1;
}
