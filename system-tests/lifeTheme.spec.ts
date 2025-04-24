import { test, expect } from '@playwright/test';
import { setupUser, registerUser, loginUser, randomEmail, password } from './utils/userHelpers';


test.describe('Life Theme Management', () => {
  test('Set and update life theme', async ({ page }) => {
    await setupUser(page);
    await page.goto('/life-theme');
    await page.fill('textarea[name="theme_text"]', 'Growth through challenge');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/saved|success|life theme/i)).toBeVisible();
    // Update theme
    await page.fill('textarea[name="theme_text"]', 'Resilience and curiosity');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/saved|success|life theme/i)).toBeVisible();
  });

  test('View current and past themes', async ({ page }) => {
    await setupUser(page);
    await page.goto('/life-theme');
    await page.fill('textarea[name="theme_text"]', 'Integrity and learning');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/saved|success|life theme/i)).toBeVisible();
    // Check for a list/history of themes
    await expect(page.getByText(/history|previous themes|integrity/i)).toBeVisible();
  });
});
