import requests
from requests.auth import HTTPBasicAuth
import datetime

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("maxim.degtiarev.dev@gmail.com", "admin1234")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_unavailable_days_and_times_management():
    # Setup: define test unavailable day and time
    unavailable_date = (datetime.date.today() + datetime.timedelta(days=10)).isoformat()  # 10 days from today
    unavailable_time_start = "14:00"
    unavailable_time_end = "15:00"
    
    # Create unavailable day (POST /unavailable-days)
    unavailable_day_payload = {"unavailable_date": unavailable_date, "reason": "Test unavailable day"}
    resp_day = requests.post(f"{BASE_URL}/unavailable-days", auth=AUTH, headers=HEADERS, json=unavailable_day_payload, timeout=TIMEOUT)
    assert resp_day.status_code == 201, f"Failed to create unavailable day: {resp_day.text}"
    created_unavailable_day = resp_day.json()
    assert "unavailable_date" in created_unavailable_day and created_unavailable_day["unavailable_date"] == unavailable_date
    
    # Create unavailable time slot (POST /unavailable-times)
    unavailable_time_payload = {
        "unavailable_date": unavailable_date,
        "timeRange": {"start": unavailable_time_start, "end": unavailable_time_end},
        "reason": "Test unavailable time slot"
    }
    resp_time = requests.post(f"{BASE_URL}/unavailable-times", auth=AUTH, headers=HEADERS, json=unavailable_time_payload, timeout=TIMEOUT)
    assert resp_time.status_code == 201, f"Failed to create unavailable time slot: {resp_time.text}"
    created_unavailable_time = resp_time.json()
    assert created_unavailable_time.get("unavailable_date") == unavailable_date
    assert "timeRange" in created_unavailable_time
    assert created_unavailable_time["timeRange"]["start"] == unavailable_time_start
    assert created_unavailable_time["timeRange"]["end"] == unavailable_time_end

    try:
        # Verify unavailable day is listed (GET /unavailable-days/[date])
        resp_check_day = requests.get(f"{BASE_URL}/unavailable-days/{unavailable_date}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert resp_check_day.status_code == 200, f"Unavailable day not found: {resp_check_day.text}"
        day_data = resp_check_day.json()
        assert day_data.get("unavailable_date") == unavailable_date

        # Verify unavailable time is listed (GET /unavailable-times/[date])
        resp_check_time = requests.get(f"{BASE_URL}/unavailable-times/{unavailable_date}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert resp_check_time.status_code == 200, f"Unavailable time not found: {resp_check_time.text}"
        times_data = resp_check_time.json()
        assert isinstance(times_data, list), "Unavailable times response should be a list"
        # Check that the created unavailable time slot is in the list
        matched = any(
            t.get("timeRange", {}).get("start") == unavailable_time_start and
            t.get("timeRange", {}).get("end") == unavailable_time_end
            for t in times_data
        )
        assert matched, "Created unavailable time slot not found in the list"

        # Check that unavailable day and time exclude these from available times
        resp_available = requests.get(f"{BASE_URL}/available-times/{unavailable_date}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert resp_available.status_code == 200, f"Failed to get available times: {resp_available.text}"
        available_times = resp_available.json()
        # available_times expected to be list of time slots (strings or dicts)
        for slot in available_times:
            if isinstance(slot, dict) and "time" in slot:
                time_str = slot["time"]
            elif isinstance(slot, str):
                time_str = slot
            else:
                continue
            # Assert that no slot is in the unavailable time range
            slot_time = datetime.datetime.strptime(time_str, "%H:%M").time()
            start_time = datetime.datetime.strptime(unavailable_time_start, "%H:%M").time()
            end_time = datetime.datetime.strptime(unavailable_time_end, "%H:%M").time()
            assert not (start_time <= slot_time < end_time), f"Unavailable time slot {time_str} found in available times"

        # Also, if unavailable day is marked, the available times list should be empty or absent (depending on implementation)
        # If available_times is empty list, accept, else accept no slots on that day except possibly empty list
        assert isinstance(available_times, list), "Available times response should be a list"
        assert len(available_times) == 0, "Available times should be empty for an unavailable day"

    finally:
        # Cleanup: delete created unavailable time slot(s)
        # Attempt delete unavailable time slots for the date
        resp_times_all = requests.get(f"{BASE_URL}/unavailable-times/{unavailable_date}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        if resp_times_all.status_code == 200:
            times_list = resp_times_all.json()
            for tslot in times_list:
                tslot_id = tslot.get("id")
                if not tslot_id:
                    continue
                del_resp = requests.delete(f"{BASE_URL}/unavailable-times/{tslot_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
                assert del_resp.status_code in (200, 204, 404)

        # Delete unavailable day
        del_day_resp = requests.delete(f"{BASE_URL}/unavailable-days/{unavailable_date}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert del_day_resp.status_code in (200, 204, 404)

test_unavailable_days_and_times_management()
