import requests
from datetime import datetime, timedelta
import uuid

BASE_URL = "http://localhost:3000/api"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_appointment_cancellation_api():
    appointment_id = None
    cancellation_token = None

    try:
        # Step 1: Create a new appointment with a date/time more than 24 hours in the future (valid cancellation window)
        future_datetime = (datetime.utcnow() + timedelta(days=2)).replace(microsecond=0).isoformat() + "Z"
        patient_data = {
            "first_name": "Test",
            "last_name": "Patient",
            "phone_number": "+12345678901"
        }
        # Create patient record
        patient_resp = requests.post(
            f"{BASE_URL}/patients",
            json=patient_data,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert patient_resp.status_code == 201, f"Patient creation failed: {patient_resp.text}"
        patient_id = patient_resp.json().get("id")
        assert patient_id, "Patient ID missing in response"

        # Book appointment for the patient
        appointment_request = {
            "patient_id": patient_id,
            "visit_type": "Consulta",
            "consult_type": "Seguimiento",
            "practice_type": "General",
            "health_insurance": "Publica",
            "appointment_date": future_datetime,
            "notes": "Test appointment for cancellation"
        }

        appt_resp = requests.post(
            f"{BASE_URL}/appointments",
            json=appointment_request,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert appt_resp.status_code == 201, f"Appointment creation failed: {appt_resp.text}"
        appt_json = appt_resp.json()
        appointment_id = appt_json.get("id")
        cancellation_token = appt_json.get("cancellation_token")
        assert appointment_id, "Appointment ID missing in response"
        assert cancellation_token, "Cancellation token missing in response"

        # Step 2: Attempt valid cancellation >24 hours before appointment - should succeed
        cancel_resp = requests.post(
            f"{BASE_URL}/cancel-appointment",
            json={"appointment_id": appointment_id, "token": cancellation_token},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert cancel_resp.status_code == 200, f"Cancellation failed unexpectedly: {cancel_resp.text}"
        cancel_json = cancel_resp.json()
        assert cancel_json.get("status") == "cancelled", "Appointment status not updated to cancelled"

        # Step 3: Book an appointment within 12 hours to test last-minute cancellation rejection
        near_datetime = (datetime.utcnow() + timedelta(hours=10)).replace(microsecond=0).isoformat() + "Z"
        appointment_request_urgent = {
            "patient_id": patient_id,
            "visit_type": "Consulta",
            "consult_type": "Primera vez",
            "practice_type": "General",
            "health_insurance": "Publica",
            "appointment_date": near_datetime,
            "notes": "Urgent appointment to test last-minute cancellation"
        }
        appt_resp_urgent = requests.post(
            f"{BASE_URL}/appointments",
            json=appointment_request_urgent,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert appt_resp_urgent.status_code == 201, f"Urgent appointment creation failed: {appt_resp_urgent.text}"
        appt_urgent_json = appt_resp_urgent.json()
        appointment_id_urgent = appt_urgent_json.get("id")
        cancellation_token_urgent = appt_urgent_json.get("cancellation_token")
        assert appointment_id_urgent, "Urgent appointment ID missing"
        assert cancellation_token_urgent, "Urgent cancellation token missing"

        # Step 4: Attempt cancellation less than 12 hours before appointment - should reject
        cancel_resp_urgent = requests.post(
            f"{BASE_URL}/cancel-appointment",
            json={"appointment_id": appointment_id_urgent, "token": cancellation_token_urgent},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert cancel_resp_urgent.status_code == 400 or cancel_resp_urgent.status_code == 403, (
            "Last-minute cancellation within 12 hours should be rejected"
        )
        cancel_error_json = cancel_resp_urgent.json()
        assert "error" in cancel_error_json or "message" in cancel_error_json, "Error message expected for last-minute cancellation"

        # Step 5: Attempt cancellation with invalid token - should reject
        invalid_token_resp = requests.post(
            f"{BASE_URL}/cancel-appointment",
            json={"appointment_id": appointment_id_urgent, "token": "invalid-token-123"},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert invalid_token_resp.status_code == 401 or invalid_token_resp.status_code == 403, "Invalid token cancellation should be unauthorized"
        invalid_token_json = invalid_token_resp.json()
        assert "error" in invalid_token_json or "message" in invalid_token_json, "Error message expected for invalid token"

    finally:
        # Cleanup appointments if they still exist
        if appointment_id:
            requests.delete(f"{BASE_URL}/appointments/{appointment_id}", timeout=TIMEOUT)
        if 'appointment_id_urgent' in locals() and appointment_id_urgent:
            requests.delete(f"{BASE_URL}/appointments/{appointment_id_urgent}", timeout=TIMEOUT)
        if 'patient_id' in locals() and patient_id:
            requests.delete(f"{BASE_URL}/patients/{patient_id}", timeout=TIMEOUT)


test_appointment_cancellation_api()
