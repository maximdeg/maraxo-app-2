# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** maraxo-app-2-main
- **Date:** 2026-01-19
- **Prepared by:** TestSprite AI Team
- **Test Type:** Frontend & Backend API Testing
- **Total Test Cases:** 10
- **Test Execution Status:** Completed
- **Test Framework:** TestSprite Automated Testing

---

## 2️⃣ Requirement Validation Summary

### Requirement 1: Patient Appointment Scheduling API
**Priority:** High  
**Category:** Functional

#### Test TC001: patient_appointment_scheduling_api
- **Test Code:** [TC001_patient_appointment_scheduling_api.py](./TC001_patient_appointment_scheduling_api.py)
- **Test Error:** AssertionError - Test failed during appointment creation validation
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ff9c4b5c-c23b-479a-b642-c519dd848bbd/568f32b2-6df4-4dd6-a663-45ca5b6dbe18
- **Status:** ❌ Failed
- **Analysis / Findings:** 
  - The test failed during the appointment creation process. The API endpoint `/api/appointments/create` requires specific patient information fields (`first_name`, `last_name`, `phone_number`) and appointment details (`visit_type_id`, `appointment_date`, `appointment_time`). 
  - The test may have been missing required fields or sending data in an incorrect format. The API returns `{"error":"Missing required patient information"}` when required fields are missing.
  - **Recommendation:** Verify test data includes all required fields: `first_name`, `last_name`, `phone_number`, `visit_type_id`, `appointment_date`, `appointment_time`, and optionally `consult_type_id`, `practice_type_id`, `health_insurance`.

---

### Requirement 2: Available Times API
**Priority:** High  
**Category:** Functional

#### Test TC002: available_times_api
- **Test Code:** [TC002_available_times_api.py](./TC002_available_times_api.py)
- **Test Error:** `404 Client Error: Not Found for url: http://localhost:3000/available-times/2026-01-22`
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ff9c4b5c-c23b-479a-b642-c519dd848bbd/f081ff27-9156-4254-8807-a2ce4fa8d8a1
- **Status:** ❌ Failed
- **Analysis / Findings:**
  - **Critical Issue:** The test is accessing the wrong URL path. The correct API endpoint is `/api/available-times/[date]`, but the test is calling `/available-times/[date]` (missing `/api` prefix).
  - The actual route is defined at `app/api/available-times/[date]/route.ts` which handles GET requests for fetching available time slots.
  - **Recommendation:** Update test to use correct endpoint: `http://localhost:3000/api/available-times/2026-01-22`
  - Additionally, the API may return 404 if the date has no available slots configured or if the date is marked as unavailable in the work schedule.

---

### Requirement 3: Admin Authentication API
**Priority:** High  
**Category:** Security

#### Test TC003: admin_authentication_api
- **Test Code:** [TC003_admin_authentication_api.py](./TC003_admin_authentication_api.py)
- **Test Error:** `AssertionError: JWT token missing in login response`
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ff9c4b5c-c23b-479a-b642-c519dd848bbd/4a66a210-4591-473a-baca-66540cc95cea
- **Status:** ❌ Failed
- **Analysis / Findings:**
  - **Security Implementation Mismatch:** The login API (`/api/auth/login`) implements JWT tokens in HTTP-only cookies for enhanced security, not in the response body. The test expects the token in the JSON response body.
  - The API sets the token as an HTTP-only cookie named `auth-token` with secure, sameSite settings. This is a security best practice to prevent XSS attacks.
  - The response body contains: `{ success: true, user: { id, full_name, email, role } }` but no token field.
  - **Recommendation:** 
    - Update test to extract JWT token from the `auth-token` cookie instead of response body
    - Or modify API to optionally return token in response body for testing purposes (not recommended for production)
    - Ensure test client handles cookies properly

---

### Requirement 4: Patient Management API
**Priority:** Medium  
**Category:** Functional

