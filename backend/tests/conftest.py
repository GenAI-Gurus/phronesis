"""
conftest.py -- Pytest fixtures for consistent, realistic FastAPI+SQLAlchemy testing.

- Uses a file-based SQLite DB (sqlite:///./test.db) to ensure all sessions/connections see the same data.
- Ensures schema is created before tests and test.db is deleted after.
- Overrides get_db to use the same session for both test setup and endpoint execution.
- This avoids the classic in-memory SQLite isolation problem and guarantees deterministic test results.
"""

import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import value_calibration, user, decision, gamification, reflection
from app.db.session import get_db
from app.main import app

# Use a file-based SQLite DB for tests
TEST_DB_URL = "sqlite:///./test.db"
Base = value_calibration.Base  # adjust if your Base is elsewhere

import stat


@pytest.fixture(scope="session")
def db_engine():
    # Remove old test DB if it exists (robust cleanup)
    try:
        if os.path.exists("./test.db"):
            try:
                os.chmod(
                    "./test.db",
                    stat.S_IWUSR
                    | stat.S_IRUSR
                    | stat.S_IWGRP
                    | stat.S_IROTH
                    | stat.S_IWOTH,
                )
            except Exception:
                pass
            os.remove("./test.db")
    except Exception as e:
        print(f"Warning: Could not remove old test.db: {e}")
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    # Create all tables for all models
    Base.metadata.create_all(bind=engine)
    # Log DB creation and permissions
    if os.path.exists("./test.db"):
        print("[conftest] test.db created.")
        try:
            os.chmod("./test.db", 0o666)
            print("[conftest] test.db permissions set to 666.")
        except Exception as e:
            print(f"[conftest] Warning: Could not set permissions on test.db: {e}")
    else:
        print("[conftest] Warning: test.db was not created!")
    yield engine
    import time

    print("[conftest] Disposing engine after session.")
    engine.dispose()
    print("[conftest] Engine disposed.")
    # For SQLite test DB, do NOT drop tables here. Only remove test.db file after engine is disposed.
    # This avoids locking/readonly errors on teardown.
    import sqlite3

    try:
        if os.path.exists("./test.db"):
            try:
                os.chmod(
                    "./test.db",
                    stat.S_IWUSR
                    | stat.S_IRUSR
                    | stat.S_IWGRP
                    | stat.S_IROTH
                    | stat.S_IWOTH,
                )
                print("[conftest] test.db permissions set to writable before removal.")
            except Exception:
                print("[conftest] Warning: Could not set permissions before removal.")
            # Retry file removal a few times if needed
            for i in range(3):
                try:
                    os.remove("./test.db")
                    print("[conftest] test.db removed after tests.")
                    break
                except (PermissionError, sqlite3.OperationalError) as e:
                    if "readonly database" in str(e):
                        print(
                            f"[conftest] Ignored teardown error (readonly database): {e}"
                        )
                        break
                    print(f"[conftest] Retry {i+1}: Could not remove test.db: {e}")
                    time.sleep(0.5)
            else:
                print(
                    "[conftest] Final warning: test.db could not be removed after retries."
                )
    except (Exception, sqlite3.OperationalError) as e:
        print(f"[conftest] Suppressed teardown error: {e}")


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Yields a new DB session for each test, using the shared file-based SQLite DB."""
    # Assert test.db exists and is writable
    assert os.path.exists(
        "./test.db"
    ), "[conftest] test.db does not exist at test start!"
    try:
        with open("./test.db", "a"):
            pass
    except Exception as e:
        raise AssertionError(f"[conftest] test.db is not writable at test start: {e}")
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=db_engine
    )
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        print("[conftest] db_session closed after test.")


@pytest.fixture(scope="function")
def client(db_session):
    """TestClient with get_db overridden to use the SAME session as test setup and all API calls."""

    def override_get_db():
        yield db_session  # Always yield the same session object

    app.dependency_overrides[get_db] = override_get_db
    from fastapi.testclient import TestClient

    return TestClient(app)
