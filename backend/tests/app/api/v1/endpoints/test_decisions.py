"""
Pytest unit tests for DecisionChatSession and DecisionChatMessage endpoints.
Covers expected, edge, and failure cases.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db


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
    # Drop all tables after tests (optional, for clean state)
    GamificationBase.metadata.drop_all(bind=engine)
    ValueCalibrationBase.metadata.drop_all(bind=engine)
    ReflectionBase.metadata.drop_all(bind=engine)
    DecisionBase.metadata.drop_all(bind=engine)
    UserBase.metadata.drop_all(bind=engine)


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
def test_create_journal_entry_expected(user_and_auth_header, client):
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
