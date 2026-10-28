#!/usr/bin/env bash
set -e

PORT=8089
echo "=========================================================="
echo "    BENCHMARKING C HTTP/REST SERVER CONCURRENCY MODES    "
echo "=========================================================="

test_mode() {
    MODE=$1
    THREADS=$2
    CONCURRENCY=$3
    DURATION=$4

    echo ""
    echo ">>> Testing Mode: $MODE (Threads: $THREADS, Concurrency: $CONCURRENCY) <<<"
    ./build/http_server --port $PORT --mode $MODE --threads $THREADS > /dev/null 2>&1 &
    PID=$!
    sleep 1

    if command -v wrk > /dev/null 2>&1; then
        wrk -t4 -c$CONCURRENCY -d${DURATION}s http://localhost:$PORT/api/v1/health || true
    elif command -v ab > /dev/null 2>&1; then
        ab -n 1000 -c $CONCURRENCY http://localhost:$PORT/api/v1/health || true
    else
        echo "[NOTICE] wrk or ab not found. Running sequential curl test..."
        for i in {1..20}; do
            curl -s http://localhost:$PORT/api/v1/health > /dev/null
        done
        echo "20 requests completed successfully."
    fi

    kill -SIGINT $PID 2>/dev/null || true
    wait $PID 2>/dev/null || true
    sleep 0.5
}

test_mode "sequential" 1 10 3
test_mode "threadpool" 8 50 3
test_mode "reactor" 8 100 3

echo ""
echo "Benchmark completed."
