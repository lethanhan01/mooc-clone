cmake_minimum_required(VERSION 3.16)
project(mooc_c_communication_engine C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

include_directories(include)

add_definitions(-D_GNU_SOURCE)
add_compile_options(-Wall -Wextra -Werror -pedantic -g)

option(ENABLE_ASAN "Enable AddressSanitizer" ON)
if(ENABLE_ASAN)
    add_compile_options(-fsanitize=address -fsanitize=undefined -fno-omit-frame-pointer)
    add_link_options(-fsanitize=address -fsanitize=undefined)
endif()

set(COMMON_SOURCES
    src/tcp_socket.c
    src/engine_protocol.c
)

# C Communication Engine TCP Gateway executable
add_executable(c_gateway src/c_gateway_main.c ${COMMON_SOURCES})
target_link_libraries(c_gateway pthread)

# Unit Tests executable
enable_testing()
add_executable(unit_tests
    tests/test_main.c
    tests/test_tcp_socket.c
    tests/test_engine_protocol.c
    ${COMMON_SOURCES}
)
target_link_libraries(unit_tests pthread)
add_test(NAME AllUnitTests COMMAND unit_tests)
