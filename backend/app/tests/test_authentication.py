# AI assistance (2026-08-30): OpenAI Codex helped create these authentication
# and CORS regression tests.

from app.routes import authentication
from app.tests.helpers import signup_user


def test_protected_endpoint_requires_authentication(client):
    response = client.get("/analyses")

    assert response.status_code == 401


def test_signup_login_and_logout_use_http_only_cookie(client):
    signup_response = signup_user(client, "alice", "alice@example.com")

    assert signup_response.status_code == 200
    assert "password" not in signup_response.text

    cookie_header = signup_response.headers["set-cookie"]
    assert "HttpOnly" in cookie_header
    assert "SameSite=lax" in cookie_header
    assert "Max-Age=" in cookie_header

    assert client.get("/analyses").status_code == 200

    logout_response = client.post("/logout")

    assert logout_response.status_code == 200
    assert client.get("/analyses").status_code == 401

    failed_login = client.post(
        "/login",
        data={"username": "alice", "password": "wrong-password"},
    )
    assert failed_login.status_code == 401

    login_response = client.post(
        "/login",
        data={
            "username": "alice",
            "password": "correct-horse-battery-staple",
        },
    )
    assert login_response.status_code == 200
    assert client.get("/analyses").status_code == 200


def test_signup_does_not_expose_internal_exception(client, monkeypatch):
    def fail_to_create_user(*args, **kwargs):
        raise RuntimeError("database password and internal host")

    monkeypatch.setattr(authentication, "create_user", fail_to_create_user)

    response = signup_user(client, "broken", "broken@example.com")

    assert response.status_code == 500
    assert response.json() == {"detail": "Could not create user"}
    assert "internal host" not in response.text


def test_signup_rejects_short_password(client):
    response = client.post(
        "/signup",
        json={
            "first_name": "Test",
            "last_name": "User",
            "username": "shortpass",
            "email": "short@example.com",
            "password": "short",
        },
    )

    assert response.status_code == 422


def test_logout_also_clears_an_invalid_or_expired_cookie(client):
    client.cookies.set("access_token", "invalid-token")

    response = client.post("/logout")

    assert response.status_code == 200
    cookie_header = response.headers["set-cookie"]
    assert "access_token=" in cookie_header
    assert "Max-Age=0" in cookie_header


def test_cors_only_allows_configured_frontend(client):
    allowed = client.options(
        "/login",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert allowed.headers["access-control-allow-credentials"] == "true"

    denied = client.options(
        "/login",
        headers={
            "Origin": "https://attacker.example",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert denied.status_code == 400
    assert "access-control-allow-origin" not in denied.headers
