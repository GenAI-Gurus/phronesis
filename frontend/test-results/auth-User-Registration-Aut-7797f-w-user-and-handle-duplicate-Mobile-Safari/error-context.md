# Test info

- Name: User Registration & Authentication >> Register a new user and handle duplicate
- Location: /Users/carloshvp/Documents/Phronesis/frontend/tests/e2e/auth.spec.ts:9:7

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="email"]')

    at /Users/carloshvp/Documents/Phronesis/frontend/tests/e2e/auth.spec.ts:11:16
```

# Page snapshot

```yaml
- navigation
- img
- 'heading "404: Not Found" [level=2]'
- text: We couldn’t find that page, please check the URL and try again.
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | const randomEmail = () => `user${Date.now()}@testmail.com`;
   4 | const password = 'TestPassword123!';
   5 |
   6 | // Adjust selectors as needed to match your actual UI
   7 |
   8 | test.describe('User Registration & Authentication', () => {
   9 |   test('Register a new user and handle duplicate', async ({ page }) => {
   10 |     await page.goto('/register');
>  11 |     await page.fill('input[name="email"]', randomEmail());
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
   12 |     await page.fill('input[name="password"]', password);
   13 |     await page.click('button[type="submit"]');
   14 |     await expect(page.getByText(/registration successful/i)).toBeVisible();
   15 |
   16 |     // Try registering again with the same email (should fail)
   17 |     await page.goto('/register');
   18 |     await page.fill('input[name="email"]', 'user@testmail.com'); // Use a known duplicate or last used
   19 |     await page.fill('input[name="password"]', password);
   20 |     await page.click('button[type="submit"]');
   21 |     await expect(page.getByText(/already exists|duplicate|failed/i)).toBeVisible();
   22 |   });
   23 |
   24 |   test('Login with correct and incorrect credentials', async ({ page }) => {
   25 |     const email = randomEmail();
   26 |     // Register first
   27 |     await page.goto('/register');
   28 |     await page.fill('input[name="email"]', email);
   29 |     await page.fill('input[name="password"]', password);
   30 |     await page.click('button[type="submit"]');
   31 |     await expect(page.getByText(/registration successful/i)).toBeVisible();
   32 |
   33 |     // Correct login
   34 |     await page.goto('/login');
   35 |     await page.fill('input[name="email"]', email);
   36 |     await page.fill('input[name="password"]', password);
   37 |     await page.click('button[type="submit"]');
   38 |     await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();
   39 |
   40 |     // Incorrect login
   41 |     await page.goto('/login');
   42 |     await page.fill('input[name="email"]', email);
   43 |     await page.fill('input[name="password"]', 'WrongPassword!');
   44 |     await page.click('button[type="submit"]');
   45 |     await expect(page.getByText(/invalid|failed|incorrect/i)).toBeVisible();
   46 |   });
   47 |
   48 |   test('Update profile data and verify persistence', async ({ page }) => {
   49 |     const email = randomEmail();
   50 |     await page.goto('/register');
   51 |     await page.fill('input[name="email"]', email);
   52 |     await page.fill('input[name="password"]', password);
   53 |     await page.click('button[type="submit"]');
   54 |     await expect(page.getByText(/registration successful/i)).toBeVisible();
   55 |
   56 |     // Login
   57 |     await page.goto('/login');
   58 |     await page.fill('input[name="email"]', email);
   59 |     await page.fill('input[name="password"]', password);
   60 |     await page.click('button[type="submit"]');
   61 |     await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();
   62 |
   63 |     // Update profile (adjust selectors/fields as needed)
   64 |     await page.goto('/profile');
   65 |     await page.fill('input[name="name"]', 'Test User');
   66 |     await page.click('button[type="submit"]');
   67 |     await expect(page.getByText(/profile updated|success/i)).toBeVisible();
   68 |     // Reload and verify
   69 |     await page.reload();
   70 |     await expect(page.locator('input[name="name"]').inputValue()).resolves.toMatch(/Test User/);
   71 |   });
   72 |
   73 |   test('JWT is issued and used for all protected endpoints', async ({ page, context }) => {
   74 |     const email = randomEmail();
   75 |     await page.goto('/register');
   76 |     await page.fill('input[name="email"]', email);
   77 |     await page.fill('input[name="password"]', password);
   78 |     await page.click('button[type="submit"]');
   79 |     await expect(page.getByText(/registration successful/i)).toBeVisible();
   80 |
   81 |     // Login
   82 |     await page.goto('/login');
   83 |     await page.fill('input[name="email"]', email);
   84 |     await page.fill('input[name="password"]', password);
   85 |     await page.click('button[type="submit"]');
   86 |     await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();
   87 |
   88 |     // Check for JWT in localStorage or cookies
   89 |     const storage = await context.storageState();
   90 |     expect(JSON.stringify(storage)).toMatch(/jwt|access_token/i);
   91 |
   92 |     // Try accessing a protected route (simulate API call)
   93 |     await page.goto('/journal');
   94 |     await expect(page.getByText(/journal|entry|new decision/i)).toBeVisible();
   95 |     // Remove JWT and try again (simulate logout)
   96 |     await page.evaluate(() => localStorage.removeItem('jwt'));
   97 |     await page.goto('/journal');
   98 |     await expect(page.getByText(/login|unauthorized|token/i)).toBeVisible();
   99 |   });
  100 | });
  101 |
```