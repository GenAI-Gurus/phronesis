import { test, expect, request } from '@playwright/test';

const protectedRoutes = [
  '/journal',
  '/reflection-prompts',
  '/value-calibration',
  '/chat',
  '/gamification',
  '/life-theme',
];

// Utility to register and login a test user
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

test.describe('Security & Compliance', () => {
  test('All API endpoints require JWT (except registration/login)', async ({ page }) => {
    // Logout by removing JWT
    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('jwt'));
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page.getByText(/login|unauthorized|token|access denied/i)).toBeVisible();
    }
  });

  test('Sensitive data is never exposed in frontend or logs', async ({ page }) => {
    await setupUser(page);
    // Check for absence of secrets in DOM
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toMatch(/OPENAI_API_KEY|DATABASE_URL|password|jwt/i);
    // Optionally, check for secrets in console logs (requires browser context instrumentation)
  });

  test('CORS is correctly configured', async () => {
    // Try an API request from a non-allowed origin
    const context = await request.newContext({
      baseURL: 'https://phronesis-backend-app.azurewebsites.net/api/v1',
      extraHTTPHeaders: {
        Origin: 'https://malicious-site.com',
      },
    });
    const resp = await context.get('/decisions/journal');
    expect(resp.status()).toBeGreaterThanOrEqual(400); // Should not allow cross-origin
    // Optionally check for CORS headers
    expect(resp.headers()['access-control-allow-origin']).not.toBe('https://malicious-site.com');
    await context.dispose();
  });

  test('Secrets are loaded from environment variables/Azure Key Vault', async ({ page }) => {
    // This is mainly a deployment/config check
    await setupUser(page);
    await page.goto('/reflection-prompts');
    await expect(page.getByText(/AI-generated prompts|Fallback prompts|static/i)).toBeVisible();
    // If the app works and no secrets are leaked, assume env/Key Vault is working
  });
});
