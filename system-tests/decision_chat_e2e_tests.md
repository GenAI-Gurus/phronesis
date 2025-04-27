# System E2E Test Plan: Conversational Decision Chat

This document defines end-to-end (E2E) system tests for the Decision Chat feature. Each test is mapped to the acceptance criteria from `docs/decision_chat_design.md`.

---

## Implementation Status
🎉 Implementation: All tests defined below are implemented in `system-tests/chat.spec.ts`, matching the Test X.Y labels.

## 1. Decision Creation & Listing

**Test 1.1**: User can create a new decision via chat UI  
*Acceptance: 1.1*
- Start app, navigate to dashboard, click “New Decision”.
- Enter valid title and description via chat.
- Assert: Decision appears in dashboard with correct title/description.

**Test 1.2**: Validation for empty or too-long title/description  
*Acceptance: 1.2*
- Attempt to submit empty or overlong fields.
- Assert: UI shows validation error and prevents submission.

**Test 1.3**: Auto-assignment of domain_tags/keywords (LLM function calling)  
*Acceptance: 1.3*
- Create a decision with a description clearly matching a domain.
- Assert: Domain tag and keywords are auto-assigned and displayed.

**Test 1.4**: Tags/keywords are not editable by user  
*Acceptance: 1.4*
- Assert: User cannot edit tags/keywords in the UI.

**Test 1.5**: Dashboard grouping, sorting, and filtering  
*Acceptance: 1.5, 1.6, 1.7, 1.8*
- Create multiple decisions with different tags/status.
- Assert: Dashboard groups by domain_tag, sub-categorizes by status, sorts by last updated.
- Filter by tag/status and search by keyword/title/description; assert correct results.

**Test 1.6**: Toggle “Show Archived”  
*Acceptance: 1.9*
- Archive a decision, toggle “Show Archived”.
- Assert: Archived decisions are hidden/shown as expected.

**Test 1.7**: Change decision status  
*Acceptance: 1.10*
- Change status from dashboard/detail view.
- Assert: Status change is persisted and reflected in UI grouping.

**Test 1.8**: Update description triggers re-tagging  
*Acceptance: 1.11*
- Edit a decision’s description.
- Assert: LLM re-tags and updates keywords, user is notified.

**Test 1.9**: API/backend errors  
*Acceptance: 1.12*
- Simulate API failure on create/list/update.
- Assert: User sees actionable error, dashboard remains stable.

**Test 1.10**: Edge cases  
*Acceptance: 1.13*
- Create decisions with duplicate titles, very long descriptions, simulate network loss.
- Assert: UI handles gracefully, no data loss or crash.

---

## 2. Session Management

**Test 2.1**: Open session from today  
*Acceptance: 2.1*
- Select a decision with an open session today.
- Assert: User is taken to correct chat history, session date/status shown.

**Test 2.2**: No open session (new day or all complete)  
*Acceptance: 2.2*
- After session completion or new day, select decision.
- Assert: New session auto-starts, summaries shown, notification displayed.

**Test 2.3**: Auto-completion of previous session  
*Acceptance: 2.3*
- Leave session open, advance system date.
- Assert: Previous session auto-completes, user informed, new session started.

**Test 2.4**: Manual session completion  
*Acceptance: 2.4*
- Mark session as complete.
- Assert: Session becomes read-only, summary generated.

**Test 2.5**: Read-only completed sessions  
*Acceptance: 2.5*
- Attempt to add message to completed session.
- Assert: UI prevents input, chat history and summary visible.

**Test 2.6**: Time zone correctness  
*Acceptance: 2.6*
- Manipulate user time zone, repeat above tests.
- Assert: Session boundaries respect local time.

**Test 2.7**: API/backend errors  
*Acceptance: 2.7*
- Simulate session create/complete failure.
- Assert: User sees error, can retry, no duplicates.

**Test 2.8**: Prevent multiple open sessions per day  
*Acceptance: 2.8*
- Attempt to create multiple sessions for same decision on same day.
- Assert: Only one open session exists.

**Test 2.9**: Edge cases  
*Acceptance: 2.9*
- Rapidly switch sessions, simulate network loss/data loss.
- Assert: Progress is preserved, UI remains stable.

---

## 3. Chat-Based Reflection

**Test 3.1**: AI starts session with context-aware prompt  
*Acceptance: 3.1*
- Start new session.
- Assert: First AI message references title, description, summaries.

**Test 3.2**: Chat UI message types and distinction  
*Acceptance: 3.2*
- Exchange user, AI, system messages.
- Assert: Each type is visually distinct.

**Test 3.3**: Message persistence and order  
*Acceptance: 3.3*
- Send multiple messages, reload page/device.
- Assert: All messages are present, correctly ordered.

**Test 3.4**: Markdown/rich text support  
*Acceptance: 3.4*
- Send messages with markdown/links.
- Assert: Rendered correctly in chat.

**Test 3.5**: Accessibility  
*Acceptance: 3.5*
- Navigate chat using keyboard/screen reader.
- Assert: All controls/messages are accessible.

**Test 3.6**: Error handling for LLM/API  
*Acceptance: 3.6*
- Simulate LLM failure.
- Assert: User sees error, can retry.

**Test 3.7**: Edge cases  
*Acceptance: 3.7*
- Send long/unsupported messages, simulate network loss.
- Assert: Input is preserved, user can retry.

---

## 4. Summaries

**Test 4.1**: Session summary generation  
*Acceptance: 4.1*
- Complete a session, check summary.
- Assert: SessionSummary is generated and displayed.

**Test 4.2**: Decision summary generation  
*Acceptance: 4.2*
- After multiple sessions, check DecisionSummary.
- Assert: Summary of summaries is generated and up to date.

**Test 4.3**: Review summaries  
*Acceptance: 4.3*
- View any session’s summary and DecisionSummary.
- Assert: Summaries are accessible and correct.

---

**Instructions:**
- Implement these as Playwright (or similar) E2E tests.
- Reference the acceptance criteria number in each test description.
- Mark all as expected to fail initially (red).
- As features are implemented, ensure each test passes (green).
