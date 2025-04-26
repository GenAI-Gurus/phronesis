# Step-by-Step TDD Implementation Plan: Decision Chat Feature

> **This is a temporary working document for the TDD-driven implementation of persistent, session-aware decision chat.**

---

## 1. Persist Sessions & Messages (Backend Integration)
- [x] On chat page load (for a decision):
    - [x] Check if there is an open session for today for the selected decision via `GET /sessions?decision_id=...`.
    - [x] If not, create a new session via `POST /sessions` (include decision ID/title).
    - [x] If yes, fetch the session and its status.
- [x] Fetch all messages for the session via `GET /sessions/{session_id}/messages` and display in chat UI.
- [x] When sending a message:
    - [x] POST the user message to `/sessions/{session_id}/messages`.
    - [x] Call `/chat` endpoint with full message history for AI reply.
    - [x] POST the AI reply to `/sessions/{session_id}/messages`.
    - [x] Update chat UI with both user and AI messages from backend.

## 2. Implement Session Management UI
- [x] Add controls to:
    - [x] End/complete a session ("End Session" button)
    - [x] Start a new session (if previous completed or new day)
    - [x] Show session status (active, completed, auto-completed)
- [x] On session completion:
    - [x] PATCH session to update status and store summary/insights
    - [x] Display session summary in the UI

## 3. Link Chat to Decisions
- [x] After creating a new decision, immediately redirect the user to the chat UI for that decision, passing the decisionId from the backend response.
- [x] Ensure all chat sessions/messages are associated with a specific decision (pass decision ID on create/fetch)
- [x] Display decision context (title, description, tags) in the chat UI

## 4. Enhance LLM/AI Flows
- [x] Use `/chat` endpoint for AI completions, always including full session history
- [x] Store both user and AI messages in backend for audit/replay
- [x] Display AI suggestions in the UI as actionable buttons
- [x] Unit tests cover the full sendMessage flow and error handling

## 5. Validate with System Tests
- [x] After each increment, run Playwright system tests for chat (chat.spec.ts)
- [x] Ensure each acceptance criterion is met and no regressions are introduced

## Discovered During Work
- [x] Pre-chat summary display: fetch and show last session and DecisionSummary when no open session today
- [x] Add session controls: ‘End Session’ button, session status indicator in chat header
- [x] Review pages: implement SessionReviewPage and DecisionRecapPage with links
- [x] Align AI endpoint: replace `/api/decision-support/chat` with official session message endpoints
- [x] Rich text support: render markdown/rich messages and system notes distinctly
- [x] Full unit tests for chat UI: stub or replace ChatScope to re-enable RTL tests

---

**Notes:**
- Prioritize persistence and session-awareness before advanced AI/LLM features.
- Use TDD: Write/expand system tests, then implement features until tests pass.
- Refactor and document as needed for maintainability and onboarding.

---

## Step-by-Step Refactor Plan: Frontend Chat Persistence

### 1. Accept Decision Context
- Accept a `decisionId` prop or obtain it from route params (e.g., via React Router).

### 2. On Mount: Fetch/Create Session and Messages
- On component mount (or when `decisionId` changes):
    1. Call `getOrCreateSession(decisionId)` to get today’s session.
    2. Store the session ID in state.
    3. Call `getSessionMessages(sessionId)` and populate the chat history.

### 3. On Send Message
- When the user sends a message:
    1. POST the user message to `/sessions/{sessionId}/messages`.
    2. Call `/chat` endpoint with the full message history for the AI reply.
    3. POST the AI reply to `/sessions/{sessionId}/messages`.
    4. Update the chat UI with both messages (fetch from backend or append locally).

### 4. On Session End
- Add a button to end/complete the session.
- On click, call `endSession(sessionId, summary)` to PATCH the session as completed.
- Optionally, display the session summary.

### 5. Error Handling and Loading States
- Show loading indicators while fetching/creating sessions or messages.
- Display error messages if API calls fail.

### 6. Sync with System Tests
- After each refactor, run your Playwright system tests to ensure the acceptance criteria are being met.

---

*Delete or archive this file after implementation is complete and all system tests pass.*
