#include "test_framework.h"
#include "tcp_socket.h"

#include <unistd.h>
#include <fcntl.h>

#define TEST_SERVER_PORT 18080
#define TEST_LISTEN_BACKLOG 10

void test_tcp_server_init_and_close(void) {
    tcp_server_t server;
    int res = tcp_server_init(&server, "127.0.0.1", TEST_SERVER_PORT, TEST_LISTEN_BACKLOG);
    ASSERT_EQ_INT(0, res, "tcp_server_init should succeed on port 18080");
    ASSERT_TRUE(server.listen_socket >= 0, "listen_socket should be non-negative");

    int nb_res = tcp_set_nonblocking(server.listen_socket);
    ASSERT_EQ_INT(0, nb_res, "tcp_set_nonblocking should return 0 on valid socket");
    int flags = fcntl(server.listen_socket, F_GETFL, 0);
    ASSERT_TRUE((flags & O_NONBLOCK) != 0, "O_NONBLOCK flag should be set");

    tcp_server_close(&server);
    ASSERT_EQ_INT(-1, server.listen_socket, "listen_socket should be reset to -1 after close");
}
