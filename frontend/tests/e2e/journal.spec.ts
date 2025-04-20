import { test, expect } from '@playwright/test';

const randomEmail = () => `user${Date.now()}@testmail.com`;
const password = 'TestPassword123!';

// Utility to register and login a test user
test.beforeEach(async ({ page }) => {
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
});

test.describe('Decision Journal', () => {
  test('Create a new decision journal entry', async ({ page }) => {
    await page.goto('/journal/new');
    await page.fill('input[name="title"]', 'Should I move to Berlin?');
    await page.fill('textarea[name="context"]', 'Considering a job offer in Berlin.');
    await page.fill('textarea[name="anticipated_outcomes"]', 'Better career, new experiences.');
    await page.fill('input[name="values"]', 'growth,adventure');
    await page.fill('input[name="domain"]', 'career');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/created|success|journal entry/i)).toBeVisible();
    // Should redirect to journal list or detail page
  });

  test('Edit and update an existing entry', async ({ page }) => {
    await page.goto('/journal');
    // Assume the first entry is the one we just created
    await page.click('text=Should I move to Berlin?');
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="title"]', 'Should I move to Berlin or Paris?');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/updated|success/i)).toBeVisible();
    // Reload and check
    await page.goto('/journal');
    await expect(page.getByText(/Berlin or Paris/i)).toBeVisible();
  });

  test('List and view all entries', async ({ page }) => {
    await page.goto('/journal');
    await expect(page.getByText(/Berlin|Paris/i)).toBeVisible();
    // Click to view details
    await page.click('text=Berlin');
    await expect(page.getByText(/context|anticipated outcomes|values/i)).toBeVisible();
  });

  test('Verify auto-tagging on create/update', async ({ page }) => {
    await page.goto('/journal');
    await page.click('text=Berlin');
    // Check for domain_tags, sentiment_tag, keywords
    await expect(page.getByText(/domain|sentiment|keywords/i)).toBeVisible();
    // Optionally, snapshot or log these values for AI/manual review
    const tagsText = await page.textContent('body');
    test.info().attach('AutoTagging', { body: tagsText || '' });
  });
});
