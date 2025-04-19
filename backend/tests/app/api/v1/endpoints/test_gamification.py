import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.gamification import (
    UserStreak,
    UserBadge,
    Badge,
    Challenge,
    UserChallenge,
)
from app.models.user import Base as UserBase
from app.db.session import engine
import uuid
from datetime import datetime, timedelta

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    UserBase.metadata.create_all(bind=engine)
    # Assume all gamification tables are created by Alembic or test setup
    yield
    # DB cleanup is handled centrally


@pytest.fixture
def auth_header():
    email = f"gamify_{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPass123!"
    reg = client.post("/api/v1/register", json={"email": email, "password": password})
    assert reg.status_code in (200, 201)
    login = client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_streaks_empty(auth_header):
    resp = client.get("/api/v1/gamification/streaks", headers=auth_header)
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_badges_empty(auth_header):
    resp = client.get("/api/v1/gamification/badges", headers=auth_header)
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_challenges_empty(auth_header):
    resp = client.get("/api/v1/gamification/challenges", headers=auth_header)
    assert resp.status_code == 200
    assert resp.json() == []


def test_complete_challenge_not_found(auth_header):
    resp = client.post(
        "/api/v1/gamification/challenges/doesnotexist/complete", headers=auth_header
    )
    assert resp.status_code == 404


def test_complete_challenge_already_completed(auth_header, db_session=None):
    # This test assumes a challenge and user_challenge exist. Would require setup or mocking.
    pass  # Placeholder for edge/failure case
