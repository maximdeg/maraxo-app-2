import requests

BASE_URL = "http://localhost:3000/api"
AUTH_CREDENTIALS = {"email": "maxim.degtiarev.dev@gmail.com", "password": "admin1234"}
TIMEOUT = 30

def test_admin_authentication_api():
    session = requests.Session()
    headers = {"Content-Type": "application/json"}

    token = None
    reset_token = None
    try:
        # 1. Login - POST /auth/login
        login_resp = session.post(
            f"{BASE_URL}/auth/login",
            json=AUTH_CREDENTIALS,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        assert "token" in login_data and isinstance(login_data["token"], str)
        token = login_data["token"]

        # Use Bearer token for subsequent protected requests
        auth_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        # 2. Verify token - GET /auth/verify
        verify_resp = session.get(
            f"{BASE_URL}/auth/verify",
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert verify_resp.status_code == 200, f"Token verification failed: {verify_resp.text}"
        verify_data = verify_resp.json()
        assert verify_data.get("valid") is True

        # 3. Initiate password reset - POST /auth/forgot-password
        forgot_password_payload = {"email": AUTH_CREDENTIALS["email"]}
        forgot_resp = session.post(
            f"{BASE_URL}/auth/forgot-password",
            json=forgot_password_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        # Should always respond with 200 or similar to not reveal email existence
        assert forgot_resp.status_code in (200, 202), f"Forgot password failed: {forgot_resp.text}"

        # Simulate retrieving reset token from email
        # Since no explicit API given, assume next step requires a reset token
        # For test, try to request password reset token via an endpoint if available
        # Here we skip actual token retrieval due to no PRD detail.
        #
        # For demonstration, we assume the reset token received in response for testing purposes:
        if forgot_resp.status_code == 200:
            forgot_data = forgot_resp.json()
            reset_token = forgot_data.get("resetToken")  # May or may not be present
        if not reset_token:
            # Cannot test reset-password endpoint without token, so skip reset-password test
            reset_token = None

        # 4. Reset password - POST /auth/reset-password (only if reset_token present)
        if reset_token:
            reset_password_payload = {
                "token": reset_token,
                "newPassword": "admin1234New!"
            }
            reset_resp = session.post(
                f"{BASE_URL}/auth/reset-password",
                json=reset_password_payload,
                headers=headers,
                timeout=TIMEOUT,
            )
            assert reset_resp.status_code == 200, f"Password reset failed: {reset_resp.text}"
            reset_data = reset_resp.json()
            assert reset_data.get("success") is True

        # 5. Access protected route example: GET /auth/verify
        protected_resp = session.get(
            f"{BASE_URL}/auth/verify",
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert protected_resp.status_code == 200, f"Access to protected route failed: {protected_resp.text}"

        # 6. Logout - POST /auth/logout
        logout_resp = session.post(
            f"{BASE_URL}/auth/logout",
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert logout_resp.status_code == 200, f"Logout failed: {logout_resp.text}"
        logout_data = logout_resp.json()
        assert logout_data.get("success") is True

        # 7. Verify token is invalid after logout - GET /auth/verify
        verify_after_logout = session.get(
            f"{BASE_URL}/auth/verify",
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        # Expect failure (401 Unauthorized or 403 Forbidden)
        assert verify_after_logout.status_code in (401, 403)

    finally:
        session.close()

test_admin_authentication_api()