#### Test TC004: patient_management_api
- **Test Code:** [TC004_patient_management_api.py](./TC004_patient_management_api.py)
- **Test Error:** `400 Client Error: Bad Request for url: http://localhost:3000/api/patients`
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ff9c4b5c-c23b-479a-b642-c519dd848bbd/0c05ff86-e295-43b8-830c-f5de989d68ec
- **Status:** ❌ Failed
- **Analysis / Findings:**
  - The API endpoint `/api/patients` (POST) requires three mandatory fields: `first_name`, `last_name`, and `phone_number`.
  - The API validates phone number format using regex: `/^\+?[\d\s\-\(\)]+$/`
  - The API returns detailed error messages indicating which fields are missing: `{ error: "Missing required fields", required: [...], received: [...] }`
  - **Recommendation:** Ensure test sends all required fields in correct format. If patient already exists (by phone number), API returns 200 with `existing: true` instead of creating duplicate.

---

### Requirement 5: Appointment Cancellation API
**Priority:** High  
**Category:** Security

#### Test TC005: appointment_cancellation_api
- **Test Code:** [TC005_appointment_cancellation_api.py](./TC005_appointment_cancellation_api.py)
- **Test Error:** `AssertionError: Failed to create appointment: {"error":"Missing required patient information"}`
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ff9c4b5c-c23b-479a-b642-c519dd848bbd/54436475-3d0f-4326-b160-42d8513a52e7
- **Status:** ❌ Failed
- **Analysis / Findings:**
  - Test failed during the prerequisite step of creating an appointment before testing cancellation.
  - The appointment creation failed due to missing required patient information.
  - **Recommendation:** Fix appointment creation step first (see TC001), then proceed with cancellation testing. Cancellation requires a valid `cancellation_token` which is generated during appointment creation.

---

### Requirement 6: Work Schedule Management API
**Priority:** Medium  
**Category:** Functional

#### Test TC006: work_schedule_management_api
- **Test Code:** [TC006_work_schedule_management_api.py](./TC006_work_schedule_management_api.py)
- **Test Error:** `AssertionError: Expected 201 Created, got 400`
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ff9c4b5c-c23b-479a-b642-c519dd848bbd/56d353c0-5123-425e-af64-fd853d912e3c
- **Status:** ❌ Failed
- **Analysis / Findings:**
  - The work schedule creation endpoint returned 400 Bad Request instead of expected 201 Created.
  - This indicates missing or invalid required fields in the request payload.
  - **Recommendation:** Review the work schedule API route (`/api/work-schedule`) to identify required fields and ensure test data matches the expected schema. May require authentication (admin JWT token).

---

### Requirement 7: Unavailable Days Management API
**Priority:** Medium  
**Category:** Functional

#### Test TC007: unavailable_days_management_api
- **Test Code:** [TC007_unavailable_days_management_api.py](./TC007_unavailable_days_management_api.py)
- **Test Error:** `AssertionError: Expected 201 Created but got 400` and `Failed to delete created unavailable day, status: 405`
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ff9c4b5c-c23b-479a-b642-c519dd848bbd/cae61c97-9079-426e-9c0a-ec63ee7b2305
- **Status:** ❌ Failed
- **Analysis / Findings:**
  - Creation failed with 400 Bad Request - likely missing required fields or invalid date format.
  - Deletion failed with 405 Method Not Allowed - the DELETE method may not be implemented for this endpoint, or the route structure is different.
  - **Recommendation:** 
    - Verify required fields for creating unavailable days (likely `unavailable_date` and possibly `is_confirmed`)
    - Check if DELETE is supported at `/api/unavailable-days/[date]` or if a different endpoint/method is needed
    - May require admin authentication

---

### Requirement 8: Health Insurance Management API
**Priority:** Medium  
**Category:** Functional

