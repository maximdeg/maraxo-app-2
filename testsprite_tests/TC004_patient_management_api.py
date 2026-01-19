import requests

BASE_URL = "http://localhost:3000/api"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

TIMEOUT = 30


def test_patient_management_api():
    patient_url = f"{BASE_URL}/patients"

    # Sample valid patient data
    valid_patient = {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+12025550123"
    }

    # Sample invalid phone format patient data (invalid format)
    invalid_phone_patient = {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        "phone": "invalid-phone"
    }

    # Sample data missing required fields (missing email)
    missing_field_patient = {
        "firstName": "Alice",
        "lastName": "Brown",
        "phone": "+12025550123"
    }

    patient_id = None

    try:
        # CREATE patient with valid data
        create_resp = requests.post(
            patient_url,
            headers=HEADERS,
            json=valid_patient,
            timeout=TIMEOUT,
        )
        assert create_resp.status_code == 201, f"Expected 201 created, got {create_resp.status_code}"
        created_patient = create_resp.json()
        assert "id" in created_patient, "Patient ID not returned on creation"
        patient_id = created_patient["id"]

        # READ - Get the created patient by ID
        get_resp = requests.get(
            f"{patient_url}/{patient_id}",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert get_resp.status_code == 200, f"Expected 200 OK, got {get_resp.status_code}"
        fetched_patient = get_resp.json()
        assert fetched_patient["id"] == patient_id, "Fetched patient ID mismatch"
        assert fetched_patient["phone"] == valid_patient["phone"], "Phone number mismatch on fetch"

        # UPDATE patient - change phone number to a new valid format
        updated_data = {"phone": "+13105550199"}
        update_resp = requests.put(
            f"{patient_url}/{patient_id}",
            headers=HEADERS,
            json=updated_data,
            timeout=TIMEOUT,
        )
        assert update_resp.status_code == 200, f"Expected 200 OK on update, got {update_resp.status_code}"
        updated_patient = update_resp.json()
        assert updated_patient["phone"] == updated_data["phone"], "Phone number update failed"

        # VALIDATION TESTS

        # Attempt to create patient with invalid phone format
        invalid_phone_resp = requests.post(
            patient_url,
            headers=HEADERS,
            json=invalid_phone_patient,
            timeout=TIMEOUT,
        )
        assert invalid_phone_resp.status_code == 400, "Expected 400 Bad Request for invalid phone format"
        invalid_phone_json = invalid_phone_resp.json()
        assert "phone" in str(invalid_phone_json).lower(), "Response should indicate phone number validation error"

        # Attempt to create patient missing required fields
        missing_field_resp = requests.post(
            patient_url,
            headers=HEADERS,
            json=missing_field_patient,
            timeout=TIMEOUT,
        )
        assert missing_field_resp.status_code == 400, "Expected 400 Bad Request for missing required fields"
        missing_field_json = missing_field_resp.json()
        # Check error message references missing required field(s)
        missing_fields_lower = str(missing_field_json).lower()
        assert (
            "email" in missing_fields_lower or "required" in missing_fields_lower
        ), "Response should indicate missing required fields"

    finally:
        # DELETE patient resource if created
        if patient_id:
            delete_resp = requests.delete(
                f"{patient_url}/{patient_id}",
                headers=HEADERS,
                timeout=TIMEOUT,
            )
            assert delete_resp.status_code in (200, 204), f"Expected 200 or 204 on delete, got {delete_resp.status_code}"


test_patient_management_api()
