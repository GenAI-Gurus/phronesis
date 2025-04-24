import { test, expect } from '@playwright/test';
import { setupUser, registerUser, loginUser, randomEmail, password } from './utils/userHelpers';


test.describe('Gamification', () => {
  test('Earn streaks and badges through repeated actions', async ({ page }) => {
    await setupUser(page);
    // Simulate actions that earn streaks/badges (e.g., daily check-ins, journal entries)
    for (let i = 0; i < 3; i++) {
      await page.goto('/journal/new');
      await page.fill('input[name="title"]', `Entry ${i}`);
      await page.fill('textarea[name="context"]', `Context ${i}`);
      await page.fill('textarea[name="anticipated_outcomes"]', `Outcome ${i}`);
      await page.fill('input[name="values"]', 'growth');
      await page.fill('input[name="domain"]', 'career');
      await page.click('button[type="submit"]');
      await expect(page.getByText(/created|success|journal entry/i)).toBeVisible();
    }
    await page.goto('/gamification');
    await expect(page.getByText(/badge|streak|challenge/i)).toBeVisible();
    // Attach badge/streak state for review
    const gamificationText = await page.textContent('body');
    test.info().attach('Gamification', { body: gamificationText || '' });
  });

  test('View and complete challenges', async ({ page }) => {
    await setupUser(page);
    await page.goto('/challenges');
    await expect(page.getByText(/challenge|complete|progress/i)).toBeVisible();
    // Simulate completing a challenge if possible
    if (await page.isVisible('button:has-text("Complete")')) {
      await page.click('button:has-text("Complete")');
      await expect(page.getByText(/completed|badge|success/i)).toBeVisible();
    }
  });

  test('Edge: Attempt to complete already completed challenges', async ({ page }) => {
    await setupUser(page);
    await page.goto('/challenges');
    // Complete a challenge if possible
    if (await page.isVisible('button:has-text("Complete")')) {
      await page.click('button:has-text("Complete")');
      await expect(page.getByText(/completed|badge|success/i)).toBeVisible();
      // Try to complete again
      await page.click('button:has-text("Complete")');
      await expect(page.getByText(/already completed|error|cannot/i)).toBeVisible();
    }
  });
});
