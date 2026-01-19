
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** maraxo-app-2-main
- **Date:** 2026-01-19
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 patient_appointment_scheduling_api
- **Test Code:** [TC001_patient_appointment_scheduling_api.py](./TC001_patient_appointment_scheduling_api.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 129, in <module>
  File "<string>", line 23, in test_patient_appointment_scheduling_api
AssertionError: Visit types list is empty

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d3f9883c-1816-4052-bf75-e4e8e200692e/9757585e-e4b8-461f-9e8d-052e3c56f494
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 available_times_api
- **Test Code:** [TC002_available_times_api.py](./TC002_available_times_api.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 44, in <module>
  File "<string>", line 20, in test_available_times_api
AssertionError: Expected status code 200, got 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d3f9883c-1816-4052-bf75-e4e8e200692e/62279f20-b2dd-49d5-9629-4021ae14a3b3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 admin_authentication_api
- **Test Code:** [TC003_admin_authentication_api.py](./TC003_admin_authentication_api.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 112, in <module>
  File "<string>", line 23, in test_admin_authentication_api
AssertionError

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d3f9883c-1816-4052-bf75-e4e8e200692e/0615ce22-21e5-4a5c-a4f0-1604bae806d1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 patient_management_api
- **Test Code:** [TC004_patient_management_api.py](./TC004_patient_management_api.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 115, in <module>
  File "<string>", line 48, in test_patient_management_api
AssertionError: Expected 201 created, got 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d3f9883c-1816-4052-bf75-e4e8e200692e/04fc107b-90db-4a48-ac29-84ba9b00ffe4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 appointment_cancellation_api
- **Test Code:** [TC005_appointment_cancellation_api.py](./TC005_appointment_cancellation_api.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 126, in <module>
  File "<string>", line 31, in test_appointment_cancellation_api
AssertionError: Patient ID missing in response

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d3f9883c-1816-4052-bf75-e4e8e200692e/f9b4678f-0494-4beb-8329-45a5c2badbac
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 work_schedule_management_api
- **Test Code:** [TC006_work_schedule_management_api.py](./TC006_work_schedule_management_api.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 106, in <module>
  File "<string>", line 32, in test_work_schedule_management_api
AssertionError: Expected 201 Created, got 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d3f9883c-1816-4052-bf75-e4e8e200692e/3d04fd2a-d581-4f3c-aedd-4648146074e9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 unavailable_days_management_api
- **Test Code:** [TC007_unavailable_days_management_api.py](./TC007_unavailable_days_management_api.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 86, in <module>
  File "<string>", line 33, in test_unavailable_days_management_api
AssertionError: Failed to create unavailable day: {"error":"Date is required"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d3f9883c-1816-4052-bf75-e4e8e200692e/9dd1e7a2-cbb3-4f9a-be02-19e69e59ce7f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 health_insurance_management_api
- **Test Code:** [TC008_health_insurance_management_api.py](./TC008_health_insurance_management_api.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 42, in <module>
  File "<string>", line 31, in test_health_insurance_management_api
AssertionError: Missing keys in item: {'pricing', 'id'}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d3f9883c-1816-4052-bf75-e4e8e200692e/7f0168fe-dc34-4517-9d3b-56c432a6a235
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 push_notifications_api
- **Test Code:** [TC009_push_notifications_api.py](./TC009_push_notifications_api.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 79, in <module>
  File "<string>", line 34, in test_push_notifications_api
AssertionError: Subscribe request failed with status 500, response: {"error":"Failed to save subscription"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d3f9883c-1816-4052-bf75-e4e8e200692e/acf6e965-e729-41a2-a991-55f1d1852c8f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 rate_limiting_api
- **Test Code:** [TC010_rate_limiting_api.py](./TC010_rate_limiting_api.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 55, in <module>
  File "<string>", line 25, in test_rate_limiting_api
AssertionError: No token found in login response

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d3f9883c-1816-4052-bf75-e4e8e200692e/e9f92db9-724c-446a-a821-19667b0ccd96
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