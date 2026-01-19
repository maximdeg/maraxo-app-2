import requests

BASE_URL = "http://localhost:3000/api"
USERNAME = "maxim.degtiarev.dev@gmail.com"
PASSWORD = "admin1234"
TIMEOUT = 30

def test_admin_authentication_and_authorization():
    session = requests.Session()
    try:
        # 1. Login (POST /auth/login)
        login_url = f"{BASE_URL}/auth/login"
        login_payload = {
            "username": USERNAME,
            "password": PASSWORD
        }
        login_headers = {
            "Content-Type": "application/json"
        }
        login_resp = session.post(login_url, json=login_payload, headers=login_headers, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        # JWT token should be issued in response, try flexible field names
        token = login_data.get("token") or login_data.get("jwt") or login_data.get("accessToken")
        assert token, "JWT token not present in login response"
        # Check if cookie for session or JWT is set (middleware checks cookies)
        assert any("set-cookie" in k.lower() for k in login_resp.headers), "No cookies set in login response"

        # 2. Access a protected route to verify authorization (GET /auth/verify)
        verify_url = f"{BASE_URL}/auth/verify"
        # Include cookies already stored in session
        verify_resp = session.get(verify_url, timeout=TIMEOUT)
        assert verify_resp.status_code == 200, f"Token verification failed: {verify_resp.text}"
        verify_data = verify_resp.json()
        # Adjusted assertion to check 'email' field matches USERNAME as per PRD user information
        assert verify_data.get("valid") is True or verify_data.get("authenticated") is True or verify_data.get("email") == USERNAME, "Token not verified or invalid user info returned"

        # 3. Password Reset Flow:
        # (a) Request password reset link/token (POST /auth/forgot-password)
        forgot_pwd_url = f"{BASE_URL}/auth/forgot-password"
        forgot_payload = {
            "email": USERNAME
        }
        forgot_resp = session.post(forgot_pwd_url, json=forgot_payload, headers=login_headers, timeout=TIMEOUT)
        # Password reset request usually returns 200 with message
        assert forgot_resp.status_code == 200, f"Forgot password request failed: {forgot_resp.text}"
        forgot_data = forgot_resp.json()
        # Expect some message or indication
        assert "message" in forgot_data or "success" in forgot_data, "Forgot password response missing confirmation"

        # NOTE: The actual reset password requires a token from email; we test the request only here.
        # (b) Optionally test reset-password endpoint with invalid or expired token for error handling (POST /auth/reset-password)
        reset_pwd_url = f"{BASE_URL}/auth/reset-password"
        reset_payload = {
            "token": "invalid-or-expired-token",
            "password": "newPassword1234!"
        }
        reset_resp = session.post(reset_pwd_url, json=reset_payload, headers=login_headers, timeout=TIMEOUT)
        # Expect failure due to token invalid
        assert reset_resp.status_code in (400, 401), "Reset password with invalid token should fail"
        reset_data = reset_resp.json()
        # Error message should be clear
        error_message = reset_data.get("error") or reset_data.get("message") or ""
        assert "invalid" in error_message.lower() or "expired" in error_message.lower(), "Clear error message expected for invalid token"

        # 4. Logout (POST /auth/logout)
        logout_url = f"{BASE_URL}/auth/logout"
        logout_resp = session.post(logout_url, timeout=TIMEOUT)
        assert logout_resp.status_code == 200, f"Logout failed: {logout_resp.text}"
        logout_data = logout_resp.json()
        # Expect logged out or success message
        assert logout_data.get("message") or logout_data.get("success") or "logged out" in str(logout_data).lower(), "Logout response did not confirm success"

        # 5. Access protected route after logout should fail (GET /auth/verify)
        post_logout_verify_resp = session.get(verify_url, timeout=TIMEOUT)
        # Should return 401 Unauthorized or 403 Forbidden
        assert post_logout_verify_resp.status_code in (401,403), "Token verification should fail after logout"
        post_logout_data = post_logout_verify_resp.json()
        error_msg = post_logout_data.get("error") or post_logout_data.get("message") or ""
        assert error_msg, "Error message expected after logout token verification fail"

    finally:
        session.close()

test_admin_authentication_and_authorization()
