#!/usr/bin/env python3
import sys
import json
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

    print("==========================================================")
    print("  ALL 11 REST API INTEGRATION TESTS PASSED 100%!")
    print("==========================================================")

if __name__ == "__main__":
    main()
