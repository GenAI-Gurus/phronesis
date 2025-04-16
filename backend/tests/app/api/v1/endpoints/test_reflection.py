"""
Pytest unit tests for the Reflection Prompt Generator endpoint.
Covers expected, edge, and failure cases.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.decision import Base as DecisionBase
from app.models.user import Base as UserBase
from app.db.session import engine
import uuid

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    UserBase.metadata.create_all(bind=engine)
    DecisionBase.metadata.create_all(bind=engine)
    yield
    DecisionBase.metadata.drop_all(bind=engine)
    UserBase.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def auth_header():
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPass123!"
    # Register
    reg = client.post("/api/v1/register", json={"email": email, "password": password})
    assert reg.status_code in (200, 201)
    # Login
    login = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="module")
def create_journal_entry(auth_header):
    # Create a decision journal entry for the user
    entry_data = {"title": "Test Decision", "context": "Test context", "anticipated_outcomes": "Test outcome", "values": ["integrity"], "domain": "career"}
    resp = client.post("/api/v1/decisions/journal", json=entry_data, headers=auth_header)
    if resp.status_code == 404:
        pytest.skip("Journal endpoint not implemented")
    assert resp.status_code in (200, 201)
    return resp.json()["id"]

def test_generate_prompts_expected(auth_header, create_journal_entry):
    """Expected: Generate prompts for a valid entry."""
    payload = {"entry_id": create_journal_entry}
    response = client.post("/api/v1/reflection/prompts/generate", json=payload, headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert "prompts" in data
    assert isinstance(data["prompts"], list)
    assert data["ai_generated"] is True

def test_generate_prompts_edge_invalid_entry(auth_header):
    """Edge: Generate prompts for a non-existent entry."""
    payload = {"entry_id": str(uuid.uuid4())}
    response = client.post("/api/v1/reflection/prompts/generate", json=payload, headers=auth_header)
    assert response.status_code == 404

def test_generate_prompts_failure_unauthenticated():
    """Failure: Generate prompts without authentication."""
    payload = {"entry_id": str(uuid.uuid4())}
    response = client.post("/api/v1/reflection/prompts/generate", json=payload)
    assert response.status_code == 401

# TODO: Add more edge/failure tests as Reflection Prompt API evolves
