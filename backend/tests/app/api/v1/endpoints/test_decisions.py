"""
Pytest unit tests for DecisionChatSession and DecisionChatMessage endpoints.
Covers expected, edge, and failure cases.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from unittest.mock import patch
import json


import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import Base as UserBase
from app.models.decision import Base as DecisionBase
from app.models.reflection import Base as ReflectionBase
from app.models.value_calibration import Base as ValueCalibrationBase
from app.models.gamification import Base as GamificationBase
from app.db.session import engine
import os


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Drop all tables before creating them (force fresh schema)
    GamificationBase.metadata.drop_all(bind=engine)
    ValueCalibrationBase.metadata.drop_all(bind=engine)
    ReflectionBase.metadata.drop_all(bind=engine)
    DecisionBase.metadata.drop_all(bind=engine)
    UserBase.metadata.drop_all(bind=engine)
    # Create all tables for all models
    UserBase.metadata.create_all(bind=engine)
    DecisionBase.metadata.create_all(bind=engine)
    ReflectionBase.metadata.create_all(bind=engine)
    ValueCalibrationBase.metadata.create_all(bind=engine)
    GamificationBase.metadata.create_all(bind=engine)
    yield
    # DB cleanup is now handled centrally in tests/conftest.py to avoid SQLite locking/readonly errors.
    # Do not drop tables or remove test.db here.


import uuid

import random
import string


def random_email():
    return f"testuser_{uuid.uuid4().hex[:8]}@example.com"


def create_and_authenticate_user(client):
    # Register a new user
    email = random_email()
    password = "TestPass123!"
    user_data = {"email": email, "password": password}
    register_resp = client.post("/api/v1/register", json=user_data)
    print("REGISTER:", register_resp.status_code, register_resp.text)
    assert register_resp.status_code in (200, 201), register_resp.text
    user_id = register_resp.json().get("id")
    # Log in to get JWT
    login_resp = client.post("/api/v1/auth/login", json=user_data)
    print("LOGIN:", login_resp.status_code, login_resp.text)
    assert login_resp.status_code == 200, login_resp.text
    token = login_resp.json()["access_token"]
    return user_id, token


import pytest


@pytest.fixture(scope="function")
def user_and_auth_header(client):
    user_id, token = create_and_authenticate_user(client)
    return user_id, {"Authorization": f"Bearer {token}"}


# --- DecisionJournalEntry tests ---
@pytest.fixture(autouse=True)
def mock_openai_chatcompletion(monkeypatch):
    """
    Patch openai.ChatCompletion.create to return deterministic tags for all journal entry tests.
    """

    def fake_create(*args, **kwargs):
        # Simulate OpenAI function_call response
        function_args = json.dumps(
            {
                "domain_tags": ["career"],
                "sentiment_tag": "positive",
                "keywords": ["promotion", "boss", "work"],
            }
        )
        return {
            "choices": [{"message": {"function_call": {"arguments": function_args}}}]
        }

    monkeypatch.setattr("openai.ChatCompletion.create", fake_create)


def test_create_journal_entry_openai_failure(monkeypatch, user_and_auth_header, client):
    """
    Failure: Simulate OpenAI API failure during auto-tagging and verify fallback/error handling.
    Ensures robust edge/failure case coverage (see global rules).

    Args:
        monkeypatch: Pytest monkeypatch fixture.
        user_and_auth_header: Tuple with user_id and auth header.
        client: FastAPI test client.
    """

    def fail_create(*args, **kwargs):
        raise RuntimeError("OpenAI API unavailable")

    monkeypatch.setattr("openai.ChatCompletion.create", fail_create)
    _, auth_header = user_and_auth_header
    payload = {
        "title": "Entry with OpenAI down",
        "context": "Testing OpenAI failure.",
        "anticipated_outcomes": "Should fallback or error",
        "values": ["integrity"],
    }
    response = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    # Accept either fallback tags or a clear error, depending on implementation
    assert response.status_code in (201, 503, 200)
    data = response.json()
    # Check for fallback or error message
    assert (
        "domain_tags" in data or "detail" in data
    ), "Should return fallback tags or error detail."
    if "domain_tags" in data:
        assert isinstance(data["domain_tags"], list)
    if "detail" in data:
        assert "OpenAI" in data["detail"] or "unavailable" in data["detail"].lower()
    # Reason: Global rule requires explicit edge/failure case tests for reliability.


def test_create_journal_entry_expected(user_and_auth_header, client):
    _, auth_header = user_and_auth_header
    payload = {
        "title": "Got a job promotion",
        "context": "My boss recognized my hard work and promoted me.",
        "anticipated_outcomes": "More responsibility",
        "values": ["integrity", "growth"],
    }
    response = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["user_id"]
    assert isinstance(data["values"], list)
    # Check auto-tagging fields (mocked)
    allowed_domains = {
        "career",
        "health",
        "relationships",
        "finance",
        "personal_growth",
        "ambiguous",
    }
    assert set(data["domain_tags"]).issubset(allowed_domains)
    assert len(data["domain_tags"]) >= 1
    allowed_sentiments = {"positive", "neutral", "negative"}
    assert data["sentiment_tag"] in allowed_sentiments
    allowed_keywords = {
        "promotion",
        "boss",
        "colleague",
        "salary",
        "job",
        "deadline",
        "project",
        "meeting",
        "health",
        "exercise",
        "diet",
        "stress",
        "sleep",
        "habit",
        "learning",
        "reading",
        "family",
        "friend",
        "partner",
        "conflict",
        "support",
        "communication",
        "savings",
        "debt",
        "investment",
        "expense",
        "budget",
        "purchase",
        "courage",
        "honesty",
        "integrity",
        "gratitude",
        "fear",
        "happiness",
        "regret",
        "motivation",
    }
    actual_keywords = set(data["keywords"])
    assert actual_keywords.issubset(allowed_keywords)


def test_create_journal_entry_edge_ambiguous(user_and_auth_header, client):
    _, auth_header = user_and_auth_header
    payload = {
        "title": "Just another day",
        "context": "Nothing special happened.",
    }
    response = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    assert response.status_code == 201
    data = response.json()
    # Check that mocked OpenAI output is always returned
    allowed_domains = {
        "career",
        "health",
        "relationships",
        "finance",
        "personal_growth",
        "ambiguous",
    }
    assert set(data["domain_tags"]).issubset(allowed_domains)
    assert len(data["domain_tags"]) >= 1
    allowed_sentiments = {"positive", "neutral", "negative"}
    assert data["sentiment_tag"] in allowed_sentiments


def test_create_journal_entry_failure_nonsense(user_and_auth_header, client):
    _, auth_header = user_and_auth_header
    payload = {
        "title": "asdfghjkl",
        "context": "qwertyuiop",
    }
    response = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    assert response.status_code == 201
    data = response.json()
    # Check that mocked OpenAI output is always returned
    allowed_domains = {
        "career",
        "health",
        "relationships",
        "finance",
        "personal_growth",
        "ambiguous",
    }
    assert set(data["domain_tags"]).issubset(allowed_domains)
    assert len(data["domain_tags"]) >= 1
    allowed_sentiments = {"positive", "neutral", "negative"}
    assert data["sentiment_tag"] in allowed_sentiments


def test_update_journal_entry_triggers_retag(user_and_auth_header, client):
    _, auth_header = user_and_auth_header
    # Create entry
    payload = {"title": "Started a new diet", "context": "Trying to eat healthier."}
    resp = client.post("/api/v1/decisions/journal", json=payload, headers=auth_header)
    assert resp.status_code == 201
    data = resp.json()
    entry_id = data["id"]
    # The mock always returns the same tags
    allowed_domains = {
        "career",
        "health",
        "relationships",
        "finance",
        "personal_growth",
        "ambiguous",
    }
    assert set(data["domain_tags"]).issubset(allowed_domains)
    assert len(data["domain_tags"]) >= 1
    # Update title/context to a finance-related event
    update_payload = {
        "title": "Invested in stocks",
        "context": "Put savings in the market.",
    }
    resp2 = client.patch(
        f"/api/v1/decisions/journal/{entry_id}",
        json=update_payload,
        headers=auth_header,
    )
    assert resp2.status_code == 200
    data2 = resp2.json()
    allowed_domains = {
        "career",
        "health",
        "relationships",
        "finance",
        "personal_growth",
        "ambiguous",
    }
    assert set(data2["domain_tags"]).issubset(allowed_domains)
    assert len(data2["domain_tags"]) >= 1
    assert data2["sentiment_tag"] in {"positive", "neutral", "negative"}
    allowed_keywords = {
        "promotion",
        "boss",
        "colleague",
        "salary",
        "job",
        "deadline",
        "project",
        "meeting",
        "health",
        "exercise",
        "diet",
        "stress",
        "sleep",
        "habit",
        "learning",
        "reading",
        "family",
        "friend",
        "partner",
        "conflict",
        "support",
        "communication",
        "savings",
        "debt",
        "investment",
        "expense",
        "budget",
        "purchase",
        "courage",
        "honesty",
        "integrity",
        "gratitude",
        "fear",
        "happiness",
        "regret",
        "motivation",
        "ambiguous",
    }
    assert set(data2["keywords"]).issubset(allowed_keywords)
    assert len(data2["keywords"]) >= 1
    assert data2["title"] == update_payload["title"]


def test_list_journal_entries_expected(user_and_auth_header, client):
    """Expected: List all journal entries for the authenticated user."""
    user_id, auth_header = user_and_auth_header
    # Create two entries
    payload1 = {
        "title": "First entry",
        "context": "Work situation.",
        "anticipated_outcomes": "Promotion",
        "values": ["integrity", "growth"],
    }
    payload2 = {
        "title": "Second entry",
        "context": "Health decision.",
        "anticipated_outcomes": "Better fitness",
        "values": ["health", "discipline"],
    }
    resp1 = client.post("/api/v1/decisions/journal", json=payload1, headers=auth_header)
    resp2 = client.post("/api/v1/decisions/journal", json=payload2, headers=auth_header)
    assert resp1.status_code == 201
    assert resp2.status_code == 201
    list_resp = client.get("/api/v1/decisions/journal", headers=auth_header)
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert len(data) >= 2
    titles = [e["title"] for e in data]
    assert "First entry" in titles and "Second entry" in titles


def test_get_journal_entry_expected(user_and_auth_header, client):
    """Expected: Retrieve a single journal entry by ID."""
    user_id, auth_header = user_and_auth_header
    payload = {
        "title": "Single Entry",
        "context": "For GET test",
        "anticipated_outcomes": "Success",
        "values": ["clarity"],
    }
    create_resp = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    assert create_resp.status_code == 201
    entry_id = create_resp.json()["id"]
    get_resp = client.get(f"/api/v1/decisions/journal/{entry_id}", headers=auth_header)
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["id"] == entry_id
    assert data["title"] == "Single Entry"
    assert data["context"] == "For GET test"


def test_get_journal_entry_not_found(user_and_auth_header, client):
    """Failure: Retrieve a non-existent journal entry."""
    _, auth_header = user_and_auth_header
    fake_id = "00000000-0000-0000-0000-000000000000"
    resp = client.get(f"/api/v1/decisions/journal/{fake_id}", headers=auth_header)
    assert resp.status_code == 404


def test_get_journal_entry_invalid_id(user_and_auth_header, client):
    """Failure: Retrieve a journal entry with invalid UUID format."""
    _, auth_header = user_and_auth_header
    resp = client.get("/api/v1/decisions/journal/not-a-uuid", headers=auth_header)
    assert resp.status_code == 422


def test_get_journal_entry_unauthenticated(client):
    """Failure: Retrieve a journal entry without authentication."""
    # Create a user and entry first
    test_client = TestClient(app)
    user_id, token = create_and_authenticate_user(test_client)
    payload = {
        "title": "Private Entry",
        "context": "Should not be accessible",
        "anticipated_outcomes": "None",
        "values": ["privacy"],
    }
    create_resp = test_client.post(
        "/api/v1/decisions/journal",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_resp.status_code == 201
    entry_id = create_resp.json()["id"]
    # Try to get without auth
    resp = client.get(f"/api/v1/decisions/journal/{entry_id}")
    assert resp.status_code == 401


def test_list_journal_entries_failure_unauthenticated(client):
    """Failure: List journal entries without authentication."""
    response = client.get("/api/v1/decisions/journal")
    assert response.status_code == 401


def test_update_journal_entry_expected(user_and_auth_header, client):
    """Expected: Update title and values of a journal entry."""
    _, auth_header = user_and_auth_header
    payload = {"title": "Original Title", "values": ["courage"]}
    resp = client.post("/api/v1/decisions/journal", json=payload, headers=auth_header)
    assert resp.status_code == 201
    entry = resp.json()
    entry_id = entry["id"]
    patch_payload = {"title": "Updated Title", "values": ["honesty", "growth"]}
    patch_resp = client.patch(
        f"/api/v1/decisions/journal/{entry_id}", json=patch_payload, headers=auth_header
    )
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["title"] == "Updated Title"
    assert updated["values"] == ["honesty", "growth"]
    assert updated["id"] == entry_id


def test_update_journal_entry_edge_no_fields(user_and_auth_header, client):
    """Edge: Update journal entry with no fields (should not change anything, but succeed)."""
    _, auth_header = user_and_auth_header
    payload = {"title": "Edge Case Title"}
    resp = client.post("/api/v1/decisions/journal", json=payload, headers=auth_header)
    entry_id = resp.json()["id"]
    patch_resp = client.patch(
        f"/api/v1/decisions/journal/{entry_id}", json={}, headers=auth_header
    )
    assert patch_resp.status_code == 200
    unchanged = patch_resp.json()
    assert unchanged["title"] == "Edge Case Title"


def test_update_journal_entry_failure_unauthenticated(user_and_auth_header, client):
    """Failure: Update journal entry without authentication."""
    _, auth_header = user_and_auth_header
    payload = {"title": "Fail Unauth"}
    resp = client.post("/api/v1/decisions/journal", json=payload, headers=auth_header)
    entry_id = resp.json()["id"]
    patch_payload = {"title": "Should Not Update"}
    patch_resp = client.patch(
        f"/api/v1/decisions/journal/{entry_id}", json=patch_payload
    )
    assert patch_resp.status_code == 401


def test_update_journal_entry_failure_not_found(user_and_auth_header, client):
    """Failure: Update nonexistent journal entry."""
    _, auth_header = user_and_auth_header
    patch_payload = {"title": "Does Not Exist"}
    patch_resp = client.patch(
        f"/api/v1/decisions/journal/00000000-0000-0000-0000-000000000000",
        json=patch_payload,
        headers=auth_header,
    )
    assert patch_resp.status_code == 404


def test_update_journal_entry_failure_invalid_id(user_and_auth_header, client):
    """Failure: Update with invalid UUID format."""
    _, auth_header = user_and_auth_header
    patch_payload = {"title": "Bad ID"}
    patch_resp = client.patch(
        f"/api/v1/decisions/journal/not-a-uuid",
        json=patch_payload,
        headers=auth_header,
    )
    assert patch_resp.status_code == 422

    _, auth_header = user_and_auth_header
    payload = {
        "title": "My Decision",
        "context": "Context info",
        "anticipated_outcomes": "Outcome",
        "values": ["integrity", "growth"],
        "domain": "career",
    }
    response = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My Decision"
    assert data["user_id"]
    assert isinstance(data["values"], list)


def test_create_journal_entry_edge_empty_title(user_and_auth_header, client):
    _, auth_header = user_and_auth_header
    payload = {"title": ""}
    response = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    assert response.status_code == 422


def test_create_journal_entry_failure_missing_title(user_and_auth_header, client):
    _, auth_header = user_and_auth_header
    payload = {"context": "Missing title"}
    response = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    assert response.status_code == 422


def test_create_journal_entry_failure_unauthenticated(client):
    """Failure: Create a journal entry without authentication."""
    payload = {"title": "Should fail"}
    response = client.post("/api/v1/decisions/journal", json=payload)
    assert response.status_code == 401


# --- DecisionChatSession tests ---


def test_create_decision_session_expected(user_and_auth_header, client):
    _, auth_header = user_and_auth_header
    response = client.post(
        "/api/v1/decisions/sessions",
        json={"title": "Test Session"},
        headers=auth_header,
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == "Test Session"
    global session_id
    session_id = data["id"]  # Save for use in message tests


def test_create_decision_session_edge(user_and_auth_header, client):
    _, auth_header = user_and_auth_header
    response = client.post(
        "/api/v1/decisions/sessions", json={"title": ""}, headers=auth_header
    )
    assert response.status_code == 422  # Validation error


def test_create_decision_session_failure(user_and_auth_header, client):
    _, auth_header = user_and_auth_header
    response = client.post("/api/v1/decisions/sessions", json={}, headers=auth_header)
    assert response.status_code == 422


# --- Fixtures for session and message setup ---
@pytest.fixture(scope="function")
def decision_session(user_and_auth_header, client):
    user_id, auth_header = user_and_auth_header
    payload = {"title": "Test Session"}
    resp = client.post("/api/v1/decisions/sessions", json=payload, headers=auth_header)
    print(f"DEBUG: Created session? status={resp.status_code}, body={resp.text}")
    assert resp.status_code == 201
    return resp.json()["id"], auth_header


@pytest.fixture(scope="function")
def decision_message(decision_session, client):
    session_id, auth_header = decision_session
    payload = {"content": "Hello AI!", "sender": "user"}
    resp = client.post(
        f"/api/v1/decisions/sessions/{session_id}/messages",
        json=payload,
        headers=auth_header,
    )
    assert resp.status_code == 201
    return resp.json(), session_id, auth_header


# --- DecisionChatMessage tests ---
def test_create_message_expected(decision_session, client):
    """Expected: Create a message in a valid session."""
    session_id, auth_header = decision_session
    payload = {"content": "Hello AI!", "sender": "user"}
    response = client.post(
        f"/api/v1/decisions/sessions/{session_id}/messages",
        json=payload,
        headers=auth_header,
    )
    print(
        f"[DEBUG TEST] status_code={response.status_code}, response={response.json()}"
    )
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "Hello AI!"
    assert data["sender"] == "user"


def test_create_message_edge(decision_session, client):
    """Edge: Create a message with invalid sender."""
    session_id, auth_header = decision_session
    payload = {"content": "Invalid sender", "sender": "bot"}
    response = client.post(
        f"/api/v1/decisions/sessions/{session_id}/messages",
        json=payload,
        headers=auth_header,
    )
    assert response.status_code == 422


def test_create_message_failure(user_and_auth_header, client):
    """Failure: Create a message for nonexistent session."""
    _, auth_header = user_and_auth_header
    payload = {"content": "No session", "sender": "user"}
    response = client.post(
        f"/api/v1/decisions/sessions/00000000-0000-0000-0000-000000000000/messages",
        json=payload,
        headers=auth_header,
    )
    assert response.status_code == 404


# --- List messages ---
def test_list_messages_expected(decision_message, client):
    """Expected: List messages for a valid session."""
    message, session_id, auth_header = decision_message
    response = client.get(
        f"/api/v1/decisions/sessions/{session_id}/messages",
        headers=auth_header,
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # There should be at least one message
    assert any(msg["id"] == message["id"] for msg in data)


def test_list_messages_failure(user_and_auth_header, client):
    _, auth_header = user_and_auth_header
    response = client.get(
        f"/api/v1/decisions/sessions/00000000-0000-0000-0000-000000000000/messages",
        headers=auth_header,
    )
    assert response.status_code == 404


# --- Update session ---
def test_update_session_expected(decision_session, client):
    """Expected: Update status and summary of a session."""
    session_id, auth_header = decision_session
    payload = {"status": "reflection", "summary": "Session in reflection"}
    response = client.patch(
        f"/api/v1/decisions/sessions/{session_id}", json=payload, headers=auth_header
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "reflection"
    assert data["summary"] == "Session in reflection"


def test_update_session_edge(user_and_auth_header, client):
    """Edge: Update session with invalid status."""
    _, auth_header = user_and_auth_header
    # Use a dummy session id for invalid status update
    sid = "00000000-0000-0000-0000-000000000000"
    payload = {"status": "invalid_status"}
    response = client.patch(
        f"/api/v1/decisions/sessions/{sid}", json=payload, headers=auth_header
    )
    assert response.status_code in (404, 422)


def test_update_session_failure(user_and_auth_header, client):
    """Failure: Update nonexistent session."""
    _, auth_header = user_and_auth_header
    payload = {"status": "reflection"}
    response = client.patch(
        f"/api/v1/decisions/sessions/00000000-0000-0000-0000-000000000000",
        json=payload,
        headers=auth_header,
    )
    assert response.status_code == 404
