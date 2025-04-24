// tests/e2e/utils/userHelpers.ts
import { expect, Page } from '@playwright/test';

export const password = 'TestPassword123!';

export function randomEmail() {
  return `user${Date.now()}@testmail.com`;
}

export async function registerUser(page: Page, email: string, password: string) {
  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.click('button[type="submit"]');
  try {
    await expect(page.getByText(/registration successful/i)).toBeVisible({ timeout: 15000 });
  } catch (e) {
    // Try to capture error messages (adjust selectors as needed)
    const errorText = await page.locator('.error, [role="alert"], .MuiAlert-message').allTextContents();
    const pageContent = await page.content();
    // Optionally save a screenshot
    await page.screenshot({ path: `registerUser-debug-${Date.now()}.png`, fullPage: true });
    // Log for Playwright report
    console.error('Registration failed. Error message:', errorText);
    console.error('Page HTML snapshot:', pageContent);
    throw e;
  }
}

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.click('button[type="submit"]');
  await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible({ timeout: 15000 });
}

export async function setupUser(page: Page): Promise<{ email: string; password: string }> {
  const email = randomEmail();
  await registerUser(page, email, password);
  await loginUser(page, email, password);
  return { email, password };
}
