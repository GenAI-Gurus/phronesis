import { test, expect } from '@playwright/test';

const randomEmail = () => `user${Date.now()}@testmail.com`;
const password = 'TestPassword123!';

// Adjust selectors as needed to match your actual UI

test.describe('User Registration & Authentication', () => {
  test('Register a new user and handle duplicate', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="email"]', randomEmail());
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/registration successful/i)).toBeVisible();

    // Try registering again with the same email (should fail)
    await page.goto('/register');
    await page.fill('input[name="email"]', 'user@testmail.com'); // Use a known duplicate or last used
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/already exists|duplicate|failed/i)).toBeVisible();
  });

  test('Login with correct and incorrect credentials', async ({ page }) => {
    const email = randomEmail();
    // Register first
    await page.goto('/register');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/registration successful/i)).toBeVisible();

    // Correct login
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();

    // Incorrect login
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'WrongPassword!');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid|failed|incorrect/i)).toBeVisible();
  });

  test('Update profile data and verify persistence', async ({ page }) => {
    const email = randomEmail();
    await page.goto('/register');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/registration successful/i)).toBeVisible();

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();

    // Update profile (adjust selectors/fields as needed)
    await page.goto('/profile');
    await page.fill('input[name="name"]', 'Test User');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/profile updated|success/i)).toBeVisible();
    // Reload and verify
    await page.reload();
    await expect(page.locator('input[name="name"]').inputValue()).resolves.toMatch(/Test User/);
  });

  test('JWT is issued and used for all protected endpoints', async ({ page, context }) => {
    const email = randomEmail();
    await page.goto('/register');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/registration successful/i)).toBeVisible();

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();

    // Check for JWT in localStorage or cookies
    const storage = await context.storageState();
    expect(JSON.stringify(storage)).toMatch(/jwt|access_token/i);

    // Try accessing a protected route (simulate API call)
    await page.goto('/journal');
    await expect(page.getByText(/journal|entry|new decision/i)).toBeVisible();
    // Remove JWT and try again (simulate logout)
    await page.evaluate(() => localStorage.removeItem('jwt'));
    await page.goto('/journal');
    await expect(page.getByText(/login|unauthorized|token/i)).toBeVisible();
  });
});
