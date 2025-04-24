import { test, expect } from '@playwright/test';
import { setupUser, registerUser, loginUser, randomEmail, password } from './utils/userHelpers';




async function setupUser(page) {
  const email = randomEmail();
  await registerUser(page, email, password);
  await page.click('button[type="submit"]');
  await expect(page.getByText(/registration successful/i)).toBeVisible();
  await loginUser(page, email, password);
  await page.click('button[type="submit"]');
  await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();
}

test.describe('Value Calibration', () => {
  test('Submit a new value calibration check-in', async ({ page }) => {
    await setupUser(page);
    await page.goto('/value-calibration');
    // Assume sliders or input fields for values
    await page.fill('input[name="Courage"]', '7');
    await page.fill('input[name="Honesty"]', '8');
    await page.fill('input[name="Curiosity"]', '6');
    await page.fill('input[name="Empathy"]', '9');
    await page.fill('input[name="Resilience"]', '7');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/check-in|success|saved/i)).toBeVisible();
  });

  test('View check-in history and validate data', async ({ page }) => {
    await setupUser(page);
    await page.goto('/value-calibration');
    // Submit a check-in
    await page.fill('input[name="Courage"]', '5');
    await page.fill('input[name="Honesty"]', '5');
    await page.fill('input[name="Curiosity"]', '5');
    await page.fill('input[name="Empathy"]', '5');
    await page.fill('input[name="Resilience"]', '5');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/check-in|success|saved/i)).toBeVisible();
    // Check for history table/list
    await expect(page.getByText(/history|previous check-ins/i)).toBeVisible();
    // Optionally, check that the values are present in the history
    await expect(page.getByText(/5/)).toBeVisible();
  });

  test('Edge: Submit invalid or duplicate check-ins', async ({ page }) => {
    await setupUser(page);
    await page.goto('/value-calibration');
    // Submit with missing/invalid values
    await page.fill('input[name="Courage"]', '');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/required|invalid|error/i)).toBeVisible();
    // Submit two check-ins rapidly (simulate duplicate)
    await page.fill('input[name="Courage"]', '6');
    await page.fill('input[name="Honesty"]', '6');
    await page.fill('input[name="Curiosity"]', '6');
    await page.fill('input[name="Empathy"]', '6');
    await page.fill('input[name="Resilience"]', '6');
    await page.click('button[type="submit"]');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/already exists|duplicate|error/i)).toBeVisible();
  });
});
