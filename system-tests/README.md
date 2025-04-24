# System Playwright Tests for Phronesis

This folder contains all system-level (end-to-end) Playwright tests for the Phronesis platform. These tests cover authentication, journaling, chat, gamification, security, and other full-stack flows.

## Why are system tests here?
- Keeping system tests outside the frontend/ directory prevents unnecessary production redeploys when only test code changes.
- This location allows the tests to cover both frontend and backend integration.

## How to run
From the repo root or this directory:

```
cd system-tests
npx playwright test
```

## Test Structure
- All test files use Playwright and share helpers from `utils/userHelpers.ts`.
- Tests are named after the feature or flow they cover.

## DO NOT place system tests in frontend/ anymore!

---

For more info, see TESTING.md or contact the maintainers.