#### Test TC008: health_insurance_management_api
- **Test Code:** [TC008_health_insurance_management_api.py](./TC008_health_insurance_management_api.py)
- **Test Error:** `AssertionError: 'price' should be a number`
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ff9c4b5c-c23b-479a-b642-c519dd848bbd/2e0c1345-bdab-4db8-bed1-b45b2218f29d
- **Status:** ❌ Failed
- **Analysis / Findings:**
  - The health insurance API response contains a `price` field that is not a number (likely a string or null).
  - The test expects numeric price values but the API may return prices as strings (e.g., "$100" or "100.00") or the data source (`data/obras-sociales.json`) may have inconsistent formatting.
  - **Recommendation:** 
    - Review the health insurance data structure in `data/obras-sociales.json`
    - Update test to handle price as string or update API/data to ensure consistent numeric format
    - Consider normalizing price data type across the application

---

### Requirement 9: Push Notifications API
**Priority:** Medium  
**Category:** Functional

#### Test TC009: push_notifications_api
- **Test Code:** [TC009_push_notifications_api.py](./TC009_push_notifications_api.py)
- **Test Error:** `AssertionError: Subscription failed: 500 {"error":"Failed to save subscription"}`
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ff9c4b5c-c23b-479a-b642-c519dd848bbd/aa5ecd26-c7b3-46d5-ac5c-477b06c44e4b
- **Status:** ❌ Failed
- **Analysis / Findings:**
  - The push notification subscription endpoint (`/api/push/subscribe`) returned a 500 Internal Server Error.
  - Error message indicates database operation failed: "Failed to save subscription"
  - **Possible Causes:**
    - Database connection issue
    - Missing database table (`push_subscriptions`)
    - Invalid subscription payload format
    - Missing required fields in subscription object
  - **Recommendation:**
    - Verify database table exists and schema matches expected structure
    - Check database connection and permissions
    - Validate subscription payload includes required Web Push API fields: `endpoint`, `keys` (with `p256dh` and `auth`)
    - Review server logs for detailed error information

---

### Requirement 10: Rate Limiting API
**Priority:** Medium  
**Category:** Security

#### Test TC010: rate_limiting_api
- **Test Code:** [TC010_rate_limiting_api.py](./TC010_rate_limiting_api.py)
- **Test Error:** `AssertionError: JWT token not found in authentication response`
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ff9c4b5c-c23b-479a-b642-c519dd848bbd/e93c6423-84e6-4ed5-b29d-1b856c91f61d
- **Status:** ❌ Failed
- **Analysis / Findings:**
  - Test failed during prerequisite authentication step before testing rate limiting.
  - Same issue as TC003 - JWT token is in HTTP-only cookie, not response body.
  - **Recommendation:** Fix authentication helper function to extract token from cookies, then proceed with rate limiting test. Rate limiting is implemented using IP-based tracking with configurable limits per endpoint.

---

## 3️⃣ Coverage & Matching Metrics

- **0.00%** of tests passed (0/10)
- **100.00%** of tests failed (10/10)

| Requirement | Total Tests | ✅ Passed | ❌ Failed | Pass Rate |
|-------------|-------------|-----------|-----------|-----------|
| Patient Appointment Scheduling | 1 | 0 | 1 | 0% |
| Available Times Management | 1 | 0 | 1 | 0% |
| Admin Authentication | 1 | 0 | 1 | 0% |
| Patient Management | 1 | 0 | 1 | 0% |
| Appointment Cancellation | 1 | 0 | 1 | 0% |
| Work Schedule Management | 1 | 0 | 1 | 0% |
| Unavailable Days Management | 1 | 0 | 1 | 0% |
| Health Insurance Management | 1 | 0 | 1 | 0% |
| Push Notifications | 1 | 0 | 1 | 0% |
| Rate Limiting | 1 | 0 | 1 | 0% |
| **TOTAL** | **10** | **0** | **10** | **0%** |

### Test Coverage by Category:
- **Functional Tests:** 6 tests (0% pass rate)
- **Security Tests:** 3 tests (0% pass rate)
- **Error Handling Tests:** 1 test (0% pass rate)

