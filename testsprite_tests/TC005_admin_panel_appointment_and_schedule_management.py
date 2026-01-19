import requests
from requests.auth import HTTPBasicAuth
import json

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("maxim.degtiarev.dev@gmail.com", "admin1234")
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}
TIMEOUT = 30

def test_admin_panel_appointment_and_schedule_management():
    # Authenticate and get session cookie by making an initial request to a protected endpoint
    session = requests.Session()
    session.auth = AUTH
    session.headers.update(HEADERS)

    # Step 1: Verify access to appointments list (GET /appointments)
    try:
        resp = session.get(f"{BASE_URL}/appointments", timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}"
        resp_json = resp.json()
        # We expect the response to be an object with a field containing a list of appointments
        # Check common fields 'appointments' or 'data' for the list
        if isinstance(resp_json, dict):
            if "appointments" in resp_json:
                appointments = resp_json["appointments"]
            elif "data" in resp_json:
                appointments = resp_json["data"]
            else:
                # Fallback: Find first list in values
                appointments = next((v for v in resp_json.values() if isinstance(v, list)), None)
            assert isinstance(appointments, list), "Appointments response should contain a list"
        else:
            assert False, "Appointments response is not a dict"
    except Exception as e:
        assert False, f"Failed to get appointments: {e}"

    # Step 2: Create a new appointment (POST /appointments/create)
    appointment_data = {
        "patient_name": "Test Patient",
        "date": "2026-01-20",
        "time": "10:00",
        "visit_type": "Consulta",
        "consult_type": "Primera vez",
        "practice_type": "Dermatología",
        "health_insurance": "BasicPlan",
        "notes": "Test appointment for automation"
    }
    appointment_id = None
    try:
        resp = session.post(f"{BASE_URL}/appointments/create", data=json.dumps(appointment_data), timeout=TIMEOUT)
        assert resp.status_code in (200,201), f"Expected 200 or 201 Created, got {resp.status_code}"
        resp_json = resp.json()
        # The appointment ID could be in 'id' or 'appointmentId' due to field name flexibility
        appointment_id = resp_json.get("id") or resp_json.get("appointmentId")
        assert appointment_id is not None, "Created appointment missing id"
    except Exception as e:
        assert False, f"Failed to create appointment: {e}"

    # Step 3: Update the appointment (PUT /appointments/{id})
    if appointment_id:
        updated_data = {
            "notes": "Updated note - verified by automated test",
            "visit_type": "Consulta",
            "consult_type": "Seguimiento"
        }
        try:
            resp = session.put(f"{BASE_URL}/appointments/{appointment_id}", data=json.dumps(updated_data), timeout=TIMEOUT)
            assert resp.status_code == 200, f"Expected 200 OK on update, got {resp.status_code}"
            updated_resp = resp.json()
            # Confirm updated fields returned reflect changes, checking snake_case or camelCase variants
            notes = updated_resp.get("notes") or updated_resp.get("Notes")
            visit_type = updated_resp.get("visit_type") or updated_resp.get("visitType")
            consult_type = updated_resp.get("consult_type") or updated_resp.get("consultType")
            assert notes == updated_data["notes"], "Appointment notes not updated correctly"
            assert visit_type == updated_data["visit_type"], "Appointment visit_type not updated correctly"
            assert consult_type == updated_data["consult_type"], "Appointment consult_type not updated correctly"
        except Exception as e:
            assert False, f"Failed to update appointment: {e}"

    # Step 4: Retrieve work schedule (GET /work-schedule)
    try:
        resp = session.get(f"{BASE_URL}/work-schedule", timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 OK for work schedule, got {resp.status_code}"
        work_schedule = resp.json()
        assert isinstance(work_schedule, list), "Work schedule should be a list"
    except Exception as e:
        assert False, f"Failed to get work schedule: {e}"

    # Step 5: Create a work schedule entry (POST /work-schedule)
    work_schedule_data = {
        "day": "Monday",
        "start_time": "09:00",
        "end_time": "17:00",
        "active": True
    }
    work_schedule_id = None
    try:
        resp = session.post(f"{BASE_URL}/work-schedule", data=json.dumps(work_schedule_data), timeout=TIMEOUT)
        assert resp.status_code in (200,201), f"Expected 200 or 201 when creating work schedule, got {resp.status_code}"
        ws_resp = resp.json()
        work_schedule_id = ws_resp.get("id") or ws_resp.get("workScheduleId")
        assert work_schedule_id is not None, "Created work schedule missing id"
    except Exception as e:
        assert False, f"Failed to create work schedule: {e}"

    # Step 6: Update the created work schedule (PUT /work-schedule/{id})
    if work_schedule_id:
        updated_ws_data = {
            "end_time": "18:00",
            "active": False
        }
        try:
            resp = session.put(f"{BASE_URL}/work-schedule/{work_schedule_id}", data=json.dumps(updated_ws_data), timeout=TIMEOUT)
            assert resp.status_code == 200, f"Expected 200 OK on updating work schedule, got {resp.status_code}"
            updated_ws_resp = resp.json()
            # Check updated fields (camelCase or snake_case)
            end_time = updated_ws_resp.get("end_time") or updated_ws_resp.get("endTime")
            active = updated_ws_resp.get("active")
            assert end_time == updated_ws_data["end_time"], "Work schedule end_time not updated correctly"
            assert active == updated_ws_data["active"], "Work schedule active flag not updated correctly"
        except Exception as e:
            assert False, f"Failed to update work schedule: {e}"

    # Step 7: Retrieve system configurations (GET /config)
    try:
        resp = session.get(f"{BASE_URL}/config", timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 OK for system configurations, got {resp.status_code}"
        config = resp.json()
        assert isinstance(config, dict), "System config response should be a dict"
    except Exception as e:
        assert False, f"Failed to get system configurations: {e}"

    # Step 8: Modify system configuration (PUT /config)
    updated_config_data = {
        "settingA": True,
        "maxAppointmentsPerDay": 15
    }
    try:
        resp = session.put(f"{BASE_URL}/config", data=json.dumps(updated_config_data), timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 OK when updating config, got {resp.status_code}"
        config_updated_resp = resp.json()
        # Check updates, accommodate camelCase or snake_case
        setting_a_val = config_updated_resp.get("settingA") or config_updated_resp.get("setting_a")
        max_appt_val = config_updated_resp.get("maxAppointmentsPerDay") or config_updated_resp.get("max_appointments_per_day")
        assert setting_a_val == updated_config_data["settingA"], "Config settingA not updated"
        assert max_appt_val == updated_config_data["maxAppointmentsPerDay"], "Config maxAppointmentsPerDay not updated"
    except Exception as e:
        assert False, f"Failed to update system configuration: {e}"

    # Step 9: Test unauthorized access without auth (cookie/session)
    try:
        unauth_resp = requests.get(f"{BASE_URL}/appointments", timeout=TIMEOUT)
        # Should fail: expecting 401 Unauthorized or 403 Forbidden
        assert unauth_resp.status_code in (401,403), \
            f"Expected unauthorized status for no auth, got {unauth_resp.status_code}"
    except Exception as e:
        assert False, f"Failed to verify unauthorized access handling: {e}"

    # Cleanup: Delete created appointment and work schedule if exist
    try:
        if appointment_id:
            del_resp = session.delete(f"{BASE_URL}/appointments/{appointment_id}", timeout=TIMEOUT)
            assert del_resp.status_code in (200,204), f"Failed to delete appointment, got {del_resp.status_code}"
    except Exception:
        pass

    try:
        if work_schedule_id:
            del_ws_resp = session.delete(f"{BASE_URL}/work-schedule/{work_schedule_id}", timeout=TIMEOUT)
            assert del_ws_resp.status_code in (200,204), f"Failed to delete work schedule, got {del_ws_resp.status_code}"
    except Exception:
        pass

test_admin_panel_appointment_and_schedule_management()
