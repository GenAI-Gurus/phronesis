import { test, expect } from '@playwright/test';
import { setupUser, registerUser, loginUser, randomEmail, password } from './utils/userHelpers';

// Adjust selectors as needed to match your actual UI

test.describe('User Registration & Authentication', () => {
  test.describe.configure({ mode: 'serial' });
  test('Register a new user and handle duplicate', async ({ page }) => {
    const email = randomEmail();
    await registerUser(page, email, password);
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

  test('Session persists and protected routes accessible after login', async ({ page }) => {
    const email = randomEmail();
    await registerUser(page, email, password);
    await loginUser(page, email, password);

    // Check JWT is present in localStorage after login
    const jwt = await page.evaluate(() => localStorage.getItem('jwt'));
    expect(jwt).not.toBeNull();

    // Check session persistence by navigating to dashboard and journal
    await page.goto('/dashboard');
    await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();

    await page.goto('/journal');
    await expect(page.getByText('No journal entries found.')).toBeVisible();
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
    await expect(page.getByText('No journal entries found.')).toBeVisible();
    // Remove JWT and try again (simulate logout)
    await page.evaluate(() => localStorage.removeItem('jwt'));
    await page.goto('/journal');
    await Promise.any([
  expect(page.getByText('You must be logged in to view your journal.')).toBeVisible(),
  expect(page.getByRole('heading', { name: 'Login' })).toBeVisible(),
  expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible(),
]);
  });
});
