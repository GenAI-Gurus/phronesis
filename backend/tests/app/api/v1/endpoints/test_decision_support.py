import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Mock user authentication dependency for testing
app.dependency_overrides = {}
from app.core.security import get_current_user
class DummyUser:
    id = "test-user-id"
    email = "test@example.com"
    is_active = True
    is_superuser = False
app.dependency_overrides[get_current_user] = lambda: DummyUser()

def test_decision_support_chat_expected():
    import os
    import openai
    payload = {
        "messages": [
            {"role": "user", "content": "I'm struggling with a big decision."}
        ]
    }
    response = client.post("/api/v1/decision-support/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    user_msg = payload["messages"][0]["content"]
    ai_reply = data["reply"]
    print("\n--- DecisionSupportChat Test Output ---")
    print(f"User message: {user_msg}")
    print(f"AI reply: {ai_reply}")
    # Use OpenAI as judge (gpt-4.1-nano)
    api_key = os.getenv("OPENAI_API_KEY")
    judge_prompt = (
        f"Given the user question: '{user_msg}' and the AI's answer: '{ai_reply}', "
        "is the answer a valid, helpful response to the question? Reply only with YES or NO."
    )
    print(f"Judge prompt: {judge_prompt}")
    judge_client = openai.OpenAI(api_key=api_key)
    judge_response = judge_client.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[{"role": "user", "content": judge_prompt}],
        max_tokens=5,
        temperature=0
    )
    verdict = judge_response.choices[0].message.content.strip().upper()
    print(f"Judge verdict: {verdict}")
    print("--- End Test Output ---\n")
    assert verdict.startswith("YES"), f"LLM judge verdict: {verdict}"
    assert isinstance(data["suggestions"], list)

def test_decision_support_chat_edge_missing_messages():
    payload = {"messages": []}
    response = client.post("/api/v1/decision-support/chat", json=payload)
    assert response.status_code == 400

def test_decision_support_chat_failure_last_not_user():
    payload = {
        "messages": [
            {"role": "ai", "content": "Hi, how can I help?"}
        ]
    }
    response = client.post("/api/v1/decision-support/chat", json=payload)
    assert response.status_code == 400
