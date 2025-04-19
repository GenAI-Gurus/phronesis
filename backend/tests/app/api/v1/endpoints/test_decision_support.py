import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Mock user authentication dependency for testing
app.dependency_overrides = {}
from app.core.security import get_current_user
import pytest

import uuid


@pytest.fixture(autouse=True)
def mock_auth():
    class DummyUser:
        id = uuid.uuid4()
        email = "test@example.com"
        is_active = True
        is_superuser = False

    app.dependency_overrides[get_current_user] = lambda: DummyUser()
    yield
    app.dependency_overrides = {}


def test_decision_support_chat_expected(monkeypatch):
    # Mock OpenAI to simulate a successful AI response
    class MockOpenAIChatCompletion:
        @staticmethod
        def create(*args, **kwargs):
            class Choice:
                message = {"content": "Here's an AI suggestion."}

            return type("Resp", (), {"choices": [Choice()]})

    import sys

    sys.modules["openai"].ChatCompletion = MockOpenAIChatCompletion
    payload = {
        "messages": [{"role": "user", "content": "I'm struggling with a big decision."}]
    }
    response = client.post("/api/v1/decision-support/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    # suggestions may be None or a list (depending on AI output)


def test_decision_support_chat_fallback(monkeypatch):
    # Simulate OpenAI error to test fallback
    class MockOpenAIChatCompletion:
        @staticmethod
        def create(*args, **kwargs):
            raise Exception("OpenAI error")

    import sys

    sys.modules["openai"].ChatCompletion = MockOpenAIChatCompletion
    payload = {"messages": [{"role": "user", "content": "Fallback test."}]}
    response = client.post("/api/v1/decision-support/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert isinstance(data["suggestions"], list)


def test_decision_support_chat_edge_missing_messages():
    payload = {"messages": []}
    response = client.post("/api/v1/decision-support/chat", json=payload)
    assert response.status_code == 400


def test_decision_support_chat_failure_last_not_user():
    payload = {"messages": [{"role": "ai", "content": "Hi, how can I help?"}]}
    response = client.post("/api/v1/decision-support/chat", json=payload)
    assert response.status_code == 400
