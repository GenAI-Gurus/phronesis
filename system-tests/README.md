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

- **Tests run against the deployed production frontend:** https://ambitious-ground-0a5060803.6.azurestaticapps.net/
- **Browsers/devices covered:**
  - Desktop Chrome
  - Mobile Chrome (Pixel 5)
  - Mobile Safari (iPhone 15 Pro)
- **Video and screenshots are recorded for every test** and available in the Playwright HTML report.
- **No local server is needed.**
- To view the latest report after a run:
  ```bash
  npx playwright show-report
  ```

## Test Structure
- All test files use Playwright and share helpers from `utils/userHelpers.ts`.
- Tests are named after the feature or flow they cover.

## DO NOT place system tests in frontend/ anymore!

---

For more info, see TESTING.md or contact the maintainers.
