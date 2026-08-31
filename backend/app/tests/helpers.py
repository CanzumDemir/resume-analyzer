# AI assistance (2026-08-30): OpenAI Codex helped create these small test
# helpers for authentication setup.

from fastapi.testclient import TestClient


def signup_user(client: TestClient, username: str, email: str):
    return client.post(
        "/signup",
        json={
            "first_name": "Test",
            "last_name": "User",
            "username": username,
            "email": email,
            "password": "correct-horse-battery-staple",
        },
    )
