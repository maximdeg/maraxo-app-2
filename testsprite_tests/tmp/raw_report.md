
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** maraxo-app-2-main
- **Date:** 2026-01-19
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 patient appointment scheduling
- **Test Code:** [TC001_patient_appointment_scheduling.py](./TC001_patient_appointment_scheduling.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 103, in <module>
  File "<string>", line 48, in test_patient_appointment_scheduling
AssertionError: Failed to fetch available times for date 2026-01-22: {"error":"No available slots configured for this day of week"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6432887a-63b1-493b-b972-08963b570a3b/7013152e-08cf-4c4e-9812-c22b66e39526
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 available times management
- **Test Code:** [TC002_available_times_management.py](./TC002_available_times_management.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 65, in <module>
  File "<string>", line 27, in test_available_times_management
AssertionError: Response should be a list of available time slots

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6432887a-63b1-493b-b972-08963b570a3b/c7fa10ba-827a-44ee-896c-b78f9b42b68d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 admin authentication and authorization
- **Test Code:** [TC003_admin_authentication_and_authorization.py](./TC003_admin_authentication_and_authorization.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 85, in <module>
  File "<string>", line 33, in test_admin_authentication_and_authorization
AssertionError: Token verification failed: 

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6432887a-63b1-493b-b972-08963b570a3b/17af774b-bf0e-4858-8572-24d6a8f6303a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 patient management crud operations
- **Test Code:** [TC004_patient_management_crud_operations.py](./TC004_patient_management_crud_operations.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 129, in <module>
  File "<string>", line 43, in test_patient_management_crud_operations
AssertionError: Field firstName missing in created patient response

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6432887a-63b1-493b-b972-08963b570a3b/e2c06f6d-d511-4d25-89ca-74cee1a92d83
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 admin panel appointment and schedule management
- **Test Code:** [TC005_admin_panel_appointment_and_schedule_management.py](./TC005_admin_panel_appointment_and_schedule_management.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 54, in test_admin_panel_appointment_and_schedule_management
AssertionError: Expected 200 or 201 Created, got 400

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 177, in <module>
  File "<string>", line 60, in test_admin_panel_appointment_and_schedule_management
AssertionError: Failed to create appointment: Expected 200 or 201 Created, got 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6432887a-63b1-493b-b972-08963b570a3b/2721a04b-9424-4aac-8446-9c7fbd9f152f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 appointment cancellation with token verification
- **Test Code:** [TC006_appointment_cancellation_with_token_verification.py](./TC006_appointment_cancellation_with_token_verification.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 190, in <module>
  File "<string>", line 170, in test_appointment_cancellation_with_token_verification
  File "<string>", line 48, in test_appointment_cancellation_with_token_verification
AssertionError: Failed to get practice types

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6432887a-63b1-493b-b972-08963b570a3b/73ff6261-9f19-4579-bb78-a4657b2ff04c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 appointment confirmation details
- **Test Code:** [TC007_appointment_confirmation_details.py](./TC007_appointment_confirmation_details.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 146, in <module>
  File "<string>", line 60, in test_appointment_confirmation_details
AssertionError: Available times should be non-empty list

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6432887a-63b1-493b-b972-08963b570a3b/3520843b-a5cc-45aa-ad9e-c8519a72ba2a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 work schedule management
- **Test Code:** [TC008_work_schedule_management.py](./TC008_work_schedule_management.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 100, in <module>
  File "<string>", line 33, in test_work_schedule_management
AssertionError: Failed to create work schedule: {"error":"Missing required field: day_of_week","required":["day_of_week"],"optional":["is_working_day"]}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6432887a-63b1-493b-b972-08963b570a3b/dcc25926-485e-4f70-a749-8806279c0709
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 unavailable days and times management
- **Test Code:** [TC009_unavailable_days_and_times_management.py](./TC009_unavailable_days_and_times_management.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 97, in <module>
  File "<string>", line 19, in test_unavailable_days_and_times_management
AssertionError: Failed to create unavailable day: {"error":"Internal server error","details":"null value in column \"work_schedule_id\" of relation \"unavailable_days\" violates not-null constraint"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6432887a-63b1-493b-b972-08963b570a3b/10adf276-e6a0-4d87-82c4-20c4da227289
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 push notifications subscription and sending
- **Test Code:** [TC010_push_notifications_subscription_and_sending.py](./TC010_push_notifications_subscription_and_sending.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 89, in <module>
  File "<string>", line 32, in test_push_notifications_subscription_and_sending
AssertionError: Subscribe response status 500, body: {"error":"Database table push_subscriptions does not exist. Please run database migrations."}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6432887a-63b1-493b-b972-08963b570a3b/faa033c4-064b-4e84-8a77-2edcf5886fc8
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---