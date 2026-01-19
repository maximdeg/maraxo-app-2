import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("maxim.degtiarev.dev@gmail.com", "admin1234")
TIMEOUT = 30

def test_patient_management_crud_operations():
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Patient data for creation
    patient_data = {
        "firstName": "Test",
        "lastName": "Patient",
        "phoneNumber": "5551234567",
        "email": "test.patient@example.com",
        "birthDate": "1980-05-15",
        "address": "123 Main Street",
        "notes": "Initial test patient"
    }

    created_patient_id = None

    try:
        # 1. CREATE patient
        response = requests.post(
            f"{BASE_URL}/patients",
            json=patient_data,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert response.status_code in (200, 201), f"Expected 200 or 201 Created, got {response.status_code}"
        created_patient = response.json()
        created_patient_id = created_patient.get("id") or created_patient.get("patientId") or created_patient.get("_id")
        assert created_patient_id is not None, "Created patient ID not returned"

        # Validate returned fields are at root level (not nested)
        for field in ['firstName', 'lastName', 'phoneNumber', 'email', 'birthDate']:
            assert field in created_patient, f"Field {field} missing in created patient response"

        # 2. READ patient by ID
        response = requests.get(
            f"{BASE_URL}/patients/{created_patient_id}",
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200 OK on read, got {response.status_code}"
        fetched_patient = response.json()
        assert fetched_patient.get("id") == created_patient_id or fetched_patient.get("patientId") == created_patient_id, "Patient ID mismatch on read"
        for field in ['firstName', 'lastName', 'phoneNumber', 'email', 'birthDate']:
            assert field in fetched_patient, f"Field {field} missing in fetched patient"
        assert fetched_patient["phoneNumber"] == patient_data["phoneNumber"], "Phone number mismatch"

        # 3. UPDATE patient
        updated_data = {
            "phoneNumber": "5557654321",
            "notes": "Updated note for testing"
        }
        response = requests.put(
            f"{BASE_URL}/patients/{created_patient_id}",
            json=updated_data,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200 OK on update, got {response.status_code}"
        updated_patient = response.json()
        assert updated_patient["phoneNumber"] == updated_data["phoneNumber"], "Phone number not updated"
        assert updated_patient.get("notes") == updated_data["notes"], "Notes not updated"

        # 4. Validate phone number uniqueness - try to create another patient with same phone number should fail
        duplicate_patient_data = {
            "firstName": "Duplicate",
            "lastName": "User",
            "phoneNumber": updated_data["phoneNumber"],  # Same phone number as existing patient
            "email": "duplicate@example.com",
            "birthDate": "1990-01-01"
        }
        response = requests.post(
            f"{BASE_URL}/patients",
            json=duplicate_patient_data,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert response.status_code in (400, 409), f"Expected 400 or 409 on duplicate phone number, got {response.status_code}"
        error_response = response.json()
        assert "phone" in str(error_response).lower() or "unique" in str(error_response).lower(), "Expected phone uniqueness error message"

        # 5. Validate data validation for required fields - try creating patient without required field firstName
        invalid_patient_data = {
            "lastName": "NoFirstName",
            "phoneNumber": "5559999999",
            "email": "nofirst@example.com",
            "birthDate": "1985-07-20"
        }
        response = requests.post(
            f"{BASE_URL}/patients",
            json=invalid_patient_data,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert response.status_code == 400, f"Expected 400 Bad Request on missing required field, got {response.status_code}"
        validation_error = response.json()
        error_messages = str(validation_error).lower()
        assert ("firstName" in error_messages or "firstname" in error_messages or "required" in error_messages), "Expected error about missing firstName field"

    finally:
        # CLEANUP - DELETE the created patient if exists
        if created_patient_id:
            try:
                del_response = requests.delete(
                    f"{BASE_URL}/patients/{created_patient_id}",
                    headers=headers,
                    auth=AUTH,
                    timeout=TIMEOUT
                )
                assert del_response.status_code in (200, 204), f"Expected 200 or 204 on delete, got {del_response.status_code}"
            except Exception:
                pass


test_patient_management_crud_operations()
