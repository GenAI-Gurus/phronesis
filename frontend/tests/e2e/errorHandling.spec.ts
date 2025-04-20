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

test.describe('Error Handling & Logging', () => {
  test('Simulate backend/API errors and verify user-facing error messages', async ({ page }) => {
    await setupUser(page);
    // Remove JWT to trigger auth error
    await page.goto('/journal');
    await page.evaluate(() => localStorage.removeItem('jwt'));
    await page.reload();
    await expect(page.getByText(/login|unauthorized|token/i)).toBeVisible();
    // Try submitting invalid data (e.g., empty required fields)
    await page.goto('/journal/new');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/required|invalid|error/i)).toBeVisible();
  });

  test('Check Azure App Service and Static Web Apps logs for errors (manual)', async () => {
    // This is a manual step: instruct reviewer to check Azure logs for errors after running E2E tests
    test.info().annotations.push({ type: 'manual', description: 'Check Azure App Service and Static Web Apps logs for errors after E2E run.' });
  });
});
