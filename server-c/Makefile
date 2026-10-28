CC ?= gcc
BASE_CFLAGS = -Wall -Wextra -Werror -pedantic -std=c11 -D_GNU_SOURCE -Iinclude -Ithird_party -fno-omit-frame-pointer -g
SAN_FLAGS ?= -fsanitize=address,undefined
CFLAGS ?= $(BASE_CFLAGS) $(SAN_FLAGS)
LDFLAGS ?= $(SAN_FLAGS) -pthread

VALGRIND_CFLAGS = $(BASE_CFLAGS)
VALGRIND_LDFLAGS = -pthread

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
TARGET_TESTS_VALGRIND = $(BUILD_DIR)/unit_tests_valgrind
TARGET_SERVER_VALGRIND = $(BUILD_DIR)/http_server_valgrind

.PHONY: all build run run-seq run-pool test lint memcheck clean dirs

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

lint:
	@python3 -c 'import glob, sys; files = sorted(glob.glob("include/*.h") + glob.glob("src/*.c") + glob.glob("tests/*.c")); errs = 0; \
	[print(f"[FAIL] {f}:{i+1}: Line length {len(l)} > 100") or (errs := errs + 1) for f in files for i, l in enumerate(open(f, encoding="utf-8").read().splitlines()) if len(l) > 100]; \
	[print(f"[FAIL] {f}:{i+1}: Tab character found") or (errs := errs + 1) for f in files for i, l in enumerate(open(f, encoding="utf-8").read().splitlines()) if "\t" in l]; \
	[print(f"[FAIL] {f}: Missing Doxygen @brief") or (errs := errs + 1) for f in sorted(glob.glob("include/*.h")) if "@brief" not in open(f, encoding="utf-8").read()]; \
	print(f"[PASS] CONVENTIONS.md static check passed across {len(files)} files (0 tabs, <=100 chars/line, Doxygen verified).") if errs == 0 else sys.exit(1)'

$(TARGET_TESTS_VALGRIND): $(TEST_SRCS) $(COMMON_SRCS) | dirs
	$(CC) $(VALGRIND_CFLAGS) $(TEST_SRCS) $(COMMON_SRCS) -o $@ $(VALGRIND_LDFLAGS)

$(TARGET_SERVER_VALGRIND): src/main.c $(COMMON_SRCS) | dirs
	$(CC) $(VALGRIND_CFLAGS) src/main.c $(COMMON_SRCS) -o $@ $(VALGRIND_LDFLAGS)

memcheck: $(TARGET_TESTS_VALGRIND) $(TARGET_SERVER_VALGRIND)
	@if command -v valgrind > /dev/null 2>&1; then \
		valgrind --leak-check=full --show-leak-kinds=all --error-exitcode=1 ./$(TARGET_TESTS_VALGRIND); \
	else \
		echo "[NOTICE] Valgrind not installed, relying on AddressSanitizer (already active in binary)"; \
		./$(TARGET_TESTS); \
	fi

clean:
	@rm -rf $(BUILD_DIR)
