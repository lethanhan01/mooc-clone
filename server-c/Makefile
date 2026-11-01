CC ?= gcc
BASE_CFLAGS = -Wall -Wextra -Werror -pedantic -std=c11 -D_GNU_SOURCE -Iinclude -fno-omit-frame-pointer -g
SAN_FLAGS ?= -fsanitize=address,undefined
CFLAGS ?= $(BASE_CFLAGS) $(SAN_FLAGS)
LDFLAGS ?= $(SAN_FLAGS) -pthread

VALGRIND_CFLAGS = $(BASE_CFLAGS)
VALGRIND_LDFLAGS = -pthread

BUILD_DIR = build
OBJ_DIR = $(BUILD_DIR)/obj

COMMON_SRCS = src/tcp_socket.c \
              src/engine_protocol.c

TEST_SRCS = tests/test_main.c \
            tests/test_tcp_socket.c \
            tests/test_engine_protocol.c

COMMON_OBJS = $(patsubst src/%.c,$(OBJ_DIR)/src/%.o,$(COMMON_SRCS))
TEST_OBJS = $(patsubst tests/%.c,$(OBJ_DIR)/tests/%.o,$(TEST_SRCS))

TARGET_GATEWAY = $(BUILD_DIR)/c_gateway
TARGET_TESTS = $(BUILD_DIR)/unit_tests
TARGET_TESTS_VALGRIND = $(BUILD_DIR)/unit_tests_valgrind
TARGET_GATEWAY_VALGRIND = $(BUILD_DIR)/c_gateway_valgrind

.PHONY: all build gateway run test lint memcheck clean dirs

all: build

dirs:
	@mkdir -p $(OBJ_DIR)/src $(OBJ_DIR)/tests $(BUILD_DIR)

$(OBJ_DIR)/src/%.o: src/%.c | dirs
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/tests/%.o: tests/%.c | dirs
	$(CC) $(CFLAGS) -c $< -o $@

build: dirs $(TARGET_GATEWAY) $(TARGET_TESTS)

gateway: dirs $(TARGET_GATEWAY)

$(TARGET_GATEWAY): src/c_gateway_main.c $(COMMON_OBJS)
	$(CC) $(CFLAGS) src/c_gateway_main.c $(COMMON_OBJS) -o $@ $(LDFLAGS)

$(TARGET_TESTS): $(TEST_OBJS) $(COMMON_OBJS)
	$(CC) $(CFLAGS) $(TEST_OBJS) $(COMMON_OBJS) -o $@ $(LDFLAGS)

run: $(TARGET_GATEWAY)
	@./$(TARGET_GATEWAY) 9000

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

$(TARGET_GATEWAY_VALGRIND): src/c_gateway_main.c $(COMMON_SRCS) | dirs
	$(CC) $(VALGRIND_CFLAGS) src/c_gateway_main.c $(COMMON_SRCS) -o $@ $(VALGRIND_LDFLAGS)

memcheck: $(TARGET_TESTS_VALGRIND) $(TARGET_GATEWAY_VALGRIND)
	@if command -v valgrind > /dev/null 2>&1; then \
		valgrind --leak-check=full --show-leak-kinds=all --error-exitcode=1 ./$(TARGET_TESTS_VALGRIND); \
	else \
		echo "[NOTICE] Valgrind not installed, relying on AddressSanitizer (already active in binary)"; \
		./$(TARGET_TESTS); \
	fi

clean:
	@rm -rf $(BUILD_DIR)
