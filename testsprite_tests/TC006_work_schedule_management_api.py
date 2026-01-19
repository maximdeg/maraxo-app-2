import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("maxim.degtiarev.dev@gmail.com", "admin1234")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_work_schedule_management_api():
    schedule_id = None
    try:
        # 1. Create a new work schedule (POST)
        create_payload = {
            "doctorId": "doctor-001",
            "weekdays": [
                {"day": "lunes", "startTime": "09:00", "endTime": "17:00"},
                {"day": "martes", "startTime": "09:00", "endTime": "17:00"},
                {"day": "miércoles", "startTime": "09:00", "endTime": "17:00"},
                {"day": "jueves", "startTime": "09:00", "endTime": "17:00"},
                {"day": "viernes", "startTime": "09:00", "endTime": "17:00"}
            ],
            "unavailableDates": [],
            "unavailableTimes": []
        }
        create_resp = requests.post(
            f"{BASE_URL}/work-schedule",
            json=create_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Expected 201 Created, got {create_resp.status_code}"
        created_data = create_resp.json()
        assert "id" in created_data, "Response missing schedule id"
        schedule_id = created_data["id"]

        # 2. Retrieve the created schedule (GET)
        get_resp = requests.get(
            f"{BASE_URL}/work-schedule/{schedule_id}",
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"Expected 200 OK on retrieval, got {get_resp.status_code}"
        get_data = get_resp.json()
        assert get_data["doctorId"] == create_payload["doctorId"], "Doctor ID mismatch in retrieved schedule"
        assert isinstance(get_data["weekdays"], list) and len(get_data["weekdays"]) == 5, "Weekdays data mismatch"

        # 3. Update the work schedule (PUT)
        update_payload = {
            "weekdays": [
                {"day": "lunes", "startTime": "10:00", "endTime": "16:00"},
                {"day": "martes", "startTime": "10:00", "endTime": "16:00"},
                {"day": "miércoles", "startTime": "10:00", "endTime": "16:00"},
                {"day": "jueves", "startTime": "10:00", "endTime": "16:00"},
                {"day": "viernes", "startTime": "10:00", "endTime": "16:00"}
            ],
            "unavailableDates": ["2026-01-20"],
            "unavailableTimes": [
                {"date": "2026-01-21", "startTime": "12:00", "endTime": "13:00"}
            ]
        }
        update_resp = requests.put(
            f"{BASE_URL}/work-schedule/{schedule_id}",
            json=update_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert update_resp.status_code in (200,204), f"Expected 200 OK or 204 No Content on update, got {update_resp.status_code}"

        # 4. Retrieve the updated schedule to verify changes
        get_updated_resp = requests.get(
            f"{BASE_URL}/work-schedule/{schedule_id}",
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_updated_resp.status_code == 200, f"Expected 200 OK on retrieval, got {get_updated_resp.status_code}"
        updated_data = get_updated_resp.json()
        assert updated_data["weekdays"][0]["startTime"] == "10:00", "Update of startTime failed"
        assert "2026-01-20" in updated_data.get("unavailableDates", []), "Unavailable date not updated"
        assert any(t.get("startTime") == "12:00" for t in updated_data.get("unavailableTimes", [])), "Unavailable time not updated"

        # 5. Access control test - unauthorized access
        unauthorized_resp = requests.get(
            f"{BASE_URL}/work-schedule/{schedule_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        # Expect unauthorized (401 or 403)
        assert unauthorized_resp.status_code in (401, 403), f"Expected 401/403 for unauthorized access, got {unauthorized_resp.status_code}"

    finally:
        # Cleanup: delete the created work schedule if created
        if schedule_id:
            delete_resp = requests.delete(
                f"{BASE_URL}/work-schedule/{schedule_id}",
                auth=AUTH,
                headers=HEADERS,
                timeout=TIMEOUT
            )
            # Accept 200 OK, 204 No Content or 404 Not Found if already deleted
            assert delete_resp.status_code in (200, 204, 404), f"Unexpected status code on cleanup delete: {delete_resp.status_code}"

test_work_schedule_management_api()
