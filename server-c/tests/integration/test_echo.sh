#!/usr/bin/env bash
set -e

PORT=18081
echo "[TEST ECHO] Starting TCP Echo Server on port $PORT..."
./build/tcp_echo_server --port $PORT &
SERVER_PID=$!

cleanup() {
    echo "[TEST ECHO] Cleaning up server (PID $SERVER_PID)..."
    kill -SIGINT $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

sleep 0.5

# Gửi tin nhắn qua netcat hoặc /dev/tcp
MSG="Hello_C_TCP_Echo_Server"
echo "[TEST ECHO] Sending: '$MSG'..."

if command -v nc > /dev/null 2>&1; then
    RESP=$(echo "$MSG" | nc -w 2 127.0.0.1 $PORT)
else
    # Fallback bash /dev/tcp
    exec 3<>/dev/tcp/127.0.0.1/$PORT
    echo "$MSG" >&3
    read -t 2 RESP <&3
    exec 3<&-
    exec 3>&-
fi

echo "[TEST ECHO] Received: '$RESP'"

if [ "$RESP" = "$MSG" ]; then
    echo -e "\033[1;32m[PASS] TCP Echo Server verified successfully!\033[0m"
    exit 0
else
    echo -e "\033[1;31m[FAIL] Response '$RESP' does not match sent '$MSG'\033[0m"
    exit 1
fi
