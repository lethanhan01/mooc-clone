#include "test_framework.h"
#include "in_memory_store.h"

#include <pthread.h>
#include <string.h>

void test_store_crud_basic(void) {
    in_memory_store_t store;
    store_init(&store);

    // Initial seed check
    exam_entity_t exams[MAX_EXAMS];
    int count = store_get_all_exams(&store, exams, MAX_EXAMS);
    ASSERT_TRUE(count >= 1, "Should have at least 1 seeded exam");

    // Create new exam
    exam_entity_t new_exam;
    memset(&new_exam, 0, sizeof(new_exam));
    strncpy(new_exam.title, "Unit Test Exam", sizeof(new_exam.title) - 1);
    strncpy(new_exam.description, "Test Desc", sizeof(new_exam.description) - 1);
    new_exam.duration_minutes = 90;

    char created_id[36] = {0};
    int res = store_create_exam(&store, &new_exam, created_id, sizeof(created_id));
    ASSERT_EQ_INT(0, res, "store_create_exam should return 0 on success");
    ASSERT_TRUE(strlen(created_id) > 0, "Created exam ID should not be empty");

    // Fetch by ID
    exam_entity_t fetched;
    res = store_get_exam_by_id(&store, created_id, &fetched);
    ASSERT_EQ_INT(0, res, "store_get_exam_by_id should return 0");
    ASSERT_EQ_STR("Unit Test Exam", fetched.title, "Title should match");
    ASSERT_EQ_INT(90, fetched.duration_minutes, "Duration should match");

    // Update
    strncpy(fetched.title, "Updated Unit Test Exam", sizeof(fetched.title) - 1);
    res = store_update_exam(&store, created_id, &fetched);
    ASSERT_EQ_INT(0, res, "store_update_exam should succeed");

    res = store_get_exam_by_id(&store, created_id, &fetched);
    ASSERT_EQ_STR("Updated Unit Test Exam", fetched.title, "Updated title should match");

    // Delete
    res = store_delete_exam(&store, created_id);
    ASSERT_EQ_INT(0, res, "store_delete_exam should return 0");

    res = store_get_exam_by_id(&store, created_id, &fetched);
    ASSERT_EQ_INT(-1, res, "store_get_exam_by_id after delete should return -1");

    store_destroy(&store);
}
