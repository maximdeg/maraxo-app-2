import requests
from requests.auth import HTTPBasicAuth
import datetime
import uuid

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("maxim.degtiarev.dev@gmail.com", "admin1234")
TIMEOUT = 30

def test_patient_appointment_scheduling_api():
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # Step 1: Retrieve required options for visit types, consult types, practice types, health insurance
    # Assuming these endpoints exist according to PRD files

    # Get visit types
    visit_types_resp = requests.get(f"{BASE_URL}/api/visit-types", auth=AUTH, headers=headers, timeout=TIMEOUT)
    assert visit_types_resp.status_code == 200, f"Failed to get visit types: {visit_types_resp.text}"
    visit_types = visit_types_resp.json()
    assert isinstance(visit_types, list) and len(visit_types) > 0, "Visit types list is empty"

    # Get consult types
    consult_types_resp = requests.get(f"{BASE_URL}/api/consult-types", auth=AUTH, headers=headers, timeout=TIMEOUT)
    assert consult_types_resp.status_code == 200, f"Failed to get consult types: {consult_types_resp.text}"
    consult_types = consult_types_resp.json()
    assert isinstance(consult_types, list) and len(consult_types) > 0, "Consult types list is empty"

    # Get health insurances
    health_insurances_resp = requests.get(f"{BASE_URL}/api/health-insurance", auth=AUTH, headers=headers, timeout=TIMEOUT)
    assert health_insurances_resp.status_code == 200, f"Failed to get health insurance options: {health_insurances_resp.text}"
    health_insurances = health_insurances_resp.json()
    assert isinstance(health_insurances, list) and len(health_insurances) > 0, "Health insurance list is empty"

    # Select valid ids from options for payload
    visit_type_id = visit_types[0]['id'] if 'id' in visit_types[0] else visit_types[0]
    consult_type_id = consult_types[0]['id'] if 'id' in consult_types[0] else consult_types[0]
    health_insurance_id = health_insurances[0]['id'] if 'id' in health_insurances[0] else health_insurances[0]

    # To select a valid practice type, infer from available data or reuse visit_type (assuming practice types are part of consult/practice)
    # Since there's no explicit endpoint for practice types in PRD filenames, we'll assume a static example or that it's part of visit type or consult type.
    # Using a placeholder practice_type string:
    practice_type = "Consulta"  # example value, adjust if needed

    # Generate a valid appointment date: at least tomorrow, not weekend, within 30 days range, excluding holidays (simplified here)
    def get_valid_appointment_date():
        today = datetime.date.today()
        for delta in range(1, 31):
            candidate = today + datetime.timedelta(days=delta)
            if candidate.weekday() < 5:  # Monday=0, Sunday=6 (exclude weekends)
                return candidate.isoformat()
        raise RuntimeError("No valid appointment date found in next 30 days excluding weekends")

    appointment_date = get_valid_appointment_date()

    # Retrieve available time slots for that appointment date
    available_times_resp = requests.get(f"{BASE_URL}/api/available-times/{appointment_date}", auth=AUTH, headers=headers, timeout=TIMEOUT)
    assert available_times_resp.status_code == 200, f"Failed to get available times: {available_times_resp.text}"
    available_times = available_times_resp.json()
    assert isinstance(available_times, list) and len(available_times) > 0, "No available time slots for the selected date"
    appointment_time = available_times[0]

    # Prepare patient information
    unique_identifier = str(uuid.uuid4())[:8]
    patient_data = {
        "firstName": "Test",
        "lastName": f"User{unique_identifier}",
        "phone": "+541112345678",  # Valid phone format as example
        "email": f"test.user{unique_identifier}@example.com",
        "birthDate": "1980-01-01"
    }

    # Create or confirm patient record - check if patient exists might be by phone or email (assuming POST /api/patients creates new patient)
    patient_create_resp = requests.post(f"{BASE_URL}/api/patients", json=patient_data, auth=AUTH, headers=headers, timeout=TIMEOUT)
    assert patient_create_resp.status_code in (200,201), f"Failed to create patient: {patient_create_resp.text}"
    patient = patient_create_resp.json()
    assert "id" in patient, "Patient ID missing in response"
    patient_id = patient["id"]

    # Construct appointment payload based on PRD and form requirements
    appointment_payload = {
        "patientId": patient_id,
        "date": appointment_date,
        "time": appointment_time,
        "visitType": visit_type_id,
        "consultType": consult_type_id,
        "practiceType": practice_type,
        "healthInsuranceId": health_insurance_id,
        # Additional required fields assumed minimal here (could be symptoms, notes...)
    }

    # Create appointment
    appointment_create_resp = requests.post(f"{BASE_URL}/api/appointments/create", json=appointment_payload, auth=AUTH, headers=headers, timeout=TIMEOUT)
    assert appointment_create_resp.status_code in (200,201), f"Failed to create appointment: {appointment_create_resp.text}"
    appointment = appointment_create_resp.json()
    assert "id" in appointment, "Appointment ID missing in response"
    appointment_id = appointment["id"]
    assert "cancellationToken" in appointment, "Cancellation token missing in appointment creation response"
    cancellation_token = appointment["cancellationToken"]
    assert isinstance(cancellation_token, str) and len(cancellation_token) > 0, "Invalid cancellation token"

    # Optionally, fetch appointment to verify details saved correctly
    get_appointment_resp = requests.get(f"{BASE_URL}/api/appointments/{appointment_id}", auth=AUTH, headers=headers, timeout=TIMEOUT)
    assert get_appointment_resp.status_code == 200, f"Failed to fetch appointment details: {get_appointment_resp.text}"
    appointment_details = get_appointment_resp.json()
    assert appointment_details["id"] == appointment_id
    assert appointment_details["patientId"] == patient_id
    assert appointment_details["date"] == appointment_date
    assert appointment_details["time"] == appointment_time
    assert appointment_details["visitType"] == visit_type_id
    assert appointment_details["consultType"] == consult_type_id
    assert appointment_details["practiceType"] == practice_type
    assert appointment_details["healthInsuranceId"] == health_insurance_id
    assert "cancellationToken" in appointment_details and appointment_details["cancellationToken"] == cancellation_token

    # Cleanup: delete created appointment and patient
    try:
        pass  # test assertions passed
    finally:
        # Delete appointment
        del_appointment_resp = requests.delete(f"{BASE_URL}/api/appointments/{appointment_id}", auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert del_appointment_resp.status_code in (200,204), f"Failed to delete appointment: {del_appointment_resp.text}"
        # Delete patient
        del_patient_resp = requests.delete(f"{BASE_URL}/api/patients/{patient_id}", auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert del_patient_resp.status_code in (200,204), f"Failed to delete patient: {del_patient_resp.text}"

test_patient_appointment_scheduling_api()
