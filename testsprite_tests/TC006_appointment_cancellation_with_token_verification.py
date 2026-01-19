import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime, timedelta
import traceback

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("maxim.degtiarev.dev@gmail.com", "admin1234")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_appointment_cancellation_with_token_verification():
    appointment = None
    cancellation_token = None
    
    try:
        # Step 1: Create a patient to associate with appointment
        patient_data = {
            "first_name": "Test",
            "last_name": "Patient",
            "email": f"testpatient_{datetime.utcnow().timestamp()}@example.com",
            "phone": f"555{int(datetime.utcnow().timestamp()) % 10000000:07d}"
        }
        patient_resp = requests.post(
            f"{BASE_URL}/patients",
            auth=AUTH,
            headers=HEADERS,
            json=patient_data,
            timeout=TIMEOUT,
        )
        assert patient_resp.status_code == 201, f"Failed to create patient: {patient_resp.text}"
        patient = patient_resp.json()
        patient_id = patient.get("id") or patient.get("patient_id") or patient.get("id".lower())

        # Step 2: Retrieve visit types (should be array)
        visit_types_resp = requests.get(f"{BASE_URL}/visit-types", auth=AUTH, timeout=TIMEOUT)
        assert visit_types_resp.status_code == 200, "Failed to get visit types"
        visit_types = visit_types_resp.json()
        assert isinstance(visit_types, list) and len(visit_types) > 0, "Visit types response invalid"

        # Step 3: Retrieve consult types (should be array)
        consult_types_resp = requests.get(f"{BASE_URL}/consult-types", auth=AUTH, timeout=TIMEOUT)
        assert consult_types_resp.status_code == 200, "Failed to get consult types"
        consult_types = consult_types_resp.json()
        assert isinstance(consult_types, list) and len(consult_types) > 0, "Consult types response invalid"

        # Step 4: Retrieve practice types (should be array, required for appointment creation)
        practice_types_resp = requests.get(f"{BASE_URL}/practice-types", auth=AUTH, timeout=TIMEOUT)
        assert practice_types_resp.status_code == 200, "Failed to get practice types"
        practice_types = practice_types_resp.json()
        assert isinstance(practice_types, list) and len(practice_types) > 0, "Practice types response invalid"

        # Step 5: Retrieve health insurance options (assumed needed)
        health_ins_resp = requests.get(f"{BASE_URL}/health-insurance", auth=AUTH, timeout=TIMEOUT)
        assert health_ins_resp.status_code == 200, "Failed to get health insurance options"
        health_ins_options = health_ins_resp.json()
        assert isinstance(health_ins_options, list) and len(health_ins_options) > 0, "Health insurance response invalid"

        # Step 6: Schedule an appointment more than 24h in the future to meet cancellation policy
        future_date = (datetime.utcnow() + timedelta(days=2)).date().isoformat()
        # For simplicity, pick first visit type, consult type, practice type, and health insurance
        appointment_payload = {
            "patient_id": patient_id,
            "date": future_date,
            "time": "10:00",  # Assuming API accepts this time format and slot is available
            "visit_type": visit_types[0].get("id") or visit_types[0].get("visit_type_id") or visit_types[0].get("id".lower()),
            "consult_type": consult_types[0].get("id") or consult_types[0].get("consult_type_id") or consult_types[0].get("id".lower()),
            "practice_type": practice_types[0].get("id") or practice_types[0].get("practice_type_id") or practice_types[0].get("id".lower()),
            "health_insurance": health_ins_options[0].get("id") or health_ins_options[0].get("health_insurance_id") or health_ins_options[0].get("id".lower())
        }

        appointment_resp = requests.post(
            f"{BASE_URL}/appointments",
            auth=AUTH,
            headers=HEADERS,
            json=appointment_payload,
            timeout=TIMEOUT,
        )
        assert appointment_resp.status_code == 201, f"Failed to create appointment: {appointment_resp.text}"
        appointment = appointment_resp.json()
        appointment_id = appointment.get("id") or appointment.get("appointment_id") or appointment.get("id".lower())

        # Step 7: Request cancellation token generation or retrieve token if returned on creation
        # Assuming there's an endpoint like /cancel-appointment/verify that verifies appointment and provides token
        verify_resp = requests.post(
            f"{BASE_URL}/cancel-appointment/verify",
            auth=AUTH,
            headers=HEADERS,
            json={"appointment_id": appointment_id},
            timeout=TIMEOUT,
        )
        assert verify_resp.status_code == 200, f"Cancellation token verification failed: {verify_resp.text}"
        verify_data = verify_resp.json()
        cancellation_token = verify_data.get("token") or verify_data.get("cancellation_token")

        assert cancellation_token is not None and isinstance(cancellation_token, str), "Cancellation token missing or invalid"

        # Step 8: Attempt cancellation using the token (should succeed)
        cancel_resp = requests.post(
            f"{BASE_URL}/cancel-appointment",
            auth=AUTH,
            headers=HEADERS,
            json={"token": cancellation_token},
            timeout=TIMEOUT,
        )
        assert cancel_resp.status_code == 200, f"Appointment cancellation failed: {cancel_resp.text}"
        cancel_result = cancel_resp.json()
        assert cancel_result.get("status") == "cancelled" or "cancel" in str(cancel_result).lower(), "Cancellation not confirmed in response"

        # Step 9: Attempt cancellation with the same token again (should fail, token expired or invalid)
        cancel_resp_repeat = requests.post(
            f"{BASE_URL}/cancel-appointment",
            auth=AUTH,
            headers=HEADERS,
            json={"token": cancellation_token},
            timeout=TIMEOUT,
        )
        assert cancel_resp_repeat.status_code != 200, "Cancellation repeated with same token should fail"
        error_msg = cancel_resp_repeat.json().get("error") or cancel_resp_repeat.json().get("message")
        assert error_msg is not None and ("invalid" in error_msg.lower() or "expired" in error_msg.lower()), "Proper error message not returned for reused token"

        # Step 10: Attempt cancellation less than 24h ahead (create appointment within 23h and try to cancel)
        near_date_time = datetime.utcnow() + timedelta(hours=23)
        near_date = near_date_time.date().isoformat()
        near_time = near_date_time.strftime("%H:%M")
        appointment_payload_2 = {
            "patient_id": patient_id,
            "date": near_date,
            "time": near_time,
            "visit_type": visit_types[0].get("id") or visit_types[0].get("visit_type_id") or visit_types[0].get("id".lower()),
            "consult_type": consult_types[0].get("id") or consult_types[0].get("consult_type_id") or consult_types[0].get("id".lower()),
            "practice_type": practice_types[0].get("id") or practice_types[0].get("practice_type_id") or practice_types[0].get("id".lower()),
            "health_insurance": health_ins_options[0].get("id") or health_ins_options[0].get("health_insurance_id") or health_ins_options[0].get("id".lower())
        }
        appointment_resp_2 = requests.post(
            f"{BASE_URL}/appointments",
            auth=AUTH,
            headers=HEADERS,
            json=appointment_payload_2,
            timeout=TIMEOUT,
        )
        assert appointment_resp_2.status_code == 201, f"Failed to create appointment for 24h policy test: {appointment_resp_2.text}"
        appointment_2 = appointment_resp_2.json()
        appointment_id_2 = appointment_2.get("id") or appointment_2.get("appointment_id") or appointment_2.get("id".lower())

        verify_resp_2 = requests.post(
            f"{BASE_URL}/cancel-appointment/verify",
            auth=AUTH,
            headers=HEADERS,
            json={"appointment_id": appointment_id_2},
            timeout=TIMEOUT,
        )
        assert verify_resp_2.status_code == 200, f"Cancellation token verification failed for near appointment: {verify_resp_2.text}"
        cancellation_token_2 = verify_resp_2.json().get("token") or verify_resp_2.json().get("cancellation_token")
        assert cancellation_token_2 is not None and isinstance(cancellation_token_2, str), "Cancellation token missing or invalid for near appointment"

        # Now try to cancel appointment less than 24h ahead - should fail due to 24h policy
        cancel_resp_2 = requests.post(
            f"{BASE_URL}/cancel-appointment",
            auth=AUTH,
            headers=HEADERS,
            json={"token": cancellation_token_2},
            timeout=TIMEOUT,
        )
        assert cancel_resp_2.status_code == 400 or cancel_resp_2.status_code == 403, "Cancellation within 24h should be forbidden"
        error_msg_2 = cancel_resp_2.json().get("error") or cancel_resp_2.json().get("message")
        assert error_msg_2 is not None and ("24 hour" in error_msg_2.lower() or "advance" in error_msg_2.lower()), "Proper error message not returned for 24h policy violation"

    except Exception as e:
        traceback.print_exc()
        raise e

    finally:
        # Cleanup: delete the appointments and patient created
        try:
            if appointment and appointment.get("id"):
                requests.delete(f"{BASE_URL}/appointments/{appointment['id']}", auth=AUTH, timeout=TIMEOUT)
        except:
            pass
        try:
            if 'appointment_2' in locals() and appointment_2 and appointment_2.get("id"):
                requests.delete(f"{BASE_URL}/appointments/{appointment_2['id']}", auth=AUTH, timeout=TIMEOUT)
        except:
            pass
        try:
            if patient and patient.get("id"):
                requests.delete(f"{BASE_URL}/patients/{patient['id']}", auth=AUTH, timeout=TIMEOUT)
        except:
            pass

test_appointment_cancellation_with_token_verification()
