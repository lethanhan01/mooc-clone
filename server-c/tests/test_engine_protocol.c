#include "test_framework.h"
#include "engine_protocol.h"
#include <string.h>

void test_engine_protocol_encode_decode(void) {
    g_tests_run++;

    engine_header_t original;
    original.magic = ENGINE_MAGIC;
    original.version = ENGINE_VERSION;
    original.msg_type = OP_ROOM_CREATE_REQ;
    original.seq_id = 1001;
    original.client_id = 42;
    original.payload_len = 128;

    uint8_t buffer[ENGINE_HEADER_SIZE];
    engine_header_encode(&original, buffer);

    engine_header_t decoded;
    int res = engine_header_decode(buffer, &decoded);

    ASSERT_EQ_INT(0, res, "engine_header_decode should return 0 on valid header");
    ASSERT_EQ_INT(ENGINE_MAGIC, decoded.magic, "Magic should match ENGINE_MAGIC");
    ASSERT_EQ_INT(ENGINE_VERSION, decoded.version, "Version should match ENGINE_VERSION");
    ASSERT_EQ_INT(OP_ROOM_CREATE_REQ, decoded.msg_type, "MsgType should match OP_ROOM_CREATE_REQ");
    ASSERT_EQ_INT(1001, decoded.seq_id, "SeqId should match 1001");
    ASSERT_EQ_INT(42, decoded.client_id, "ClientId should match 42");
    ASSERT_EQ_INT(128, decoded.payload_len, "PayloadLen should match 128");
}

void test_engine_protocol_invalid_magic(void) {
    g_tests_run++;

    uint8_t bad_buffer[ENGINE_HEADER_SIZE] = {0};
    bad_buffer[0] = 0xFF;
    bad_buffer[1] = 0xAA; /* Invalid magic */
    bad_buffer[2] = ENGINE_VERSION;
    bad_buffer[3] = OP_AUTH_LOGIN_REQ;

    engine_header_t decoded;
    int res = engine_header_decode(bad_buffer, &decoded);

    ASSERT_EQ_INT(-1, res, "engine_header_decode should reject invalid magic");
}

void test_engine_protocol_invalid_version(void) {
    g_tests_run++;

    engine_header_t orig;
    orig.magic = ENGINE_MAGIC;
    orig.version = 0x99; /* Invalid version */
    orig.msg_type = OP_AUTH_LOGIN_REQ;
    orig.seq_id = 1;
    orig.client_id = 10;
    orig.payload_len = 10;

    uint8_t buffer[ENGINE_HEADER_SIZE];
    engine_header_encode(&orig, buffer);

    engine_header_t decoded;
    int res = engine_header_decode(buffer, &decoded);

    ASSERT_EQ_INT(-1, res, "engine_header_decode should reject invalid version");
}

void test_engine_protocol_sticky_and_fragmented_stream(void) {
    g_tests_run++;

    /* Simulate 2 concatenated frames (sticky packets) */
    const char *payload1 = "{\"cmd\":\"room_list\"}";
    const char *payload2 = "{\"cmd\":\"exam_start\"}";
    size_t len1 = strlen(payload1);
    size_t len2 = strlen(payload2);

    engine_header_t h1 = {ENGINE_MAGIC, ENGINE_VERSION, OP_ROOM_LIST_REQ, 1, 10, (uint32_t)len1};
    engine_header_t h2 = {ENGINE_MAGIC, ENGINE_VERSION, OP_EXAM_START_REQ, 2, 10, (uint32_t)len2};

    uint8_t stream_buf[256];
    size_t offset = 0;

    engine_header_encode(&h1, stream_buf + offset);
    offset += ENGINE_HEADER_SIZE;
    memcpy(stream_buf + offset, payload1, len1);
    offset += len1;

    engine_header_encode(&h2, stream_buf + offset);
    offset += ENGINE_HEADER_SIZE;
    memcpy(stream_buf + offset, payload2, len2);
    offset += len2;

    /* Verify stream has both frames and can slice them cleanly */
    size_t total_stream_len = offset;
    size_t processed = 0;

    /* Frame 1 */
    ASSERT_TRUE(total_stream_len - processed >= ENGINE_HEADER_SIZE, "Must have header 1");
    engine_header_t parsed1;
    int r1 = engine_header_decode(stream_buf + processed, &parsed1);
    ASSERT_EQ_INT(0, r1, "Decode frame 1 header");
    ASSERT_EQ_INT(OP_ROOM_LIST_REQ, parsed1.msg_type, "MsgType 1");
    ASSERT_EQ_INT(len1, parsed1.payload_len, "Payload len 1");
    processed += ENGINE_HEADER_SIZE + parsed1.payload_len;

    /* Frame 2 */
    ASSERT_TRUE(total_stream_len - processed >= ENGINE_HEADER_SIZE, "Must have header 2");
    engine_header_t parsed2;
    int r2 = engine_header_decode(stream_buf + processed, &parsed2);
    ASSERT_EQ_INT(0, r2, "Decode frame 2 header");
    ASSERT_EQ_INT(OP_EXAM_START_REQ, parsed2.msg_type, "MsgType 2");
    ASSERT_EQ_INT(len2, parsed2.payload_len, "Payload len 2");
    processed += ENGINE_HEADER_SIZE + parsed2.payload_len;

    ASSERT_EQ_INT(total_stream_len, processed, "All sticky bytes consumed exactly");
}

