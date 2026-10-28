#!/usr/bin/env python3
import sys
import time
import json
import socket
import urllib.parse
import urllib.request
import urllib.error

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"

def request(method, path, data=None, headers=None):
    if headers is None:
        headers = {}
    url = f"{BASE_URL}{path}"
    payload = json.dumps(data).encode("utf-8") if data is not None else None
    if payload and "Content-Type" not in headers:
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            resp_body = resp.read().decode("utf-8")
            parsed_json = json.loads(resp_body) if resp_body and "application/json" in resp.headers.get("Content-Type", "") else resp_body
            return resp.status, parsed_json, dict(resp.headers)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        parsed = json.loads(body) if body and "application/json" in e.headers.get("Content-Type", "") else body
        return e.code, parsed, dict(e.headers)

def main():
    print("==========================================================")
    print(f"  RUNNING REST API INTEGRATION SUITE on {BASE_URL}")
    print("==========================================================")

    # 1. Test Health
    status, body, headers = request("GET", "/api/v1/health")
    assert status == 200, f"Expected 200, got {status}"
    assert body.get("status") == "UP", f"Expected status UP, got {body}"
    print("[PASS] 1. GET /api/v1/health")

    # 2. Test CORS OPTIONS
    status, _, headers = request("OPTIONS", "/api/v1/exams")
    assert status == 204, f"Expected 204, got {status}"
    assert "access-control-allow-origin" in [k.lower() for k in headers.keys()], "Missing CORS allow origin"
    print("[PASS] 2. OPTIONS /api/v1/exams (CORS preflight)")

    # 3. Test GET all exams
    status, exams, _ = request("GET", "/api/v1/exams")
    assert status == 200, f"Expected 200, got {status}"
    assert isinstance(exams, list) and len(exams) >= 1, "Exams should be a list with items"
    print(f"[PASS] 3. GET /api/v1/exams (Count: {len(exams)})")

    # 4. Test POST create exam
    create_payload = {
        "title": "Kiến trúc Mạng Máy tính",
        "description": "Bài thi trắc nghiệm Socket & Reactor",
        "duration_minutes": 75
    }
    status, created, _ = request("POST", "/api/v1/exams", data=create_payload)
    assert status == 201, f"Expected 201, got {status}: {created}"
    exam_id = created.get("id")
    assert exam_id, "Response must contain 'id'"
    print(f"[PASS] 4. POST /api/v1/exams (Created ID: {exam_id})")

    # 5. Test GET exam by ID
    status, exam_detail, _ = request("GET", f"/api/v1/exams/{exam_id}")
    assert status == 200, f"Expected 200, got {status}"
    assert exam_detail.get("title") == create_payload["title"], "Title mismatch"
    print(f"[PASS] 5. GET /api/v1/exams/{exam_id}")

    # 6. Test PUT update exam
    update_payload = {
        "title": "Kiến trúc Mạng Máy tính (Cập nhật)",
        "duration_minutes": 90
    }
    status, update_res, _ = request("PUT", f"/api/v1/exams/{exam_id}", data=update_payload)
    assert status == 200, f"Expected 200, got {status}"
    print(f"[PASS] 6. PUT /api/v1/exams/{exam_id}")

    # 7. Test POST question to exam
    q_payload = {
        "content": "Giao thức nào nằm ở Tầng Ứng dụng trong mô hình TCP/IP?",
        "options": ["HTTP", "TCP", "IP", "Ethernet"],
        "correct_option": 0
    }
    status, created_q, _ = request("POST", f"/api/v1/exams/{exam_id}/questions", data=q_payload)
    assert status == 201, f"Expected 201, got {status}"
    q_id = created_q.get("id")
    assert q_id, "Question must have id"
    print(f"[PASS] 7. POST /api/v1/exams/{exam_id}/questions (QID: {q_id})")

    # 8. Test GET questions
    status, questions, _ = request("GET", f"/api/v1/exams/{exam_id}/questions")
    assert status == 200, f"Expected 200, got {status}"
    assert any(q["id"] == q_id for q in questions), "Created question not found in exam list"
    print(f"[PASS] 8. GET /api/v1/exams/{exam_id}/questions")

    # 9. Test DELETE exam
    status, del_res, _ = request("DELETE", f"/api/v1/exams/{exam_id}")
    assert status == 200, f"Expected 200, got {status}"
    print(f"[PASS] 9. DELETE /api/v1/exams/{exam_id}")

    # 10. Verify 404 after delete
    status, _, _ = request("GET", f"/api/v1/exams/{exam_id}")
    assert status == 404, f"Expected 404 after deletion, got {status}"
    print(f"[PASS] 10. Verify GET /api/v1/exams/{exam_id} returns 404")

    # 11. Test 400 Bad Request on invalid JSON
    req = urllib.request.Request(f"{BASE_URL}/api/v1/exams", data=b"{malformed_json", headers={"Content-Type": "application/json"}, method="POST")
    try:
        urllib.request.urlopen(req, timeout=5)
        assert False, "Should have thrown HTTPError"
    except urllib.error.HTTPError as e:
        assert e.code == 400, f"Expected 400 Bad Request, got {e.code}"
    print("[PASS] 11. Verify 400 Bad Request on malformed JSON payload")

    # 12. Test Sticky / Pipelined HTTP Requests over single TCP connection
    parsed_url = urllib.parse.urlparse(BASE_URL)
    host = parsed_url.hostname or "localhost"
    port = parsed_url.port or 8080
    with socket.create_connection((host, port), timeout=5) as sock:
        pipelined = (
            b"GET /api/v1/health HTTP/1.1\r\nHost: localhost\r\n\r\n"
            b"GET /api/v1/exams HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n"
        )
        sock.sendall(pipelined)
        chunks = []
        while True:
            data = sock.recv(4096)
            if not data:
                break
            chunks.append(data)
        raw_resp = b"".join(chunks).decode("utf-8", errors="replace")
        assert raw_resp.count("HTTP/1.1 200 OK") == 2, f"Expected 2 pipelined 200 OK responses, got:\n{raw_resp}"
    print("[PASS] 12. Verify Sticky / Pipelined HTTP Requests drained sequentially")

    # 13. Test Malformed HTTP Request returns 400 Bad Request
    with socket.create_connection((host, port), timeout=5) as sock:
        sock.sendall(b"INVALID_METHOD /api/v1/health HTTP/1.1\r\nHost: localhost\r\n\r\n")
        raw_err = sock.recv(4096).decode("utf-8", errors="replace")
        assert "HTTP/1.1 400 Bad Request" in raw_err, f"Expected 400 Bad Request, got:\n{raw_err}"
    print("[PASS] 13. Verify Malformed HTTP syntax returns HTTP/1.1 400 Bad Request")

    # 14. Test Stateless REST Exam Room Creation & Short Polling State (WAITING -> RUNNING)
    room_code = "POLL2026"
    status, created_room, _ = request("POST", "/api/v1/rooms", data={
        "room_code": room_code,
        "name": "Phòng Thi Short Polling C11",
        "exam_id": "exam-1",
        "duration_seconds": 1
    })
    assert status == 201, f"Expected 201, got {status}: {created_room}"
    assert created_room.get("status") == "WAITING", f"Expected WAITING, got {created_room}"
    assert created_room.get("server_now_ms", 0) > 0, "Expected authoritative server_now_ms > 0"
    print(f"[PASS] 14. POST /api/v1/rooms (Created room {room_code} with server_now_ms={created_room['server_now_ms']})")

    # 15. Join Room & Start Room, then Short Poll state
    status, joined_room, _ = request("POST", f"/api/v1/rooms/{room_code}/join", data={"username": "sv_an"})
    assert status == 200 and joined_room.get("participant_count") == 1, f"Join failed: {joined_room}"
    status, started_room, _ = request("POST", f"/api/v1/rooms/{room_code}/start")
    assert status == 200 and started_room.get("status") == "RUNNING", f"Start failed: {started_room}"
    assert started_room.get("ends_at_ms") == started_room.get("started_at_ms") + 1000, "ends_at_ms must equal started_at_ms + 1000ms"
    status, polled_state, _ = request("GET", f"/api/v1/rooms/{room_code}/state")
    assert status == 200 and polled_state.get("status") == "RUNNING", f"Expected RUNNING on poll, got {polled_state}"
    print(f"[PASS] 15. Short Poll GET /api/v1/rooms/{room_code}/state (status=RUNNING, ends_at_ms={polled_state['ends_at_ms']})")

    # 16. Wait for 1.2s and verify Lazy State Transition (RUNNING -> ENDED without background timer thread)
    time.sleep(1.2)
    status, expired_state, _ = request("GET", f"/api/v1/rooms/{room_code}/state")
    assert status == 200 and expired_state.get("status") == "ENDED", f"Expected Lazy Expiration to ENDED, got {expired_state}"
    assert expired_state.get("remaining_seconds") == 0, f"Expected remaining_seconds=0, got {expired_state}"
    print(f"[PASS] 16. Verify Stateless Lazy Expiration (RUNNING -> ENDED) on GET /api/v1/rooms/{room_code}/state")

    print("==========================================================")
    print("  ALL 16 REST API & SHORT POLLING TESTS PASSED!          ")
    print("==========================================================")

if __name__ == "__main__":
    main()
