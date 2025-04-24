import { test, expect } from '@playwright/test';
import { setupUser, registerUser, loginUser, randomEmail, password } from './utils/userHelpers';




// Utility to register, login, and create a journal entry for reflection
async function setupUserAndEntry(page) {
  const email = randomEmail();
  await registerUser(page, email, password);
  await page.click('button[type="submit"]');
  await expect(page.getByText(/registration successful/i)).toBeVisible();
  await loginUser(page, email, password);
  await page.click('button[type="submit"]');
  await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();
  // Create a journal entry
  await page.goto('/journal/new');
  await page.fill('input[name="title"]', 'Should I take the new job?');
  await page.fill('textarea[name="context"]', 'Received an offer from Company X.');
  await page.fill('textarea[name="anticipated_outcomes"]', 'Career growth, higher salary.');
  await page.fill('input[name="values"]', 'growth,security');
  await page.fill('input[name="domain"]', 'career');
  await page.click('button[type="submit"]');
  await expect(page.getByText(/created|success|journal entry/i)).toBeVisible();
}

test.describe('Reflection Prompts', () => {
  test('Generate AI-powered prompts for a journal entry', async ({ page }) => {
    await setupUserAndEntry(page);
    await page.goto('/reflection-prompts');
    // Wait for entries to load
    await expect(page.getByLabelText(/select journal entry/i)).toBeVisible();
    await page.click('[aria-label="Select Journal Entry"]');
    // Select the first entry
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.click('button[aria-label="Generate Prompts"]');
    await expect(page.getByText(/AI-generated prompts|Fallback prompts/i)).toBeVisible();
    // Attach prompts for AI/manual review
    const promptsText = await page.textContent('body');
    test.info().attach('ReflectionPrompts', { body: promptsText || '' });
  });

  test('Trigger fallback prompts if AI is unavailable', async ({ page }) => {
    // This test assumes the backend is configured to simulate OpenAI failure, or the OPENAI_API_KEY is missing
    await setupUserAndEntry(page);
    await page.goto('/reflection-prompts');
    await expect(page.getByLabelText(/select journal entry/i)).toBeVisible();
    await page.click('[aria-label="Select Journal Entry"]');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.click('button[aria-label="Generate Prompts"]');
    await expect(page.getByText(/Fallback prompts|static/i)).toBeVisible();
    // Attach prompts for AI/manual review
    const promptsText = await page.textContent('body');
    test.info().attach('ReflectionPromptsFallback', { body: promptsText || '' });
  });

  test('Display and handle errors gracefully', async ({ page }) => {
    // Simulate error: e.g., by removing JWT or causing API failure
    await setupUserAndEntry(page);
    await page.goto('/reflection-prompts');
    // Remove JWT
    await page.evaluate(() => localStorage.removeItem('jwt'));
    await page.reload();
    await expect(page.getByText(/login|unauthorized|token/i)).toBeVisible();
  });
});
