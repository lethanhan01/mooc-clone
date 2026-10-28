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

void test_store_room_polling_and_lazy_expiration(void) {
    in_memory_store_t store;
    store_init(&store);

    exam_room_t input_room;
    memset(&input_room, 0, sizeof(input_room));
    strncpy(input_room.room_code, "POLL99", sizeof(input_room.room_code) - 1);
    strncpy(input_room.name, "Polling Test Room", sizeof(input_room.name) - 1);
    strncpy(input_room.exam_id, "exam-1", sizeof(input_room.exam_id) - 1);
    input_room.duration_seconds = 1; // 1 second duration

    exam_room_t room_out;
    int rc = store_create_room(&store, &input_room, &room_out);
    ASSERT_EQ_INT(0, rc, "store_create_room should succeed");
    ASSERT_EQ_INT(ROOM_STATUS_WAITING, room_out.status, "Initial room status should be WAITING");

    rc = store_join_room(&store, "POLL99", "student_01", &room_out);
    ASSERT_EQ_INT(0, rc, "store_join_room should succeed");
    ASSERT_EQ_INT(1, (int)room_out.participant_count, "Participant count should be 1");

    rc = store_start_room(&store, "POLL99", &room_out);
    ASSERT_EQ_INT(0, rc, "store_start_room should succeed");
    ASSERT_EQ_INT(ROOM_STATUS_RUNNING, room_out.status, "Room status after start should be RUNNING");
    ASSERT_TRUE(room_out.ends_at_ms > room_out.started_at_ms, "ends_at_ms should be greater than started_at_ms");

    // Simulate time passing beyond ends_at_ms + ROOM_SUBMIT_GRACE_MS (2000ms)
    store.rooms[store.room_count - 1].ends_at_ms = get_server_now_ms() - 2500;

    // Submitting after grace period must return -2 (expired) and lazily transition to ENDED
    rc = store_submit_room_attempt(&store, "POLL99", "student_01", 9, &room_out);
    ASSERT_EQ_INT(-2, rc, "store_submit_room_attempt after grace period must fail with -2");
    ASSERT_EQ_INT(ROOM_STATUS_ENDED, room_out.status, "Room status must lazily transition to ENDED");

    store_destroy(&store);
}
