"""
Pytest API tests for Value Calibration endpoints.
Covers expected, edge, and failure cases.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import Base as UserBase
from app.models.value_calibration import Base as ValueCalibrationBase
from app.db.session import engine


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    UserBase.metadata.create_all(bind=engine)
    ValueCalibrationBase.metadata.create_all(bind=engine)
    yield
    UserBase.metadata.drop_all(bind=engine)
    ValueCalibrationBase.metadata.drop_all(bind=engine)


client = TestClient(app)

import uuid


@pytest.fixture(scope="module")
def auth_header():
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPass123!"
    reg = client.post("/api/v1/register", json={"email": email, "password": password})
    assert reg.status_code in (200, 201)
    login = client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_checkin_expected(auth_header):
    payload = {"value_snapshot": '{"courage": 7, "honesty": 8}'}
    resp = client.post(
        "/api/v1/value-calibration/checkins", json=payload, headers=auth_header
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["value_snapshot"] == payload["value_snapshot"]
    assert "id" in data and "user_id" in data


def test_list_checkins_expected(auth_header):
    resp = client.get("/api/v1/value-calibration/checkins", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any("courage" in c["value_snapshot"] for c in data)


def test_create_checkin_edge_empty_snapshot(auth_header):
    payload = {"value_snapshot": "{}"}
    resp = client.post(
        "/api/v1/value-calibration/checkins", json=payload, headers=auth_header
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["value_snapshot"] == "{}"


def test_create_checkin_failure_unauthenticated():
    payload = {"value_snapshot": '{"courage": 7}'}
    resp = client.post("/api/v1/value-calibration/checkins", json=payload)
    assert resp.status_code == 401


def test_create_checkin_failure_missing_snapshot(auth_header):
    resp = client.post(
        "/api/v1/value-calibration/checkins", json={}, headers=auth_header
    )
    assert resp.status_code == 422
