import { test, expect } from '@playwright/test';

const randomEmail = () => `user${Date.now()}@testmail.com`;
const password = 'TestPassword123!';

async function setupUser(page) {
  const email = randomEmail();
  await page.goto('/register');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page.getByText(/registration successful/i)).toBeVisible();
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();
}

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
