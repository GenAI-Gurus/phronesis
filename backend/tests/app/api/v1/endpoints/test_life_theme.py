import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import Base as UserBase
from app.db.session import engine
import uuid

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    UserBase.metadata.create_all(bind=engine)
    yield
    # DB cleanup handled in conftest.py


@pytest.fixture
def auth_header():
    email = f"theme_{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPass123!"
    reg = client.post("/api/v1/register", json={"email": email, "password": password})
    assert reg.status_code in (200, 201)
    login = client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_set_and_get_life_theme(auth_header):
    payload = {"theme_text": "Growth through challenge"}
    resp = client.post("/api/v1/life-theme", json=payload, headers=auth_header)
    assert resp.status_code == 201
    data = resp.json()
    assert data["theme_text"] == payload["theme_text"]
    assert "created_at" in data and "updated_at" in data
    # Now fetch
    get_resp = client.get("/api/v1/life-theme", headers=auth_header)
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert get_data["theme_text"] == payload["theme_text"]


def test_life_theme_requires_auth():
    resp = client.get("/api/v1/life-theme")
    assert resp.status_code == 401
    resp2 = client.post("/api/v1/life-theme", json={"theme_text": "Purpose"})
    assert resp2.status_code == 401


def test_life_theme_empty_theme(auth_header):
    resp = client.post(
        "/api/v1/life-theme", json={"theme_text": ""}, headers=auth_header
    )
    assert resp.status_code == 422


def test_life_theme_multiple_sets(auth_header):
    first = client.post(
        "/api/v1/life-theme", json={"theme_text": "First Theme"}, headers=auth_header
    )
    second = client.post(
        "/api/v1/life-theme", json={"theme_text": "Second Theme"}, headers=auth_header
    )
    assert first.status_code == 201
    assert second.status_code == 201
    # Should return the latest theme
    get_resp = client.get("/api/v1/life-theme", headers=auth_header)
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert get_data["theme_text"] == "Second Theme"
