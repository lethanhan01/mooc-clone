#include "test_framework.h"
#include "tcp_socket.h"

#include <unistd.h>
#include <fcntl.h>

void test_tcp_server_init_and_close(void) {
    tcp_server_t server;
    int res = tcp_server_init(&server, "127.0.0.1", 18080, 10);
    ASSERT_EQ_INT(0, res, "tcp_server_init should succeed on port 18080");
    ASSERT_TRUE(server.server_fd >= 0, "server_fd should be non-negative");

    // Test non-blocking setup
    int nb_res = tcp_set_nonblocking(server.server_fd);
    ASSERT_EQ_INT(0, nb_res, "tcp_set_nonblocking should return 0 on valid fd");
    int flags = fcntl(server.server_fd, F_GETFL, 0);
    ASSERT_TRUE((flags & O_NONBLOCK) != 0, "O_NONBLOCK flag should be set");

    tcp_server_close(&server);
    ASSERT_EQ_INT(-1, server.server_fd, "server_fd should be reset to -1 after close");
}
