#ifndef ENGINE_PROTOCOL_H
#define ENGINE_PROTOCOL_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#define ENGINE_MAGIC 0x4D43         /* ASCII "MC" - Mooc Clone */
#define ENGINE_VERSION 0x01
#define ENGINE_HEADER_SIZE 16
#define MAX_PAYLOAD_SIZE (2 * 1024 * 1024) /* 2 MB */
#define BROADCAST_CLIENT_ID 0xFFFFFFFFU

/* Opcodes - Message Types */
#define OP_SYS_HANDSHAKE      0x00
#define OP_AUTH_LOGIN_REQ     0x01
#define OP_AUTH_LOGIN_RESP    0x02
#define OP_AUTH_REGISTER_REQ  0x03
#define OP_AUTH_REGISTER_RESP 0x04
#define OP_ROOM_LIST_REQ      0x10
#define OP_ROOM_LIST_RESP     0x11
#define OP_ROOM_CREATE_REQ    0x12
#define OP_ROOM_CREATE_RESP   0x13
#define OP_ROOM_JOIN_REQ      0x14
#define OP_ROOM_JOIN_RESP     0x15
#define OP_EXAM_START_REQ     0x20
#define OP_EXAM_START_RESP    0x21
#define OP_EXAM_SUBMIT_REQ    0x22
#define OP_EXAM_SUBMIT_RESP   0x23
#define OP_SERVER_BROADCAST   0x80
#define OP_PING               0xFE
#define OP_PONG               0xFF

#pragma pack(push, 1)
typedef struct {
    uint16_t magic;
    uint8_t  version;
    uint8_t  msg_type;
    uint32_t seq_id;
    uint32_t client_id;
    uint32_t payload_len;
} engine_header_t;
#pragma pack(pop)

/**
 * @brief Đóng gói engine_header_t thành mảng byte chuẩn Network Byte Order (Big-Endian).
 * @param src Con trỏ cấu trúc header nguồn.
 * @param dest_buf Mảng byte đích tối thiểu ENGINE_HEADER_SIZE (16 bytes).
 */
void engine_header_encode(const engine_header_t *src, uint8_t *dest_buf);

/**
 * @brief Giải mã mảng byte thành engine_header_t (từ Network Byte Order sang Host Order).
 * @param src_buf Mảng byte nguồn tối thiểu 16 bytes.
 * @param dest Con trỏ cấu trúc header lưu kết quả.
 * @return 0 nếu thành công, -1 nếu magic không khớp hoặc version không hỗ trợ.
 */
int engine_header_decode(const uint8_t *src_buf, engine_header_t *dest);

#endif /* ENGINE_PROTOCOL_H */

