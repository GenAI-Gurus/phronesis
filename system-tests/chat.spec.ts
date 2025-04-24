import { test, expect } from '@playwright/test';

import { setupUser, registerUser, loginUser, randomEmail, password } from './utils/userHelpers';

test.describe('Decision Support Chat', () => {
  test('Start a new chat session, send messages, receive AI responses', async ({ page }) => {
    await setupUser(page);
    await page.goto('/chat');
    await page.fill('textarea[name="message"]', 'Should I accept the new job?');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/AI|suggestion|response|reply/i)).toBeVisible();
    // Attach chat transcript for AI/manual review
    const chatText = await page.textContent('body');
    test.info().attach('ChatTranscript', { body: chatText || '' });
  });

  test('Handle fallback logic if AI is unavailable', async ({ page }) => {
    // This test assumes the backend is configured to simulate OpenAI failure or fallback
    await setupUser(page);
    await page.goto('/chat');
    await page.fill('textarea[name="message"]', 'Fallback test message');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/fallback|static|mock/i)).toBeVisible();
    // Attach fallback transcript for AI/manual review
    const chatText = await page.textContent('body');
    test.info().attach('ChatFallback', { body: chatText || '' });
  });

  test('End and resume chat sessions', async ({ page }) => {
    await setupUser(page);
    await page.goto('/chat');
    await page.fill('textarea[name="message"]', 'Test session resume');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/AI|response|suggestion|reply/i)).toBeVisible();
    // Simulate ending session (if UI supports)
    if (await page.isVisible('button:has-text("End Session")')) {
      await page.click('button:has-text("End Session")');
      await expect(page.getByText(/start new chat|session ended/i)).toBeVisible();
      // Start new session
      await page.fill('textarea[name="message"]', 'New session message');
      await page.click('button[type="submit"]');
      await expect(page.getByText(/AI|response|suggestion|reply/i)).toBeVisible();
    }
  });
});
