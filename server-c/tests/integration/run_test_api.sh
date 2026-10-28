#!/usr/bin/env bash
set -e

MODE=${1:-reactor}
PORT=${2:-18082}
echo "[INTEGRATION] Starting C Server in mode '$MODE' on port $PORT..."
./build/http_server --port $PORT --mode $MODE --threads 8 &
SERVER_PID=$!

cleanup() {
    echo "[INTEGRATION] Stopping server (PID $SERVER_PID)..."
    kill -SIGINT $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

sleep 1

echo "[INTEGRATION] Executing test_rest_api.py..."
python3 tests/integration/test_rest_api.py http://localhost:$PORT

echo -e "\033[1;32m[INTEGRATION] All tests completed successfully!\033[0m"
