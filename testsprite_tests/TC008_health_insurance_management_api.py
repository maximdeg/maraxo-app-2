import requests

def test_health_insurance_management_api():
    base_url = "http://localhost:3000"
    endpoint = f"{base_url}/api/health-insurance"
    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.get(endpoint, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Assert status code is 200 OK
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate that data is a list (array) of health insurance options
    assert isinstance(data, list), "Expected response to be a list"

    # Each item should be a dict with required keys
    required_keys = {"id", "name", "pricing"}
    for item in data:
        assert isinstance(item, dict), "Each health insurance item should be a dict"
        missing_keys = required_keys - item.keys()
        assert not missing_keys, f"Missing keys in item: {missing_keys}"
        # Validate id is non-empty string or int
        assert isinstance(item["id"], (str, int)) and item["id"], "Invalid 'id' value"
        # Validate name is non-empty string
        assert isinstance(item["name"], str) and item["name"].strip(), "Invalid 'name' value"
        # Validate pricing is a dict with numeric values
        pricing = item["pricing"]
        assert isinstance(pricing, dict), "'pricing' should be a dictionary"
        for price_key, price_value in pricing.items():
            assert isinstance(price_value, (int, float)), f"Pricing value for '{price_key}' is not numeric"

test_health_insurance_management_api()
