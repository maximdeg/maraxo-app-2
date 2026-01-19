import requests
import uuid

BASE_URL = "http://localhost:3000/api/work-schedule"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}
TIMEOUT = 30

def test_work_schedule_management():
    created_schedule_id = None
    try:
        # Step 1: Create a new work schedule configuration
        create_payload = {
            "doctor_id": str(uuid.uuid4()),
            "work_days": [
                {"day_of_week": "monday", "start_time": "09:00", "end_time": "17:00"},
                {"day_of_week": "tuesday", "start_time": "09:00", "end_time": "17:00"},
                {"day_of_week": "wednesday", "start_time": "09:00", "end_time": "17:00"},
                {"day_of_week": "thursday", "start_time": "09:00", "end_time": "17:00"},
                {"day_of_week": "friday", "start_time": "09:00", "end_time": "17:00"}
            ],
            "consult_types": ["primera_vez", "seguimiento"],
            "visit_types": ["consulta", "practica"]
        }
        create_response = requests.post(
            f"{BASE_URL}",
            json=create_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert create_response.status_code == 201, f"Failed to create work schedule: {create_response.text}"
        created_schedule = create_response.json()
        assert "id" in created_schedule, "Response missing 'id' on creation"
        created_schedule_id = created_schedule["id"]

        # Step 2: Retrieve the created work schedule by ID
        get_response = requests.get(
            f"{BASE_URL}/{created_schedule_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_response.status_code == 200, f"Failed to get work schedule: {get_response.text}"
        retrieved_schedule = get_response.json()
        assert retrieved_schedule["id"] == created_schedule_id, "Retrieved schedule id mismatch"
        assert "work_days" in retrieved_schedule and isinstance(retrieved_schedule["work_days"], list), "work_days missing or invalid"
        assert "consult_types" in retrieved_schedule and isinstance(retrieved_schedule["consult_types"], list), "consult_types missing or invalid"
        assert "visit_types" in retrieved_schedule and isinstance(retrieved_schedule["visit_types"], list), "visit_types missing or invalid"

        # Step 3: Update the work schedule configuration
        update_payload = {
            "work_days": [
                {"day_of_week": "monday", "start_time": "08:00", "end_time": "16:00"},
                {"day_of_week": "tuesday", "start_time": "08:00", "end_time": "16:00"},
                {"day_of_week": "wednesday", "start_time": "08:00", "end_time": "16:00"},
                {"day_of_week": "thursday", "start_time": "08:00", "end_time": "16:00"},
                {"day_of_week": "friday", "start_time": "08:00", "end_time": "16:00"}
            ],
            "consult_types": ["primera_vez"],  # Changed to snake_case to follow create payload keys
            "visit_types": ["consulta"]
        }
        update_response = requests.put(
            f"{BASE_URL}/{created_schedule_id}",
            json=update_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert update_response.status_code == 200, f"Failed to update work schedule: {update_response.text}"
        updated_schedule = update_response.json()
        assert updated_schedule["id"] == created_schedule_id, "Updated schedule id mismatch"
        assert updated_schedule.get("work_days")[0]["start_time"] == "08:00", "Update did not change work_days correctly"
        assert "primera_vez" in updated_schedule.get("consult_types", []), "Update did not change consult_types correctly"
        assert "consulta" in updated_schedule.get("visit_types", []), "Update did not change visit_types correctly"

        # Step 4: Verify the updated configuration by getting again
        get_response_2 = requests.get(
            f"{BASE_URL}/{created_schedule_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_response_2.status_code == 200, f"Failed to get updated work schedule: {get_response_2.text}"
        retrieved_schedule_2 = get_response_2.json()
        assert retrieved_schedule_2["id"] == created_schedule_id, "Retrieved schedule id mismatch after update"
        assert retrieved_schedule_2["work_days"][0]["start_time"] == "08:00", "work_days start_time not updated on retrieval"
        # Also check that response arrays for visit_types and consult_types are present and lists
        assert isinstance(retrieved_schedule_2.get("visit_types"), list), "visit_types missing or not list after update"
        assert isinstance(retrieved_schedule_2.get("consult_types"), list), "consult_types missing or not list after update"

    finally:
        # Clean up by deleting the created work schedule
        if created_schedule_id:
            delete_response = requests.delete(
                f"{BASE_URL}/{created_schedule_id}",
                headers=HEADERS,
                timeout=TIMEOUT
            )
            assert delete_response.status_code in (200, 204), f"Failed to delete work schedule: {delete_response.text}"

test_work_schedule_management()
