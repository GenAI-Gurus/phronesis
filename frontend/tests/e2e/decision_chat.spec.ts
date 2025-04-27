import { test, expect } from '@playwright/test';

// Use TEST_DECISION_ID and TEST_SESSION_ID env vars or defaults
const decisionId = process.env.TEST_DECISION_ID || 'd1';
const sessionId = process.env.TEST_SESSION_ID || 's1';

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

// Session Review Page
test('Session Review page displays summary and messages', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/decisions/${decisionId}/sessions/${sessionId}/review`);
  await expect(page.locator('h4')).toHaveText('Session Review');
  await expect(page.locator('button', { hasText: 'Back to Chat' })).toBeVisible();
});

// Decision Recap Page
test('Decision Recap page shows overall summary and sessions', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/decisions/${decisionId}/summary`);
  await expect(page.locator('h4')).toHaveText('Decision Recap');
  await expect(page.locator('li')).not.toHaveCount(0);
  // Navigate to first session review
  await page.locator('li').first().click();
  await expect(page).toHaveURL(new RegExp(`/decisions/${decisionId}/sessions/${sessionId}/review`));
});

// Send message and get AI suggestions
test('User can send message and see suggestions', async ({ page, baseURL }) => {
  // Mock GET messages to return empty list
  await page.route('**/api/v1/decisions/sessions/*/messages', async route => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({ json: [] });
    } else {
      const body = JSON.parse(request.postData() || '{}');
      await route.fulfill({ json: { id: 'm1', session_id: sessionId, sender: body.sender, content: body.content } });
    }
  });
  // Mock chat endpoint
  await page.route('**/api/v1/decisions/sessions/*/chat', route => {
    return route.fulfill({ json: { reply: 'AI test reply', suggestions: ['Yes', 'No'] } });
  });

  await page.goto(`${baseURL}/decisions/${decisionId}/chat`);
  // Type and send message
  const input = page.locator('input[data-testid="chat-input"]');
  await input.fill('Test message');
  await page.click('button[data-testid="send-button"]');
  // Suggestions should appear
  await expect(page.locator('button', { hasText: 'Yes' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'No' })).toBeVisible();
  // Input should be cleared
  await expect(input).toHaveValue('');
});
