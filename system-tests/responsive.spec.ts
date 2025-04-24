import { test, expect } from '@playwright/test';

const pagesToCheck = [
  '/',
  '/dashboard',
  '/journal',
  '/reflection-prompts',
  '/value-calibration',
  '/chat',
  '/gamification',
  '/life-theme',
];

test.describe('Cross-Browser & Device Responsiveness', () => {
  for (const pagePath of pagesToCheck) {
    test(`should render correctly for ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      // Check for no horizontal scroll and visible main content
      const body = await page.$('body');
      if (!body) throw new Error('Body not found');
      const overflowX = await body.evaluate((el) => getComputedStyle(el).overflowX);
      expect(overflowX).not.toBe('scroll');
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });
  }
});
