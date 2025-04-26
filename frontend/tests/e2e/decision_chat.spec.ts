import { test, expect } from '@playwright/test';

// Use TEST_DECISION_ID env var or default
const decisionId = process.env.TEST_DECISION_ID || 'd1';

// Basic chat page load
test('Chat page loads with decision context', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/decisions/${decisionId}/chat`);
  // Title should display the decision title
  await expect(page.locator('h3')).toHaveText('Test Decision');
  // Chat input exists
  await expect(page.locator('input[data-testid="chat-input"]')).toBeVisible();
  // End Session button visible
  await expect(page.locator('button[data-testid="end-session-btn"]')).toBeVisible();
});

// End session flow
test('End session disables input and shows previous session summary', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/decisions/${decisionId}/chat`);
  const endBtn = page.locator('button[data-testid="end-session-btn"]');
  await expect(endBtn).toBeEnabled();
  await endBtn.click();
  // After ending, input should be disabled
  await expect(page.locator('input[data-testid="chat-input"]')).toBeDisabled();
  // Previous Sessions header appears
  await expect(page.locator('h4', { hasText: 'Previous Sessions:' })).toBeVisible();
});
