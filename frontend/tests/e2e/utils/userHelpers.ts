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
  await expect(page.getByText(/registration successful/i)).toBeVisible();
}

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.click('button[type="submit"]');
  await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();
}

export async function setupUser(page: Page): Promise<{ email: string; password: string }> {
  const email = randomEmail();
  await registerUser(page, email, password);
  await loginUser(page, email, password);
  return { email, password };
}
