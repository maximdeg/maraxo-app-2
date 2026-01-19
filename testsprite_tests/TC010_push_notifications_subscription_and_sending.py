import requests

BASE_URL = "http://localhost:3000/api/push"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_push_notifications_subscription_and_sending():
    subscription_url = f"{BASE_URL}/subscribe"
    unsubscribe_url = f"{BASE_URL}/unsubscribe"
    send_url = f"{BASE_URL}/send"

    # Corrected subscription payload wrapped in 'subscription' key as expected by API
    subscription_payload = {
        "subscription": {
            "endpoint": "https://fcm.googleapis.com/fcm/send/fake_endpoint_id",
            "keys": {
                "p256dh": "BOr_fake_p256dh_key",
                "auth": "fake_auth_key"
            }
        },
        "userId": "test-user-123"
    }

    try:
        # Subscribe to push notifications
        resp_subscribe = requests.post(
            subscription_url,
            json=subscription_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert resp_subscribe.status_code in [200, 201], \
            f"Subscribe response status {resp_subscribe.status_code}, body: {resp_subscribe.text}"
        resp_subscribe_data = resp_subscribe.json()
        # Expect subscription id or confirmation
        assert "id" in resp_subscribe_data or resp_subscribe_data.get("success") is True, \
            f"Unexpected subscribe response content: {resp_subscribe.text}"

        # Test sending notification to the subscribed user
        # Using provided userId and a sample notification payload
        send_payload = {
            "userId": subscription_payload["userId"],
            "title": "Test Notification",
            "body": "This is a test push notification from automated tests.",
            "data": {"test_case": "TC010"}
        }

        resp_send = requests.post(
            send_url,
            json=send_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert resp_send.status_code == 200, f"Send notification failed: {resp_send.text}"
        send_resp_data = resp_send.json()
        # Expect success indicator
        assert send_resp_data.get("success") is True, f"Notification send response unexpected: {resp_send.text}"

        # Unsubscribe from push notifications
        resp_unsubscribe = requests.post(
            unsubscribe_url,
            json={"endpoint": subscription_payload["subscription"]["endpoint"]},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert resp_unsubscribe.status_code == 200, f"Unsubscribe failed: {resp_unsubscribe.text}"
        unsubscribe_data = resp_unsubscribe.json()
        assert unsubscribe_data.get("success") is True, f"Unsubscribe response unexpected: {resp_unsubscribe.text}"

        # Attempt sending notification after unsubscribe should fail or not send
        resp_send_after_unsub = requests.post(
            send_url,
            json=send_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        # The server may respond with success but measures report no recipient,
        # or respond with an error. Accept either 200 with success: false or 400+
        if resp_send_after_unsub.status_code == 200:
            data = resp_send_after_unsub.json()
            assert not data.get("success", True), "Notification sent after unsubscription, unexpected."
        else:
            assert resp_send_after_unsub.status_code in [400, 404], \
                f"Unexpected status code after unsubscribe: {resp_send_after_unsub.status_code}"

    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_push_notifications_subscription_and_sending()
