import requests
import json

BASE_URL = "http://localhost:3000/api/push"

HEADERS = {
    "Content-Type": "application/json",
}

def test_push_notifications_api():
    subscription_endpoint = f"{BASE_URL}/subscribe"
    unsubscribe_endpoint = f"{BASE_URL}/unsubscribe"
    send_endpoint = f"{BASE_URL}/send"

    # Sample subscription payload simulating a browser's push subscription object
    subscription_payload = {
        "subscription": {
            "endpoint": "https://fcm.googleapis.com/fcm/send/fake-endpoint-for-testing",
            "expirationTime": None,
            "keys": {
                "p256dh": "BM8CfaZUPPyEKx6UQjxdsqAS5yBJRZxWly5XnOv5l5SWrmn5Z_LcVZHFxDrF4ph3e6_yEwh0y96k1vQ-_UsThR_8",
                "auth": "NPNcWITmZcShpnlY_fI03A"
            }
        }
    }

    # Subscribe user for push notifications
    response_subscribe = requests.post(
        subscription_endpoint,
        headers=HEADERS,
        data=json.dumps(subscription_payload),
        timeout=30
    )
    assert response_subscribe.status_code in (200, 201), \
        f"Subscribe request failed with status {response_subscribe.status_code}, response: {response_subscribe.text}"
    subscribe_resp_json = response_subscribe.json()
    assert 'id' in subscribe_resp_json or 'subscription' in subscribe_resp_json, \
        "Subscribe response missing subscription confirmation"

    # Sending a push notification to the subscribed user
    notification_payload = {
        "subscription": subscription_payload["subscription"],
        "notification": {
            "title": "Test Notification",
            "body": "This is a test push notification from automated test.",
            "icon": "/icons/icon-192x192.png",
            "vibrate": [100, 50, 100],
            "data": {"url": "https://localhost:3000/"},
            "actions": [
                {"action": "open_url", "title": "Open App"}
            ]
        }
    }

    response_send = requests.post(
        send_endpoint,
        headers=HEADERS,
        data=json.dumps(notification_payload),
        timeout=30
    )
    assert response_send.status_code in (200, 201), \
        f"Send notification failed with status {response_send.status_code}, response: {response_send.text}"

    # Unsubscribe / remove the subscription to clean up
    try:
        response_unsubscribe = requests.post(
            unsubscribe_endpoint,
            headers=HEADERS,
            data=json.dumps(subscription_payload),
            timeout=30
        )
        assert response_unsubscribe.status_code in (200, 204), \
            f"Unsubscribe request failed with status {response_unsubscribe.status_code}, response: {response_unsubscribe.text}"
    except Exception as e:
        # If unsubscribe fails, log but do not fail the test here
        print(f"Unsubscribe cleanup failed: {e}")


test_push_notifications_api()
