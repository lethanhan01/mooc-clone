#include "engine_protocol.h"
#include <string.h>
#include <arpa/inet.h>

void engine_header_encode(const engine_header_t *src, uint8_t *dest_buf) {
    if (!src || !dest_buf) {
        return;
    }

    uint16_t magic_net = htons(src->magic);
    uint32_t seq_net = htonl(src->seq_id);
    uint32_t client_net = htonl(src->client_id);
    uint32_t len_net = htonl(src->payload_len);

    memcpy(dest_buf + 0, &magic_net, sizeof(uint16_t));
    dest_buf[2] = src->version;
    dest_buf[3] = src->msg_type;
    memcpy(dest_buf + 4, &seq_net, sizeof(uint32_t));
    memcpy(dest_buf + 8, &client_net, sizeof(uint32_t));
    memcpy(dest_buf + 12, &len_net, sizeof(uint32_t));
}

int engine_header_decode(const uint8_t *src_buf, engine_header_t *dest) {
    if (!src_buf || !dest) {
        return -1;
    }

    uint16_t magic_net;
    uint32_t seq_net;
    uint32_t client_net;
    uint32_t len_net;

    memcpy(&magic_net, src_buf + 0, sizeof(uint16_t));
    dest->magic = ntohs(magic_net);
    dest->version = src_buf[2];
    dest->msg_type = src_buf[3];

    memcpy(&seq_net, src_buf + 4, sizeof(uint32_t));
    dest->seq_id = ntohl(seq_net);

    memcpy(&client_net, src_buf + 8, sizeof(uint32_t));
    dest->client_id = ntohl(client_net);

    memcpy(&len_net, src_buf + 12, sizeof(uint32_t));
    dest->payload_len = ntohl(len_net);

    if (dest->magic != ENGINE_MAGIC) {
        return -1;
    }

    if (dest->version != ENGINE_VERSION) {
        return -1;
    }

    return 0;
}

