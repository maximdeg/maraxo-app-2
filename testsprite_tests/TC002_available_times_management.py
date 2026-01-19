import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3000/api/available-times"
TIMEOUT = 30

def test_available_times_management():
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    # For testing, select a date to query available times:
    # Use tomorrow's date as a sample valid future date with work schedule
    date_obj = datetime.utcnow().date() + timedelta(days=1)
    date_str = date_obj.isoformat()

    url = f"{BASE_URL}/{date_str}"

    try:
        # Make GET request to fetch available time slots for the given date
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
        data = response.json()

        # Validate the response is a list (array) of time slots
        assert isinstance(data, list), "Response should be a list of available time slots"

        # Each time slot should have expected fields, e.g. time string, and be valid time format
        for slot in data:
            assert isinstance(slot, str) or (isinstance(slot, dict) and (
                "time" in slot or "startTime" in slot or "start_time" in slot
            )), "Each time slot should be a string or an object with time properties"
            # Validate time format loosely (HH:MM or ISO datetime)
            time_str = slot if isinstance(slot, str) else (
                slot.get("time") or slot.get("startTime") or slot.get("start_time")
            )
            assert time_str is not None, "Time slot must contain a time string"
            try:
                # Accept formats like 'HH:MM', 'HH:MM:SS' or ISO8601
                datetime.strptime(time_str, '%H:%M')
            except ValueError:
                try:
                    datetime.fromisoformat(time_str)
                except ValueError:
                    assert False, f"Invalid time format in slot: {time_str}"

        # Further logical checks:
        # 1) No time slot should be in the past (for today)
        # 2) No duplicated slots in the list
        unique_slots = set()
        now = datetime.utcnow()
        for slot in data:
            time_str = slot if isinstance(slot, str) else (
                slot.get("time") or slot.get("startTime") or slot.get("start_time")
            )
            # For date today, time slots must be >= now (we tested with tomorrow, so skip this)
            # Verify uniqueness
            assert time_str not in unique_slots, f"Duplicate time slot found: {time_str}"
            unique_slots.add(time_str)

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_available_times_management()
