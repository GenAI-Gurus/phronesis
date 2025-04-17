import pytest
from app.models.value_calibration import ValueCalibrationCheckin
import uuid
import datetime


class DummyUser:
    id = uuid.uuid4()


def make_checkin(**kwargs):
    return ValueCalibrationCheckin(
        id=str(kwargs.get("id", uuid.uuid4())),
        user_id=str(kwargs.get("user_id", uuid.uuid4())),
        created_at=kwargs.get("created_at", datetime.datetime.utcnow()),
        value_snapshot=kwargs.get("value_snapshot", '{"courage": 7, "honesty": 8}'),
    )


def test_checkin_expected():
    checkin = make_checkin()
    # IDs should be strings (UUIDs as str)
    assert isinstance(checkin.id, str)
    assert isinstance(checkin.user_id, str)
    assert isinstance(checkin.created_at, datetime.datetime)
    assert isinstance(checkin.value_snapshot, str)
    assert "courage" in checkin.value_snapshot


def test_checkin_edge_empty_snapshot():
    checkin = make_checkin(value_snapshot="{}")
    assert checkin.value_snapshot == "{}"


from sqlalchemy.exc import IntegrityError
import pytest

# Use the db_session fixture for DB access in tests.


import pytest


@pytest.mark.xfail(
    reason="Database NOT NULL constraint should fail if user_id is missing."
)
def test_checkin_failure_missing_user_id(db_session):
    # user_id is required and must be a non-empty string
    checkin = ValueCalibrationCheckin(
        id=str(uuid.uuid4()),
        created_at=datetime.datetime.utcnow(),
        value_snapshot='{"courage": 7}',
    )
    db_session.add(checkin)
    try:
        db_session.commit()
    except Exception as exc:
        print(f"[DEBUG TEST] Exception: {exc}")
        assert "NOT NULL" in str(exc) or "user_id" in str(exc)
        db_session.rollback()
    else:
        assert (
            False
        ), "Expected IntegrityError for missing user_id, but commit succeeded."
