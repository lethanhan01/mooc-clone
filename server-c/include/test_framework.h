#ifndef TEST_FRAMEWORK_H
#define TEST_FRAMEWORK_H

#include <stdio.h>
#include <string.h>

extern int g_tests_run;
extern int g_tests_failed;

#define ASSERT_TRUE(condition, message) do { \
    if (!(condition)) { \
        printf("\033[1;31m  [FAIL] %s:%d: %s\033[0m\n", __FILE__, __LINE__, message); \
        g_tests_failed++; \
        return; \
    } \
} while(0)

#define ASSERT_FALSE(condition, message) do { \
    if (condition) { \
        printf("\033[1;31m  [FAIL] %s:%d: %s\033[0m\n", __FILE__, __LINE__, message); \
        g_tests_failed++; \
        return; \
    } \
} while(0)

#define ASSERT_EQ_INT(expected, actual, message) do { \
    int _exp = (expected); \
    int _act = (actual); \
    if (_exp != _act) { \
        printf("\033[1;31m  [FAIL] %s:%d: %s (Expected: %d, Got: %d)\033[0m\n", \
               __FILE__, __LINE__, message, _exp, _act); \
        g_tests_failed++; \
        return; \
    } \
} while(0)

#define ASSERT_EQ_STR(expected, actual, message) do { \
    const char *_exp = (expected); \
    const char *_act = (actual); \
    if ((_exp == NULL && _act != NULL) || (_exp != NULL && _act == NULL) || \
        (_exp != NULL && _act != NULL && strcmp(_exp, _act) != 0)) { \
        printf("\033[1;31m  [FAIL] %s:%d: %s (Expected: '%s', Got: '%s')\033[0m\n", \
               __FILE__, __LINE__, message, _exp ? _exp : "(null)", _act ? _act : "(null)"); \
        g_tests_failed++; \
        return; \
    } \
} while(0)

#define ASSERT_NOT_NULL(ptr, message) do { \
    if ((ptr) == NULL) { \
        printf("\033[1;31m  [FAIL] %s:%d: %s (Pointer is NULL)\033[0m\n", __FILE__, __LINE__, message); \
        g_tests_failed++; \
        return; \
    } \
} while(0)

#define RUN_TEST(test_func) do { \
    int _failed_before = g_tests_failed; \
    printf("\033[1;34m[RUN ]\033[0m %s\n", #test_func); \
    test_func(); \
    g_tests_run++; \
    if (g_tests_failed == _failed_before) { \
        printf("\033[1;32m[PASS]\033[0m %s\n", #test_func); \
    } \
} while(0)

#endif // TEST_FRAMEWORK_H
