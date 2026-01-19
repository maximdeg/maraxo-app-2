import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime, timedelta
import uuid

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("maxim.degtiarev.dev@gmail.com", "admin1234")
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}
TIMEOUT = 30


def test_patient_appointment_scheduling():
    # Step 1: Fetch visit types
    visit_types_resp = requests.get(f"{BASE_URL}/visit-types", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
    assert visit_types_resp.status_code == 200, f"Failed to fetch visit types: {visit_types_resp.text}"
    visit_types = visit_types_resp.json()
    assert isinstance(visit_types, list) and len(visit_types) > 0, "Visit types should be a non-empty list"
    visit_type = visit_types[0]

    # Step 2: Fetch consult types
    consult_types_resp = requests.get(f"{BASE_URL}/consult-types", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
    assert consult_types_resp.status_code == 200, f"Failed to fetch consult types: {consult_types_resp.text}"
    consult_types = consult_types_resp.json()
    assert isinstance(consult_types, list) and len(consult_types) > 0, "Consult types should be a non-empty list"
    consult_type = consult_types[0]

    # Step 3: Fetch health insurances
    health_insurance_resp = requests.get(f"{BASE_URL}/health-insurance", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
    assert health_insurance_resp.status_code == 200, f"Failed to fetch health insurance: {health_insurance_resp.text}"
    health_insurances = health_insurance_resp.json()
    assert isinstance(health_insurances, list) and len(health_insurances) > 0, "Health insurances should be a non-empty list"
    health_insurance = health_insurances[0]

    # Step 4: Choose a practice type from visit_type if exists or fallback sample string
    if 'practiceType' in visit_type:
        practice_type = visit_type['practiceType']
    elif 'practice_type' in visit_type:
        practice_type = visit_type['practice_type']
    else:
        practice_type = "Dermatology"  # sample fallback

    # Step 5: Determine a date with available times
    target_date = (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d")
    available_times_resp = requests.get(f"{BASE_URL}/available-times/{target_date}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
    assert available_times_resp.status_code == 200, f"Failed to fetch available times for date {target_date}: {available_times_resp.text}"
    available_times = available_times_resp.json()
    assert isinstance(available_times, list) and len(available_times) > 0, "Available times should be a non-empty list for a valid date"
    appointment_time = available_times[0]

    # Step 6: Create a patient record (POST to /patients) or verify if patient exists to avoid duplicates
    unique_email = f"test.patient.{uuid.uuid4()}@example.com"
    patient_payload = {
        "firstName": "Test",
        "lastName": "Patient",
        "email": unique_email,
        "phoneNumber": f"+1234567{str(uuid.uuid4().int)[:7]}",
        "birthDate": "1990-01-01",
        "gender": "other",
    }
    patient_resp = requests.post(f"{BASE_URL}/patients", auth=AUTH, headers=HEADERS, json=patient_payload, timeout=TIMEOUT)
    assert patient_resp.status_code == 201, f"Failed to create patient: {patient_resp.text}"
    patient_data = patient_resp.json()
    assert "id" in patient_data, "Patient creation response must include 'id'"
    patient_id = patient_data["id"]

    # Step 7: Book appointment
    appointment_payload = {
        "patientId": patient_id,
        "date": target_date,
        "time": appointment_time,
        "visitType": visit_type.get("id") or visit_type.get("ID") or visit_type,
        "consultType": consult_type.get("id") or consult_type.get("ID") or consult_type,
        "practiceType": practice_type,
        "healthInsurance": health_insurance.get("id") or health_insurance.get("ID") or health_insurance,
    }
    appointment_resp = requests.post(f"{BASE_URL}/appointments/create", auth=AUTH, headers=HEADERS, json=appointment_payload, timeout=TIMEOUT)
    try:
        assert appointment_resp.status_code == 201, f"Failed to create appointment: {appointment_resp.text}"
        appointment_data = appointment_resp.json()
        assert appointment_data.get("patientId") == patient_id, "Appointment patientId mismatch"
        assert appointment_data.get("date") == target_date, "Appointment date mismatch"
        assert appointment_data.get("time") == appointment_time, "Appointment time mismatch"
        # Verify returned visitType, consultType, practiceType, and healthInsurance presence and values
        assert appointment_data.get("visitType") is not None, "visitType missing in appointment response"
        assert appointment_data.get("consultType") is not None, "consultType missing in appointment response"
        assert appointment_data.get("practiceType") is not None, "practiceType missing in appointment response"
        assert appointment_data.get("healthInsurance") is not None, "healthInsurance missing in appointment response"
    finally:
        # Cleanup: delete appointment
        appointment_id = appointment_resp.json().get("id")
        if appointment_id:
            del_resp = requests.delete(f"{BASE_URL}/appointments/{appointment_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
            assert del_resp.status_code in [200, 204], f"Failed to delete appointment {appointment_id}: {del_resp.text}"
        # Cleanup: delete patient
        if patient_id:
            del_patient_resp = requests.delete(f"{BASE_URL}/patients/{patient_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
            assert del_patient_resp.status_code in [200, 204], f"Failed to delete patient {patient_id}: {del_patient_resp.text}"


test_patient_appointment_scheduling()
