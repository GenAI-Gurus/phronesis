import pytest
from app.services.tension_detector import TensionDetector
import datetime


def make_history(entries):
    # Helper to create a history list with created_at
    now = datetime.datetime.utcnow()
    return [
        dict({"created_at": now + datetime.timedelta(days=i)}, **entry)
        for i, entry in enumerate(entries)
    ]


def test_detect_conflicts_expected():
    snapshot = {"Courage": 9, "Caution": 9, "Honesty": 7, "Diplomacy": 8}
    conflicts = TensionDetector.detect_conflicts(snapshot)
    assert any("Courage" in c and "Caution" in c for c in conflicts)
    assert all(isinstance(c, str) for c in conflicts)


def test_detect_conflicts_no_conflict():
    snapshot = {"Courage": 5, "Caution": 5}
    assert TensionDetector.detect_conflicts(snapshot) == []


def test_detect_rapid_swings_expected():
    history = make_history(
        [
            {"Courage": 3},
            {"Courage": 9},
        ]
    )
    swings = TensionDetector.detect_rapid_swings(history)
    assert any("Courage" in s for s in swings)


def test_detect_rapid_swings_edge():
    history = make_history([{"Courage": 5}])
    assert TensionDetector.detect_rapid_swings(history) == []


def test_detect_tension_combined():
    history = make_history(
        [
            {"Courage": 3, "Caution": 3},
            {"Courage": 9, "Caution": 9},
        ]
    )
    result = TensionDetector.detect_tension(history)
    assert "conflicts" in result and "swings" in result
    assert any("Courage" in c for c in result["conflicts"])
    assert any("Courage" in s for s in result["swings"])


def test_detect_tension_empty():
    assert TensionDetector.detect_tension([]) == {"conflicts": [], "swings": []}
