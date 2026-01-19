import requests

BASE_URL = "http://localhost:3000/admin"
LOGIN_URL = "http://localhost:3000/api/auth/login"
USERNAME = "maxim.degtiarev.dev@gmail.com"
PASSWORD = "admin1234"
TIMEOUT = 30


def test_rate_limiting_api():
    headers = {
        "Accept": "application/json"
    }

    # Authenticate to get JWT token
    login_payload = {
        "email": USERNAME,
        "password": PASSWORD
    }

    login_response = requests.post(LOGIN_URL, json=login_payload, headers={"Accept": "application/json"}, timeout=TIMEOUT)
    assert login_response.status_code == 200, f"Login failed with status code {login_response.status_code}"
    json_response = login_response.json()
    token = json_response.get("token") or json_response.get("access_token")
    assert token is not None, "No token found in login response"

    auth_headers = headers.copy()
    auth_headers["Authorization"] = f"Bearer {token}"

    test_endpoint = f"{BASE_URL}/work-schedule"

    success_responses = 0
    rate_limit_responses = 0
    other_error_responses = 0

    total_requests = 20

    for _ in range(total_requests):
        try:
            response = requests.get(test_endpoint, headers=auth_headers, timeout=TIMEOUT)
            if response.status_code == 200:
                success_responses += 1
            elif response.status_code == 429:
                rate_limit_responses += 1
            else:
                other_error_responses += 1
        except requests.RequestException:
            other_error_responses += 1

    assert success_responses > 0, "No successful responses received, legitimate users may be blocked."
    assert rate_limit_responses > 0, "Rate limiting was not enforced, no 429 responses received."
    assert other_error_responses == 0, f"Unexpected errors occurred during requests: {other_error_responses}"


test_rate_limiting_api()
