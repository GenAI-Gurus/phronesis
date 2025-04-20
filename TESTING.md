# Phronesis End-to-End System Testing Plan

## CI Workflow for E2E Testing

- Playwright E2E tests are automatically run in GitHub Actions CI on:
  - Pull Requests to main
  - Nightly schedule (2am UTC)
  - Manual trigger from the Actions UI
- The workflow installs browsers, runs all E2E tests (across desktop and mobile), and uploads a Playwright HTML report as a CI artifact.
- Reviewers can download the `playwright-report` artifact from the GitHub Actions UI to view detailed results, screenshots, logs, and outputs for [A], [AI], and [A+M] tests.
- Manual/AI reviewers should follow the protocol in this document to review flagged outputs and spot-check results after each CI run.
- For fast post-deploy health checks, a smoke test can be added to deploy workflows (see WORKFLOWS.md).

## 1. Scope
Test the entire user journey and all major features as deployed in production:
- Registration, authentication, and profile management
- Decision journal (create, edit, list, view)
- Reflection prompts (AI and fallback)
- Value calibration (check-in, history)
- Decision support chat (AI-powered)
- Gamification (streaks, badges, challenges)
- Life theme management
- Security, error handling, and environment variable loading

## 2. Test Environment
- **Frontend:** https://ambitious-ground-0a5060803.6.azurestaticapps.net/
- **Backend:** https://phronesis-backend-app.azurewebsites.net/api/v1
- **Test Accounts:** Use both new and existing user accounts for coverage

## 3. Test Methodology
- AI-powered manual testing for critical user flows (using MCP browser, LLMs, and dev tools)
- Automated E2E tests (Playwright)
- API contract testing (using OpenAPI docs and Postman/newman)
- Security checks (JWT, CORS, secret leakage)
- Cross-browser and mobile/responsive checks

## 4. Test Cases

### Legend
- [A] = Fully Automated (Playwright, Cypress, or script)
- [AI] = Automated by AI/LLM agent (browser automation + LLM assertions)
- [A+M] = Automated, with Manual Review (AI output or subjective UX)

### 4.1. User Registration & Authentication
- [A] Register a new user (email, password validation, duplicate check)
- [A] Login with correct and incorrect credentials
- [A] Update profile data and verify persistence
- [A] JWT is issued and used for all protected endpoints

### 4.2. Decision Journal
- [A] Create a new decision journal entry (with all fields)
- [A] Edit and update an existing entry
- [A] List and view all entries for the user
- [AI] Verify auto-tagging (domain, sentiment, keywords) on create/update

### 4.3. Reflection Prompts
- [A+M] Generate AI-powered prompts for a journal entry (with OpenAI key)
- [A+M] Trigger fallback prompts (by disabling/removing OpenAI key)
- [A] Display and handle errors gracefully

### 4.4. Value Calibration
- [A] Submit a new value calibration check-in
- [A] View check-in history and validate data
- [A] Edge: Submit invalid or duplicate check-ins

### 4.5. Decision Support Chat
- [A+M] Start a new chat session, send messages, receive AI responses
- [A+M] Handle fallback logic if AI is unavailable
- [A] End and resume chat sessions

### 4.6. Gamification
- [A] Earn streaks and badges through repeated actions
- [A] View and complete challenges
- [A] Edge: Attempt to complete already completed challenges

### 4.7. Life Theme Management
- [A] Set and update life theme
- [A] View current and past themes

### 4.8. Security & Compliance
- [A] All API endpoints require JWT (except registration/login)
- [A] Sensitive data is never exposed in frontend or logs
- [A] CORS is correctly configured
- [A] Secrets are loaded from environment variables/Azure Key Vault

### 4.9. Error Handling & Logging
- [A] Simulate backend/API errors and verify user-facing error messages
- [A] Check Azure App Service and Static Web Apps logs for errors

### 4.10. Cross-Browser & Device
- [A] Test major flows in Chrome, Firefox, Safari, Edge
- [A] Test mobile responsiveness (iOS/Android browser)

## 5. Review Protocol
- After every automated test run, the AI/automation generates a report.
- Manual reviewers:
    - Review all [A+M] flagged items (AI-generated content, subjective UI/UX).
    - Randomly sample [A] and [AI] tests for spot-checking.
    - Log feedback/issues in the tracker.
- All test results, screenshots, and logs are stored for audit/review.


