import { test, expect } from '@playwright/test';

const randomEmail = () => `user${Date.now()}_${Math.floor(Math.random() * 1e6)}@testmail.com`;
const password = 'TestPassword123!';

// Adjust selectors as needed to match your actual UI

test.describe('User Registration & Authentication', () => {
  test.describe.configure({ mode: 'serial' });
  test('Register a new user and handle duplicate', async ({ page }) => {
    const email = randomEmail();
    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.click('button[type="submit"]');
    // Extra logging for debugging registration failures
    const successVisible = await page.getByText(/registration successful/i).isVisible().catch(() => false);
    if (!successVisible) {
      const errorText = await page.locator('[data-testid="form-error"]').textContent().catch(() => '');
      console.log('Registration error:', errorText);
      test.info().attach('RegistrationError', { body: errorText || '' });
    }
    await expect(page.getByText(/registration successful/i)).toBeVisible();

    // Try registering again with the same email (should fail)
    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/already registered|already exists|duplicate|failed/i)).toBeVisible();
  });

  test('Login with correct and incorrect credentials', async ({ page }) => {
    const email = randomEmail();
    // Register first
    await page.goto('/register');
    await page.getByLabel('Email').fill( email);
    await page.getByLabel('Password').fill( password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/registration successful/i)).toBeVisible();

    // Correct login
    await page.goto('/login');
    await page.getByLabel('Email').fill( email);
    await page.getByLabel('Password').fill( password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();

    // Incorrect login
    await page.goto('/login');
    await page.getByLabel('Email').fill( email);
    await page.getByLabel('Password').fill( 'WrongPassword!');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid|failed|incorrect/i)).toBeVisible();
  });

  test('Update profile data and verify persistence', async ({ page }) => {
    const email = randomEmail();
    await page.goto('/register');
    await page.getByLabel('Email').fill( email);
    await page.getByLabel('Password').fill( password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/registration successful/i)).toBeVisible();

    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill( email);
    await page.getByLabel('Password').fill( password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();

    // Check JWT is present in localStorage after login
    const jwt = await page.evaluate(() => localStorage.getItem('jwt'));
    expect(jwt).not.toBeNull();

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
    await page.getByLabel('Email').fill( email);
    await page.getByLabel('Password').fill( password);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/registration successful/i)).toBeVisible();

    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill( email);
    await page.getByLabel('Password').fill( password);
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
