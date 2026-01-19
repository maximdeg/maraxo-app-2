import requests
from requests.auth import HTTPBasicAuth
import uuid
import datetime

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("maxim.degtiarev.dev@gmail.com", "admin1234")
TIMEOUT = 30

def test_appointment_confirmation_details():
    # Step 1: Create a patient to book an appointment for
    patient_payload = {
        "firstName": "Test",
        "lastName": "Patient",
        "email": f"test.patient.{uuid.uuid4()}@example.com",
        "phone": f"+1555{uuid.uuid4().int % 10000000:07d}"
    }
    patient_id = None
    appointment_id = None
    try:
        # Create patient
        r_patient = requests.post(
            f"{BASE_URL}/patients",
            json=patient_payload,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert r_patient.status_code == 201, f"Patient creation failed: {r_patient.text}"
        patient_data = r_patient.json()
        patient_id = patient_data.get("id") or patient_data.get("patientId")
        assert patient_id is not None, "Patient ID missing in creation response"

        # Step 2: Retrieve visit types and consult types (they return arrays)
        r_visit_types = requests.get(f"{BASE_URL}/visit-types", auth=AUTH, timeout=TIMEOUT)
        assert r_visit_types.status_code == 200, f"Failed to get visit types: {r_visit_types.text}"
        visit_types = r_visit_types.json()
        assert isinstance(visit_types, list) and len(visit_types) > 0, "Visit types should be non-empty list"

        r_consult_types = requests.get(f"{BASE_URL}/consult-types", auth=AUTH, timeout=TIMEOUT)
        assert r_consult_types.status_code == 200, f"Failed to get consult types: {r_consult_types.text}"
        consult_types = r_consult_types.json()
        assert isinstance(consult_types, list) and len(consult_types) > 0, "Consult types should be non-empty list"

        # Step 3: Retrieve health insurance options (required for appointment)
        r_insurances = requests.get(f"{BASE_URL}/health-insurance", auth=AUTH, timeout=TIMEOUT)
        assert r_insurances.status_code == 200, f"Failed to get health insurances: {r_insurances.text}"
        insurances = r_insurances.json()
        assert isinstance(insurances, list) and len(insurances) > 0, "Health insurances should be non-empty list"

        # Step 4: Determine an appointment date (next weekday, skipping weekends)
        appointment_date_obj = datetime.datetime.utcnow().date() + datetime.timedelta(days=1)
        while appointment_date_obj.weekday() >= 5:  # 5=Saturday, 6=Sunday
            appointment_date_obj += datetime.timedelta(days=1)
        appointment_date = appointment_date_obj.isoformat()

        # Step 5: Get available times for that date
        r_available_times = requests.get(f"{BASE_URL}/available-times/{appointment_date}", auth=AUTH, timeout=TIMEOUT)
        assert r_available_times.status_code == 200, f"Failed to get available times: {r_available_times.text}"
        available_times = r_available_times.json()
        assert isinstance(available_times, list) and len(available_times) > 0, "Available times should be non-empty list"

        appointment_time = available_times[0].get("time") or available_times[0].get("time_slot") or available_times[0]
        assert appointment_time is not None, "Could not determine an available time slot"

        # Step 6: Create the appointment using obtained ids and time
        appointment_payload = {
            "patientId": patient_id,
            "date": appointment_date,
            "time": appointment_time,
            "visitType": visit_types[0].get("id") or visit_types[0].get("visit_type_id") or visit_types[0],
            "consultType": consult_types[0].get("id") or consult_types[0].get("consult_type_id") or consult_types[0],
            "healthInsuranceId": insurances[0].get("id") or insurances[0].get("health_insurance_id") or insurances[0]
        }

        r_appointment = requests.post(
            f"{BASE_URL}/appointments",
            json=appointment_payload,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert r_appointment.status_code == 201, f"Appointment creation failed: {r_appointment.text}"
        appointment_data = r_appointment.json()
        appointment_id = appointment_data.get("id") or appointment_data.get("appointmentId")
        assert appointment_id is not None, "Appointment ID missing in creation response"

        # Step 7: Retrieve appointment confirmation details
        r_confirmation = requests.get(
            f"{BASE_URL}/appointments/{appointment_id}/confirmation",
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert r_confirmation.status_code == 200, f"Failed to get appointment confirmation: {r_confirmation.text}"
        confirmation_data = r_confirmation.json()

        # Validation: Check key appointment details present and matching
        # Patient info at root level (per fix #1)
        patient_info_keys = ["firstName", "lastName", "email", "phone"]
        for key in patient_info_keys:
            assert key in confirmation_data, f"Patient field '{key}' missing in confirmation response"
            assert confirmation_data[key] == patient_payload[key], f"Mismatch in patient field '{key}'"

        # Confirm date and time correctness (flexible field names)
        date_field = confirmation_data.get("date") or confirmation_data.get("appointment_date")
        time_field = confirmation_data.get("time") or confirmation_data.get("appointment_time")
        assert date_field == appointment_date, "Appointment date mismatch in confirmation"
        assert time_field == appointment_time, "Appointment time mismatch in confirmation"

        # Visit and consult types should be arrays with elements (per fix #1)
        visit_types_field = confirmation_data.get("visitTypes") or confirmation_data.get("visit_types")
        assert isinstance(visit_types_field, list) and len(visit_types_field) > 0, "Visit types missing or invalid"

        consult_types_field = confirmation_data.get("consultTypes") or confirmation_data.get("consult_types")
        assert isinstance(consult_types_field, list) and len(consult_types_field) > 0, "Consult types missing or invalid"

        # Cancellation instructions presence (an important part)
        cancellation_instructions = confirmation_data.get("cancellationInstructions") or confirmation_data.get("cancellation_instructions")
        cancellation_link = confirmation_data.get("cancellationLink") or confirmation_data.get("cancellation_link")
        assert cancellation_instructions and isinstance(cancellation_instructions, str), "Cancellation instructions missing or invalid"
        assert cancellation_link and isinstance(cancellation_link, str) and cancellation_link.startswith("http"), "Cancellation link missing or invalid"

    finally:
        # Clean up: delete the created appointment if exists
        if appointment_id:
            try:
                r_del_appointment = requests.delete(
                    f"{BASE_URL}/appointments/{appointment_id}",
                    auth=AUTH,
                    timeout=TIMEOUT
                )
                assert r_del_appointment.status_code in (200, 204), f"Failed to delete appointment: {r_del_appointment.text}"
            except Exception as e:
                print(f"Cleanup failed for appointment: {e}")

        # Clean up: delete the created patient if exists
        if patient_id:
            try:
                r_del_patient = requests.delete(
                    f"{BASE_URL}/patients/{patient_id}",
                    auth=AUTH,
                    timeout=TIMEOUT
                )
                assert r_del_patient.status_code in (200, 204), f"Failed to delete patient: {r_del_patient.text}"
            except Exception as e:
                print(f"Cleanup failed for patient: {e}")

test_appointment_confirmation_details()
