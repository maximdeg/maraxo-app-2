import requests
from requests.auth import HTTPBasicAuth
import datetime
import json

BASE_URL = "http://localhost:3000/api"
USERNAME = "maxim.degtiarev.dev@gmail.com"
PASSWORD = "admin1234"
TIMEOUT = 30

auth = HTTPBasicAuth(USERNAME, PASSWORD)
headers = {"Content-Type": "application/json"}

def test_unavailable_days_management_api():
    # Prepare a test date for marking as unavailable
    test_date = (datetime.date.today() + datetime.timedelta(days=10)).isoformat()
    unavailable_payload = {
        "unavailableDate": test_date,
        "reason": "holiday",
        "description": "Test holiday marking"
    }

    created = False
    try:
        # 1) Create a new unavailable day (POST /unavailable-days)
        create_resp = requests.post(
            f"{BASE_URL}/unavailable-days",
            headers=headers,
            auth=auth,
            data=json.dumps(unavailable_payload),
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Failed to create unavailable day: {create_resp.text}"
        created = True
        create_data = create_resp.json()
        # Validate response contains the date and reason stored correctly
        assert create_data.get("unavailableDate") == test_date, "Stored date does not match"
        assert create_data.get("reason") == "holiday", "Stored reason does not match"

        # 2) Retrieve unavailable day by date (GET /unavailable-days/[date])
        get_resp = requests.get(
            f"{BASE_URL}/unavailable-days/{test_date}",
            headers=headers,
            auth=auth,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"Failed to get unavailable day: {get_resp.text}"
        get_data = get_resp.json()
        assert get_data.get("unavailableDate") == test_date, "Retrieved date does not match"
        assert get_data.get("reason") == "holiday", "Retrieved reason does not match"

        # 3) Verify unavailable day affects available appointment slots
        # Check available times on the unavailable day (GET /available-times/[date])
        available_times_resp = requests.get(
            f"{BASE_URL}/available-times/{test_date}",
            headers=headers,
            auth=auth,
            timeout=TIMEOUT
        )
        # Expecting no available slots on an unavailable day (holiday)
        # The API may return 200 with empty list or specific indication
        assert available_times_resp.status_code == 200, f"Failed to get available times: {available_times_resp.text}"
        times_data = available_times_resp.json()

        # times_data is expected to be empty or no available slots
        if isinstance(times_data, list):
            assert len(times_data) == 0, "Available times should be empty on unavailable day"
        elif isinstance(times_data, dict) and "availableTimes" in times_data:
            assert len(times_data["availableTimes"]) == 0, "Available times should be empty on unavailable day"
        else:
            assert False, "Unexpected available times response format"

    finally:
        if created:
            # Clean up: delete the created unavailable day (DELETE /unavailable-days/[date])
            delete_resp = requests.delete(
                f"{BASE_URL}/unavailable-days/{test_date}",
                headers=headers,
                auth=auth,
                timeout=TIMEOUT
            )
            # Accept 204 No Content or 200 OK on delete
            assert delete_resp.status_code in [200, 204], f"Failed to delete unavailable day: {delete_resp.text}"


test_unavailable_days_management_api()
