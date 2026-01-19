import requests

def test_available_times_api():
    base_url = "http://localhost:3000/api"
    endpoint = f"{base_url}/available-times"
    headers = {
        "Accept": "application/json"
    }
    timeout = 30

    from datetime import datetime, timedelta
    test_date = (datetime.utcnow() + timedelta(days=3)).date().isoformat()

    url = f"{endpoint}/{test_date}"
    try:
        response = requests.get(url, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request to available-times API failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, list), "Response JSON must be a list of time slots"

    import re
    time_slot_pattern = re.compile(r"^([01]\d|2[0-3]):(00|20|40)$")

    for slot in data:
        assert isinstance(slot, str), f"Time slot is not a string: {slot}"
        assert time_slot_pattern.match(slot), f"Time slot '{slot}' does not match 20-minute interval format HH:mm"

    for slot in data:
        hour, minute = map(int, slot.split(":"))
        assert (8 <= hour <= 18), f"Time slot '{slot}' outside expected working hours 08:00-18:00"
        assert minute in (0, 20, 40), f"Time slot '{slot}' minute part is not 00, 20 or 40"

    assert data == sorted(data), "Time slots are not sorted ascending"
    assert len(data) == len(set(data)), "Duplicate time slots found"

test_available_times_api()
