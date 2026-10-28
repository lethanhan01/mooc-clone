cmake_minimum_required(VERSION 3.16)
project(mooc_c_http_server C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

include_directories(include third_party)

add_definitions(-D_GNU_SOURCE)
add_compile_options(-Wall -Wextra -Werror -pedantic -g)

option(ENABLE_ASAN "Enable AddressSanitizer" ON)
if(ENABLE_ASAN)
    add_compile_options(-fsanitize=address -fsanitize=undefined -fno-omit-frame-pointer)
    add_link_options(-fsanitize=address -fsanitize=undefined)
endif()

set(COMMON_SOURCES
    src/tcp_socket.c
    src/http_parser.c
    src/http_response.c
    src/http_router.c
    src/rest_controllers.c
    src/in_memory_store.c
    src/thread_pool.c
    src/reactor.c
    third_party/cJSON.c
)

# Server executable
add_executable(http_server src/main.c ${COMMON_SOURCES})
target_link_libraries(http_server pthread)

# TCP Echo Server executable (Phase 1)
add_executable(tcp_echo_server src/echo_server.c src/tcp_socket.c)
target_link_libraries(tcp_echo_server pthread)

# Unit Tests executable
enable_testing()
add_executable(unit_tests
    tests/test_main.c
    tests/test_tcp_socket.c
    tests/test_http_parser.c
    tests/test_http_router.c
    tests/test_in_memory_store.c
    ${COMMON_SOURCES}
)
target_link_libraries(unit_tests pthread)
add_test(NAME AllUnitTests COMMAND unit_tests)
