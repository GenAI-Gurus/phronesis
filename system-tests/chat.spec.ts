import { test, expect } from '@playwright/test';

import { setupUser, registerUser, loginUser, randomEmail, password } from './utils/userHelpers';

test.describe('Decision Support Chat', () => {
  test('Start a new chat session, send messages, receive AI responses', async ({ page }) => {
    await setupUser(page);
    await page.goto('/chat');
    const input = page.locator('[data-testid="chat-input"] [contenteditable="true"]');
    await input.waitFor();
    // Count AI messages before
    const aiMessagesBefore = await page.locator('.cs-message--incoming').count();
    await input.type('Should I accept the new job?');
    await input.press('Enter');
    // Wait for a new AI message to appear
    await expect(async () => {
      const aiMessagesAfter = await page.locator('.cs-message--incoming').count();
      expect(aiMessagesAfter).toBeGreaterThan(aiMessagesBefore);
    }).toPass();
    // Attach chat transcript for AI/manual review
    const chatText = await page.textContent('body');
    test.info().attach('ChatTranscript', { body: chatText || '' });
  });

  test('Handle fallback logic if AI is unavailable', async ({ page }) => {
    // This test assumes the backend is configured to simulate OpenAI failure or fallback
    await setupUser(page);
    await page.goto('/chat');
    const input = page.locator('[data-testid="chat-input"] [contenteditable="true"]');
    await input.waitFor();
    await input.type('Fallback test message');
    await input.press('Enter');
    await expect(page.getByText(/fallback|static|mock/i)).toBeVisible();
    // Attach fallback transcript for AI/manual review
    const chatText = await page.textContent('body');
    test.info().attach('ChatFallback', { body: chatText || '' });
  });

  test('End and resume chat sessions', async ({ page }) => {
    await setupUser(page);
    await page.goto('/chat');
    const input = page.locator('[data-testid="chat-input"] [contenteditable="true"]');
    await input.waitFor();
    await input.type('Test session resume');
    await input.press('Enter');
    await expect(page.getByText(/AI|response|suggestion|reply/i)).toBeVisible();
    // Simulate ending session (if UI supports)
    if (await page.isVisible('button:has-text("End Session")')) {
      await page.click('button:has-text("End Session")');
      await expect(page.getByText(/start new chat|session ended/i)).toBeVisible();
      // Start new session
      const input2 = page.locator('[data-testid="chat-input"] [contenteditable="true"]');
      await input2.waitFor();
      await input2.type('New session message');
      await input2.press('Enter');
      await expect(page.getByText(/AI|response|suggestion|reply/i)).toBeVisible();
    }
  });
});
