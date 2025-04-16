import pytest
from app.models.value_calibration import ValueCalibrationCheckin
import uuid
import datetime

class DummyUser:
    id = uuid.uuid4()

def make_checkin(**kwargs):
    return ValueCalibrationCheckin(
        id=kwargs.get("id", uuid.uuid4()),
        user_id=kwargs.get("user_id", uuid.uuid4()),
        created_at=kwargs.get("created_at", datetime.datetime.utcnow()),
        value_snapshot=kwargs.get("value_snapshot", '{"courage": 7, "honesty": 8}')
    )

def test_checkin_expected():
    checkin = make_checkin()
    assert isinstance(checkin.id, uuid.UUID)
    assert isinstance(checkin.user_id, uuid.UUID)
    assert isinstance(checkin.created_at, datetime.datetime)
    assert isinstance(checkin.value_snapshot, str)
    assert "courage" in checkin.value_snapshot

def test_checkin_edge_empty_snapshot():
    checkin = make_checkin(value_snapshot="{}")
    assert checkin.value_snapshot == "{}"

def test_checkin_failure_missing_user_id():
    with pytest.raises(TypeError):
        ValueCalibrationCheckin(
            id=uuid.uuid4(),
            created_at=datetime.datetime.utcnow(),
            value_snapshot='{"courage": 7}'
        )
