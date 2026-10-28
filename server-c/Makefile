CC ?= gcc
CFLAGS ?= -Wall -Wextra -pedantic -std=c11 -D_GNU_SOURCE -Iinclude -Ithird_party -fsanitize=address,undefined -fno-omit-frame-pointer -g
LDFLAGS ?= -fsanitize=address,undefined -pthread

BUILD_DIR = build
OBJ_DIR = $(BUILD_DIR)/obj

COMMON_SRCS = src/tcp_socket.c \
              src/http_parser.c \
              src/http_response.c \
              src/http_router.c \
              src/rest_controllers.c \
              src/in_memory_store.c \
              src/thread_pool.c \
              src/reactor.c \
              third_party/cJSON.c

TEST_SRCS = tests/test_main.c \
            tests/test_tcp_socket.c \
            tests/test_http_parser.c \
            tests/test_http_router.c \
            tests/test_in_memory_store.c

COMMON_OBJS = $(patsubst src/%.c,$(OBJ_DIR)/src/%.o,$(filter src/%,$(COMMON_SRCS))) \
              $(patsubst third_party/%.c,$(OBJ_DIR)/third_party/%.o,$(filter third_party/%,$(COMMON_SRCS)))

TEST_OBJS = $(patsubst tests/%.c,$(OBJ_DIR)/tests/%.o,$(TEST_SRCS))

TARGET_SERVER = $(BUILD_DIR)/http_server
TARGET_ECHO = $(BUILD_DIR)/tcp_echo_server
TARGET_TESTS = $(BUILD_DIR)/unit_tests

.PHONY: all build run run-seq run-pool test memcheck clean dirs

all: build

dirs:
	@mkdir -p $(OBJ_DIR)/src $(OBJ_DIR)/third_party $(OBJ_DIR)/tests $(BUILD_DIR)

$(OBJ_DIR)/src/%.o: src/%.c | dirs
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/third_party/%.o: third_party/%.c | dirs
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/tests/%.o: tests/%.c | dirs
	$(CC) $(CFLAGS) -c $< -o $@

build: dirs $(TARGET_SERVER) $(TARGET_ECHO) $(TARGET_TESTS)

$(TARGET_SERVER): src/main.c $(COMMON_OBJS)
	$(CC) $(CFLAGS) src/main.c $(COMMON_OBJS) -o $@ $(LDFLAGS)

$(TARGET_ECHO): src/echo_server.c $(OBJ_DIR)/src/tcp_socket.o
	$(CC) $(CFLAGS) src/echo_server.c $(OBJ_DIR)/src/tcp_socket.o -o $@ $(LDFLAGS)

$(TARGET_TESTS): $(TEST_OBJS) $(COMMON_OBJS)
	$(CC) $(CFLAGS) $(TEST_OBJS) $(COMMON_OBJS) -o $@ $(LDFLAGS)

run: $(TARGET_SERVER)
	@./$(TARGET_SERVER) --port 8080 --mode reactor

run-pool: $(TARGET_SERVER)
	@./$(TARGET_SERVER) --port 8080 --mode threadpool --threads 16

run-seq: $(TARGET_SERVER)
	@./$(TARGET_SERVER) --port 8080 --mode sequential

test: $(TARGET_TESTS)
	@./$(TARGET_TESTS)

memcheck: $(TARGET_TESTS)
	@if command -v valgrind > /dev/null 2>&1; then \
		valgrind --leak-check=full --show-leak-kinds=all --error-exitcode=1 ./$(TARGET_TESTS); \
	else \
		echo "[NOTICE] Valgrind not installed, relying on AddressSanitizer (already active in binary)"; \
		./$(TARGET_TESTS); \
	fi

clean:
	@rm -rf $(BUILD_DIR)
