#include "test_framework.h"

int g_tests_run = 0;
int g_tests_failed = 0;

// Declarations of individual test functions
void test_tcp_server_init_and_close(void);
void test_parse_simple_get(void);
void test_parse_post_with_body(void);
void test_parse_fragmented_input(void);
void test_response_serialize(void);
void test_router_static_and_dynamic_routes(void);
void test_store_crud_basic(void);

int main(void) {
    printf("====================================================\n");
    printf("       RUNNING SERVER-C UNIT TEST SUITES           \n");
    printf("====================================================\n");

    // Phase 1 tests
    RUN_TEST(test_tcp_server_init_and_close);

    // Phase 2 tests
    RUN_TEST(test_parse_simple_get);
    RUN_TEST(test_parse_post_with_body);
    RUN_TEST(test_parse_fragmented_input);
    RUN_TEST(test_response_serialize);

    // Phase 3 tests
    RUN_TEST(test_router_static_and_dynamic_routes);
    RUN_TEST(test_store_crud_basic);

    printf("====================================================\n");
    printf("Results: %d/%d tests passed (%d failed)\n",
           g_tests_run - g_tests_failed, g_tests_run, g_tests_failed);
    printf("====================================================\n");

    return g_tests_failed == 0 ? 0 : 1;
}