---

## 4️⃣ Key Gaps / Risks

### 🔴 Critical Issues

1. **API Endpoint Path Mismatch**
   - **Risk:** High
   - **Issue:** Tests are calling incorrect API paths (missing `/api` prefix)
   - **Impact:** All API tests fail due to 404 errors
   - **Affected Tests:** TC002
   - **Action Required:** Update all test URLs to include `/api` prefix

2. **JWT Token Authentication Mismatch**
   - **Risk:** High
   - **Issue:** API uses HTTP-only cookies for JWT tokens, but tests expect tokens in response body
   - **Impact:** Authentication-dependent tests cannot proceed
   - **Affected Tests:** TC003, TC010, and potentially others requiring authentication
   - **Action Required:** Update test framework to handle HTTP-only cookies or modify API to support both methods

3. **Missing Test Data Validation**
   - **Risk:** Medium
   - **Issue:** Tests are not providing all required fields for API endpoints
   - **Impact:** Multiple tests fail with 400 Bad Request errors
   - **Affected Tests:** TC001, TC004, TC005, TC006, TC007
   - **Action Required:** Review API schemas and ensure test data includes all required fields

### 🟡 Medium Priority Issues

4. **Database Schema/Connection Issues**
   - **Risk:** Medium
   - **Issue:** Push notifications subscription fails to save to database
   - **Impact:** Push notification feature non-functional
   - **Affected Tests:** TC009
   - **Action Required:** Verify database table exists, check connection, review schema

5. **Data Type Inconsistencies**
   - **Risk:** Low
   - **Issue:** Health insurance price field type mismatch (string vs number)
   - **Impact:** Data validation failures
   - **Affected Tests:** TC008
   - **Action Required:** Standardize price data type across API and data sources

6. **HTTP Method Implementation Gaps**
   - **Risk:** Medium
   - **Issue:** DELETE method may not be implemented for some endpoints
   - **Impact:** CRUD operations incomplete
   - **Affected Tests:** TC007
   - **Action Required:** Verify and implement missing HTTP methods

### 🟢 Low Priority Issues

7. **Error Message Localization**
   - **Risk:** Low
   - **Issue:** Some error messages may not be in Spanish as expected
   - **Impact:** User experience inconsistency
   - **Action Required:** Review and localize all error messages

8. **Test Environment Configuration**
   - **Risk:** Low
   - **Issue:** Tests may require specific database state or environment variables
   - **Impact:** Tests may fail in different environments
   - **Action Required:** Document test prerequisites and setup requirements

### 📋 Recommended Immediate Actions

1. **Fix API Path Issues** (Priority: Critical)
   - Update all test URLs to use correct `/api` prefix
   - Verify all endpoint paths match Next.js App Router structure

2. **Fix Authentication Flow** (Priority: Critical)
   - Update test framework to extract JWT from HTTP-only cookies
   - Or create test-specific authentication endpoint that returns token in body
   - Ensure cookie handling is properly configured in test client

3. **Validate Test Data** (Priority: High)
   - Create comprehensive test data fixtures with all required fields
   - Document API request/response schemas
   - Add schema validation to tests

4. **Database Setup** (Priority: High)
   - Verify all required database tables exist
   - Run database migrations if needed
   - Check database connection configuration

5. **Review API Implementations** (Priority: Medium)
   - Verify all CRUD operations are implemented
   - Check HTTP method support for each endpoint
   - Ensure consistent error response formats

### 🎯 Success Criteria for Retesting

- [ ] All API endpoints accessible with correct paths
- [ ] Authentication flow works with cookie-based tokens
- [ ] All required fields validated and documented
- [ ] Database tables created and accessible
- [ ] Test data fixtures created for all scenarios
- [ ] At least 70% test pass rate achieved

---

**Report Generated:** 2026-01-19  
**Next Review:** After implementing critical fixes

