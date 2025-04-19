import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.future_self import FutureSelfSimulationRequest
from app.models.user import Base as UserBase
from app.db.session import engine

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    UserBase.metadata.create_all(bind=engine)
    yield
    # DB cleanup is handled centrally in conftest.py


@pytest.fixture
def auth_header():
    # Minimal user registration/login flow for test auth
    email = f"future_{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPass123!"
    reg = client.post("/api/v1/register", json={"email": email, "password": password})
    assert reg.status_code in (200, 201)
    login = client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_simulate_future_self_expected(auth_header, monkeypatch):
    # Mock OpenAI to simulate a successful AI response
    class MockOpenAIChatCompletion:
        @staticmethod
        def create(*args, **kwargs):
            class Choice:
                message = {
                    "content": "In 5 years, you will have grown. Suggestions:\n- Network\n- Learn finance"
                }

            return type("Resp", (), {"choices": [Choice()]})

    import sys

    sys.modules["openai"].ChatCompletion = MockOpenAIChatCompletion
    payload = {
        "decision_context": "Should I start my own company?",
        "values": ["growth", "independence"],
        "time_horizon": "5 years",
    }
    resp = client.post(
        "/api/v1/future-self/simulate", json=payload, headers=auth_header
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "future_projection" in data
    assert data["ai_generated"] is True
    assert isinstance(data["suggestions"], list)


def test_simulate_future_self_fallback(monkeypatch, auth_header):
    # Simulate OpenAI error to test fallback
    class MockOpenAIChatCompletion:
        @staticmethod
        def create(*args, **kwargs):
            raise Exception("OpenAI error")

    import sys

    sys.modules["openai"].ChatCompletion = MockOpenAIChatCompletion
    payload = {"decision_context": "Should I move abroad?"}
    resp = client.post(
        "/api/v1/future-self/simulate", json=payload, headers=auth_header
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["ai_generated"] is False
    assert "future_projection" in data
    assert isinstance(data["suggestions"], list)


def test_simulate_future_self_edge_minimal(auth_header):
    payload = {"decision_context": "Should I move abroad?"}
    resp = client.post(
        "/api/v1/future-self/simulate", json=payload, headers=auth_header
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["future_projection"]
    assert isinstance(data["ai_generated"], bool)


def test_simulate_future_self_failure_unauthenticated():
    payload = {"decision_context": "Should I move abroad?"}
    resp = client.post("/api/v1/future-self/simulate", json=payload)
    assert resp.status_code == 401


def test_simulate_future_self_failure_invalid_payload(auth_header):
    # Missing required field
    resp = client.post("/api/v1/future-self/simulate", json={}, headers=auth_header)
    assert resp.status_code == 422
