from typing import List, Dict, Any
import datetime

class TensionDetector:
    """
    Detects 'tension' in user value check-ins.
    Flags if there are conflicting values or rapid swings in tracked values.
    """
    # Example: Courage vs. Caution are often in tension; here we use a generic example.
    CONFLICT_PAIRS = [
        ("Courage", "Caution"),
        ("Honesty", "Diplomacy"),
        ("Empathy", "Detachment"),
    ]
    RAPID_CHANGE_THRESHOLD = 5  # Arbitrary: change of 5+ points between check-ins

    @staticmethod
    def detect_conflicts(value_snapshot: Dict[str, int]) -> List[str]:
        """
        Detects if any conflicting value pairs are both high (>=8).
        Returns a list of conflict descriptions.
        """
        conflicts = []
        for a, b in TensionDetector.CONFLICT_PAIRS:
            if value_snapshot.get(a, 0) >= 8 and value_snapshot.get(b, 0) >= 8:
                conflicts.append(f"High tension between {a} and {b}")
        return conflicts

    @staticmethod
    def detect_rapid_swings(history: List[Dict[str, Any]]) -> List[str]:
        """
        Detects rapid swings in any value across check-ins.
        Expects history as a list of dicts with keys: value name, int value, and created_at.
        Returns a list of swing descriptions.
        """
        swings = []
        if len(history) < 2:
            return swings
        # Assume history is sorted by created_at ascending
        for value in history[0]:
            if value == "created_at":
                continue
            prev = history[0][value]
            for entry in history[1:]:
                curr = entry.get(value)
                if curr is not None and abs(curr - prev) >= TensionDetector.RAPID_CHANGE_THRESHOLD:
                    swings.append(f"Rapid swing in {value}: {prev} -> {curr}")
                prev = curr
        return swings

    @staticmethod
    def detect_tension(history: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """
        Detects all tensions in a user's value check-in history.
        Returns a dict with 'conflicts' and 'swings'.
        """
        results = {"conflicts": [], "swings": []}
        if not history:
            return results
        # Check most recent for conflicts
        results["conflicts"] = TensionDetector.detect_conflicts(history[-1])
        # Check for rapid swings in history
        results["swings"] = TensionDetector.detect_rapid_swings(history)
        return results
