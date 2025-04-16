"""
Pytest unit tests for DecisionChatSession and DecisionChatMessage endpoints.
Covers expected, edge, and failure cases.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import Base as UserBase
from app.models.decision import Base as DecisionBase
from app.models.reflection import Base as ReflectionBase
from app.models.value_calibration import Base as ValueCalibrationBase
from app.models.gamification import Base as GamificationBase
from app.db.session import engine


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
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


def create_and_authenticate_user():
    # Register a new user
    email = random_email()
    password = "TestPass123!"
    user_data = {"email": email, "password": password}
    register_resp = client.post("/api/v1/register", json=user_data)
    assert register_resp.status_code in (200, 201), register_resp.text
    # Log in to get JWT
    login_resp = client.post("/api/v1/auth/login", json=user_data)
    assert login_resp.status_code == 200, login_resp.text
    token = login_resp.json()["access_token"]
    return token


import pytest


@pytest.fixture(scope="module")
def auth_header():
    token = create_and_authenticate_user()
    return {"Authorization": f"Bearer {token}"}


# --- DecisionJournalEntry tests ---
def test_create_journal_entry_expected(auth_header):
    """Expected: Create a journal entry with valid data."""
    payload = {
        "title": "My Decision",
        "context": "Context info",
        "anticipated_outcomes": "Outcome",
        "values": ["integrity", "growth"],
        "domain": "career"
    }
    response = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My Decision"
    assert data["user_id"]
    assert isinstance(data["values"], list)

def test_create_journal_entry_edge_empty_title(auth_header):
    """Edge: Create a journal entry with empty title."""
    payload = {"title": ""}
    response = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    assert response.status_code == 422

def test_create_journal_entry_failure_missing_title(auth_header):
    """Failure: Create a journal entry with missing title field."""
    payload = {"context": "Missing title"}
    response = client.post(
        "/api/v1/decisions/journal", json=payload, headers=auth_header
    )
    assert response.status_code == 422

def test_create_journal_entry_failure_unauthenticated():
    """Failure: Create a journal entry without authentication."""
    payload = {"title": "Should fail"}
    response = client.post(
        "/api/v1/decisions/journal", json=payload
    )
    assert response.status_code == 401

# --- DecisionChatSession tests ---
def test_create_decision_session_expected(auth_header):
    """Expected: Create a session with valid data."""
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


def test_create_decision_session_edge(auth_header):
    """Edge: Create a session with empty title."""
    response = client.post(
        "/api/v1/decisions/sessions", json={"title": ""}, headers=auth_header
    )
    assert response.status_code == 422  # Validation error


def test_create_decision_session_failure(auth_header):
    """Failure: Create a session with missing title field."""
    response = client.post("/api/v1/decisions/sessions", json={}, headers=auth_header)
    assert response.status_code == 422


# --- DecisionChatMessage tests ---
def test_create_message_expected(auth_header):
    """Expected: Create a message in a valid session."""
    # Use session_id from previous test, or create one if needed
    sid = globals().get("session_id")
    if not sid:
        resp = client.post(
            "/api/v1/decisions/sessions",
            json={"title": "Msg Session"},
            headers=auth_header,
        )
        sid = resp.json()["id"]
    payload = {"content": "Hello AI!", "sender": "user"}
    response = client.post(
        f"/api/v1/decisions/sessions/{sid}/messages", json=payload, headers=auth_header
    )
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "Hello AI!"
    assert data["sender"] == "user"
    global message_id
    message_id = data["id"]
    globals()["session_id"] = sid


def test_create_message_edge(auth_header):
    """Edge: Create a message with invalid sender."""
    sid = globals().get("session_id")
    payload = {"content": "Invalid sender", "sender": "bot"}
    response = client.post(
        f"/api/v1/decisions/sessions/{sid}/messages", json=payload, headers=auth_header
    )
    assert response.status_code == 422


def test_create_message_failure(auth_header):
    """Failure: Create a message for nonexistent session."""
    payload = {"content": "No session", "sender": "user"}
    response = client.post(
        f"/api/v1/decisions/sessions/00000000-0000-0000-0000-000000000000/messages",
        json=payload,
        headers=auth_header,
    )
    assert response.status_code == 404


# --- List messages ---
def test_list_messages_expected(auth_header):
    """Expected: List messages for a valid session."""
    sid = globals().get("session_id")
    response = client.get(
        f"/api/v1/decisions/sessions/{sid}/messages", headers=auth_header
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # There should be at least one message
    assert any(msg["id"] == globals().get("message_id") for msg in data)


def test_list_messages_failure(auth_header):
    """Failure: List messages for nonexistent session."""
    response = client.get(
        f"/api/v1/decisions/sessions/00000000-0000-0000-0000-000000000000/messages",
        headers=auth_header,
    )
    assert response.status_code == 404


# --- Update session ---
def test_update_session_expected(auth_header):
    """Expected: Update status and summary of a session."""
    sid = globals().get("session_id")
    payload = {"status": "reflection", "summary": "Session in reflection"}
    response = client.patch(
        f"/api/v1/decisions/sessions/{sid}", json=payload, headers=auth_header
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "reflection"
    assert data["summary"] == "Session in reflection"


def test_update_session_edge(auth_header):
    """Edge: Update session with invalid status."""
    sid = globals().get("session_id")
    payload = {"status": "invalid_status"}
    response = client.patch(
        f"/api/v1/decisions/sessions/{sid}", json=payload, headers=auth_header
    )
    assert response.status_code == 422


def test_update_session_failure(auth_header):
    """Failure: Update nonexistent session."""
    payload = {"status": "reflection"}
    response = client.patch(
        f"/api/v1/decisions/sessions/00000000-0000-0000-0000-000000000000",
        json=payload,
        headers=auth_header,
    )
    assert response.status_code == 404
