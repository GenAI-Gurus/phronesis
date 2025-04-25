import { test, expect } from '@playwright/test';
// NOTE: Every test must call setupUser(page) to register and login a unique user. Do not share login state between tests.
import { setupUser } from './utils/userHelpers';

test.describe('Decision Chat E2E', () => {
  test('[Test 1.1] User can create a new decision via chat UI', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Should I move to Berlin?');
    await page.fill('textarea[name="description"]', 'Considering a job offer in Berlin...');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText('Should I move to Berlin?')).toBeVisible();
  });

  test('[Test 1.2] Validation for empty/too-long title/description', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', '');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText('Title is required')).toBeVisible();
    // Add more cases for too-long input
  });

  test('[Test 1.3] Auto-assignment of domain_tags/keywords (LLM function calling)', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Should I change careers?');
    await page.fill('textarea[name="description"]', 'I am considering switching from finance to education.');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText('education')).toBeVisible(); // Example tag
    await expect(page.getByText(/finance|education/)).toBeVisible(); // Example keyword
  });

  test('[Test 1.4] Tags/keywords are not editable by user', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Should I start a business?');
    await page.fill('textarea[name="description"]', 'Entrepreneurship in the tech sector.');
    await page.click('button:has-text("Submit")');
    // Try to find edit controls for tags/keywords
    await expect(page.locator('[data-testid="domain-tags-edit"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="keywords-edit"]')).toHaveCount(0);
  });

  test('[Test 1.5] Dashboard grouping, sorting, and filtering', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Assume at least two decisions with different tags/status already exist
    // Check grouping by domain_tag
    const groupCount = await page.locator('.dashboard-group[data-tag]').count();
    expect(groupCount).toBeGreaterThan(1);
    // Check sorting by last updated
    const firstTitle = await page.locator('.decision-card .title').first().textContent();
    expect(firstTitle).not.toBeNull();
    // Filtering
    await page.click('button:has-text("Filter")');
    await page.click('text=Career/Work');
    await expect(page.locator('.decision-card')).toContainText('Career/Work');
  });

  test('[Test 1.6] Toggle “Show Archived”', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Archive a decision
    await page.click('button:has-text("Archive")');
    await expect(page.locator('.decision-card')).not.toBeVisible();
    // Show archived
    await page.click('button:has-text("Show Archived")');
    await expect(page.locator('.decision-card.archived')).toBeVisible();
  });

  test('[Test 1.7] Change decision status', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Change status from dashboard
    await page.click('button:has-text("Mark as Closed")');
    await expect(page.locator('.decision-card .status')).toHaveText('Closed');
    // Change back to In Progress
    await page.click('button:has-text("Mark as In Progress")');
    await expect(page.locator('.decision-card .status')).toHaveText('In Progress');
  });

  test('[Test 1.8] Update description triggers re-tagging', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Should I learn Python?');
    await page.fill('textarea[name="description"]', 'Programming for data science.');
    await page.click('button:has-text("Submit")');
    // Edit the decision
    await page.click('.decision-card:has-text("Should I learn Python?") button:has-text("Edit")');
    await page.fill('textarea[name="description"]', 'Programming for web development.');
    await page.click('button:has-text("Save")');
    // Wait for tags/keywords to update (simulate delay if needed)
    await expect(page.getByText(/web development/)).toBeVisible(); // Example new keyword
    // Optionally, check for user notification
  });

  test('[Test 1.9] API/backend errors', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Simulate API failure (assume test backend or toggle exists)
        await page.evaluate(() => window.simulateApiFailure = true);
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Should I test errors?');
    await page.fill('textarea[name="description"]', 'Error simulation.');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText(/error|failed|try again/i)).toBeVisible();
    // Reset simulation
        await page.evaluate(() => window.simulateApiFailure = false);
  });

  test('[Test 1.10] Edge cases (duplicates, long desc, network)', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Duplicate title
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Duplicate Title');
    await page.fill('textarea[name="description"]', 'First entry.');
    await page.click('button:has-text("Submit")');
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Duplicate Title');
    await page.fill('textarea[name="description"]', 'Second entry.');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText(/duplicate|already exists/i)).toBeVisible();
    // Extremely long description
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Long Desc');
    await page.fill('textarea[name="description"]', 'x'.repeat(5000));
    await page.click('button:has-text("Submit")');
    await expect(page.getByText(/too long|max length/i)).toBeVisible();
    // Simulate network loss
        await page.evaluate(() => window.simulateNetworkLoss = true);
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Network Loss');
    await page.fill('textarea[name="description"]', 'Network error test.');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText(/offline|network|retry/i)).toBeVisible();
        await page.evaluate(() => window.simulateNetworkLoss = false);
  });

  // --- Session Management Tests ---
  test('[Test 2.1] Open session from today', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Ensure a decision exists before clicking
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Should I move to Berlin?');
    await page.fill('textarea[name="description"]', 'Considering a job offer in Berlin...');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText('Should I move to Berlin?')).toBeVisible();
    await page.click('.decision-card');
    await expect(page.locator('.chat-history')).toBeVisible();
    await expect(page.locator('.session-date')).toHaveText(new RegExp(new Date().getFullYear().toString()));
    await expect(page.locator('.session-status')).toHaveText(/active|open/i);
  });

  test('[Test 2.2] No open session (new day or all complete)', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Ensure a decision exists before clicking
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Should I move to Berlin?');
    await page.fill('textarea[name="description"]', 'Considering a job offer in Berlin...');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText('Should I move to Berlin?')).toBeVisible();
    await page.click('.decision-card');
    // Simulate session completion or new day
    await page.evaluate(() => window.simulateSessionComplete = true);
    await page.reload();
    await expect(page.getByText(/summary of last session|decision summary/i)).toBeVisible();
    await expect(page.getByText(/new session started/i)).toBeVisible();
    await page.evaluate(() => window.simulateSessionComplete = false);
  });

  test('[Test 2.3] Auto-completion of previous session', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Ensure a decision exists before clicking
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Should I move to Berlin?');
    await page.fill('textarea[name="description"]', 'Considering a job offer in Berlin...');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText('Should I move to Berlin?')).toBeVisible();
    await page.click('.decision-card');
    // Simulate new day
    await page.evaluate(() => window.simulateNewDay = true);
    await page.reload();
    await expect(page.getByText(/session auto-completed|new session started/i)).toBeVisible();
    await page.evaluate(() => window.simulateNewDay = false);
  });

  test('[Test 2.4] Manual session completion', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Ensure a decision exists before clicking
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Should I move to Berlin?');
    await page.fill('textarea[name="description"]', 'Considering a job offer in Berlin...');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText('Should I move to Berlin?')).toBeVisible();
    await page.click('.decision-card');
    await page.click('button:has-text("End Session")');
    await expect(page.locator('.session-status')).toHaveText(/completed|closed/i);
    await expect(page.getByText(/session summary|reflection/i)).toBeVisible();
  });

  test('[Test 2.5] Read-only completed sessions', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Ensure a decision exists before clicking
    await page.click('text=New Decision');
    await page.fill('input[name="title"]', 'Should I move to Berlin?');
    await page.fill('textarea[name="description"]', 'Considering a job offer in Berlin...');
    await page.click('button:has-text("Submit")');
    await expect(page.getByText('Should I move to Berlin?')).toBeVisible();
    await page.click('.decision-card');
    await page.click('button:has-text("End Session")');
    await expect(page.locator('.chat-input')).toBeHidden();
    await expect(page.locator('.chat-history')).toBeVisible();
    await expect(page.getByText(/session summary|reflection/i)).toBeVisible();
  });


  test('[Test 2.6] Time zone correctness', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    // Simulate different user time zones if possible (pseudo-code, adjust for actual test infra)
    // await page.emulateTimezone('America/New_York');
    await page.click('.decision-card');
    await expect(page.locator('.session-date')).toBeVisible();
    // Optionally, assert session boundary respects local time
  });

  test('[Test 2.7] API/backend errors on session', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
        await page.evaluate(() => window.simulateSessionApiFailure = true);
    await page.click('button:has-text("End Session")');
    await expect(page.getByText(/error|failed|try again/i)).toBeVisible();
        await page.evaluate(() => window.simulateSessionApiFailure = false);
  });

  test('[Test 2.8] Prevent multiple open sessions per day', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    // Try to open another session for same decision on same day
    await page.click('button:has-text("Start New Session")');
    await expect(page.getByText(/already have an open session|one session per day/i)).toBeVisible();
  });

  test('[Test 2.9] Edge cases: rapid switching, network/data loss', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    // Simulate rapid session switching
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Switch Session")');
      await expect(page.locator('.chat-history')).toBeVisible();
    }
    // Simulate network loss during session
        await page.evaluate(() => window.simulateNetworkLoss = true);
    await page.click('button:has-text("End Session")');
    await expect(page.getByText(/offline|network|retry/i)).toBeVisible();
        await page.evaluate(() => window.simulateNetworkLoss = false);
  });

  // --- Chat-Based Reflection Tests ---
  test('[Test 3.1] AI starts session with context-aware prompt', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    await expect(page.getByText(/decision title|description|summary/i)).toBeVisible();
    await expect(page.locator('.chat-history .ai-message').first()).toContainText(/reflect|welcome|today/i);
  });

  test('[Test 3.2] Chat UI message types and distinction', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    await page.fill('.chat-input', 'Test message from user');
    await page.click('button:has-text("Send")');
    await expect(page.locator('.chat-history .user-message')).toContainText('Test message from user');
    await expect(page.locator('.chat-history .ai-message')).toBeVisible();
    await expect(page.locator('.chat-history .system-message')).toBeVisible();
  });

  test('[Test 3.3] Message persistence and order', async ({ page, context }) => {
    const { email, password } = await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    await page.fill('.chat-input', 'First message');
    await page.click('button:has-text("Send")');
    await page.fill('.chat-input', 'Second message');
    await page.click('button:has-text("Send")');
    // Reload page to simulate leaving and returning
    await page.reload();
    await page.click('.decision-card');
    const messages = await page.locator('.chat-history .user-message').allTextContents();
    expect(messages[0]).toContain('First message');
    expect(messages[1]).toContain('Second message');
  });

  test('[Test 3.4] Markdown/rich text support', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    await page.fill('.chat-input', '**Bold Text** [Link](https://example.com)');
    await page.click('button:has-text("Send")');
    await expect(page.locator('.chat-history .user-message strong')).toContainText('Bold Text');
    await expect(page.locator('.chat-history .user-message a')).toHaveAttribute('href', 'https://example.com');
  });

  test('[Test 3.5] Accessibility', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    // Tab through chat input and send button
    await page.keyboard.press('Tab');
    await expect(page.locator('.chat-input')).toBeFocused();
    await page.keyboard.type('Accessibility test');
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Send")')).toBeFocused();
    // Screen reader role
    await expect(page.locator('.chat-history')).toHaveAttribute('role', /log|region|main/);
  });

  test('[Test 3.6] Error handling for LLM/API', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
        await page.evaluate(() => window.simulateLLMFailure = true);
    await page.fill('.chat-input', 'Trigger LLM error');
    await page.click('button:has-text("Send")');
    await expect(page.getByText(/AI unavailable|error|try again/i)).toBeVisible();
        await page.evaluate(() => window.simulateLLMFailure = false);
  });

  test('[Test 3.7] Edge cases: long/unsupported messages, network loss', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    // Very long message
    await page.fill('.chat-input', 'x'.repeat(5000));
    await page.click('button:has-text("Send")');
    await expect(page.getByText(/too long|max length/i)).toBeVisible();
    // Simulate network loss
        await page.evaluate(() => window.simulateNetworkLoss = true);
    await page.fill('.chat-input', 'Network error test');
    await page.click('button:has-text("Send")');
    await expect(page.getByText(/offline|network|retry/i)).toBeVisible();
        await page.evaluate(() => window.simulateNetworkLoss = false);
  });

  // --- Summaries Tests ---
  test('[Test 4.1] Session summary generation', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    await page.click('button:has-text("End Session")');
    await expect(page.getByText(/session summary|reflection/i)).toBeVisible();
  });

  test('[Test 4.2] Decision summary generation', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    await page.click('button:has-text("End Session")');
    // Start a new session
    await page.click('button:has-text("Start New Session")');
    await page.click('button:has-text("End Session")');
    await expect(page.getByText(/decision summary|summary of summaries/i)).toBeVisible();
  });

  test('[Test 4.3] Review summaries', async ({ page }) => {
    await setupUser(page);
    await page.goto('/dashboard');
    await page.click('.decision-card');
    await page.click('button:has-text("View Summary")');
    await expect(page.getByText(/session summary|decision summary|reflection/i)).toBeVisible();
  });

  // ...add more as needed
});
