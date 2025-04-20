# Test info

- Name: User Registration & Authentication >> Update profile data and verify persistence
- Location: /Users/carloshvp/Documents/Phronesis/frontend/tests/e2e/auth.spec.ts:57:7

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="name"]')

    at /Users/carloshvp/Documents/Phronesis/frontend/tests/e2e/auth.spec.ts:78:16
```

# Page snapshot

```yaml
- heading "Login" [level=4]
- text: Email
- textbox "Email"
- text: Password
- textbox "Password"
- button "Login"
- paragraph:
  - text: Don't have an account?
  - link "Register":
    - /url: /register
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | const randomEmail = () => `user${Date.now()}_${Math.floor(Math.random() * 1e6)}@testmail.com`;
   4 | const password = 'TestPassword123!';
   5 |
   6 | // Adjust selectors as needed to match your actual UI
   7 |
   8 | test.describe('User Registration & Authentication', () => {
   9 |   test.describe.configure({ mode: 'serial' });
   10 |   test('Register a new user and handle duplicate', async ({ page }) => {
   11 |     const email = randomEmail();
   12 |     await page.goto('/register');
   13 |     await page.getByLabel('Email').fill(email);
   14 |     await page.getByLabel('Password').fill(password);
   15 |     await page.click('button[type="submit"]');
   16 |     // Extra logging for debugging registration failures
   17 |     const successVisible = await page.getByText(/registration successful/i).isVisible().catch(() => false);
   18 |     if (!successVisible) {
   19 |       const errorText = await page.locator('[data-testid="form-error"]').textContent().catch(() => '');
   20 |       console.log('Registration error:', errorText);
   21 |       test.info().attach('RegistrationError', { body: errorText || '' });
   22 |     }
   23 |     await expect(page.getByText(/registration successful/i)).toBeVisible();
   24 |
   25 |     // Try registering again with the same email (should fail)
   26 |     await page.goto('/register');
   27 |     await page.getByLabel('Email').fill(email);
   28 |     await page.getByLabel('Password').fill(password);
   29 |     await page.click('button[type="submit"]');
   30 |     await expect(page.getByText(/already registered|already exists|duplicate|failed/i)).toBeVisible();
   31 |   });
   32 |
   33 |   test('Login with correct and incorrect credentials', async ({ page }) => {
   34 |     const email = randomEmail();
   35 |     // Register first
   36 |     await page.goto('/register');
   37 |     await page.getByLabel('Email').fill( email);
   38 |     await page.getByLabel('Password').fill( password);
   39 |     await page.click('button[type="submit"]');
   40 |     await expect(page.getByText(/registration successful/i)).toBeVisible();
   41 |
   42 |     // Correct login
   43 |     await page.goto('/login');
   44 |     await page.getByLabel('Email').fill( email);
   45 |     await page.getByLabel('Password').fill( password);
   46 |     await page.click('button[type="submit"]');
   47 |     await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();
   48 |
   49 |     // Incorrect login
   50 |     await page.goto('/login');
   51 |     await page.getByLabel('Email').fill( email);
   52 |     await page.getByLabel('Password').fill( 'WrongPassword!');
   53 |     await page.click('button[type="submit"]');
   54 |     await expect(page.getByText(/invalid|failed|incorrect/i)).toBeVisible();
   55 |   });
   56 |
   57 |   test('Update profile data and verify persistence', async ({ page }) => {
   58 |     const email = randomEmail();
   59 |     await page.goto('/register');
   60 |     await page.getByLabel('Email').fill( email);
   61 |     await page.getByLabel('Password').fill( password);
   62 |     await page.click('button[type="submit"]');
   63 |     await expect(page.getByText(/registration successful/i)).toBeVisible();
   64 |
   65 |     // Login
   66 |     await page.goto('/login');
   67 |     await page.getByLabel('Email').fill( email);
   68 |     await page.getByLabel('Password').fill( password);
   69 |     await page.click('button[type="submit"]');
   70 |     await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();
   71 |
   72 |     // Check JWT is present in localStorage after login
   73 |     const jwt = await page.evaluate(() => localStorage.getItem('jwt'));
   74 |     expect(jwt).not.toBeNull();
   75 |
   76 |     // Update profile (adjust selectors/fields as needed)
   77 |     await page.goto('/profile');
>  78 |     await page.fill('input[name="name"]', 'Test User');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
   79 |     await page.click('button[type="submit"]');
   80 |     await expect(page.getByText(/profile updated|success/i)).toBeVisible();
   81 |     // Reload and verify
   82 |     await page.reload();
   83 |     await expect(page.locator('input[name="name"]').inputValue()).resolves.toMatch(/Test User/);
   84 |   });
   85 |
   86 |   test('JWT is issued and used for all protected endpoints', async ({ page, context }) => {
   87 |     const email = randomEmail();
   88 |     await page.goto('/register');
   89 |     await page.getByLabel('Email').fill( email);
   90 |     await page.getByLabel('Password').fill( password);
   91 |     await page.click('button[type="submit"]');
   92 |     await expect(page.getByText(/registration successful/i)).toBeVisible();
   93 |
   94 |     // Login
   95 |     await page.goto('/login');
   96 |     await page.getByLabel('Email').fill( email);
   97 |     await page.getByLabel('Password').fill( password);
   98 |     await page.click('button[type="submit"]');
   99 |     await expect(page.getByText(/dashboard|welcome|logout/i)).toBeVisible();
  100 |
  101 |     // Check for JWT in localStorage or cookies
  102 |     const storage = await context.storageState();
  103 |     expect(JSON.stringify(storage)).toMatch(/jwt|access_token/i);
  104 |
  105 |     // Try accessing a protected route (simulate API call)
  106 |     await page.goto('/journal');
  107 |     await expect(page.getByText(/journal|entry|new decision/i)).toBeVisible();
  108 |     // Remove JWT and try again (simulate logout)
  109 |     await page.evaluate(() => localStorage.removeItem('jwt'));
  110 |     await page.goto('/journal');
  111 |     await expect(page.getByText(/login|unauthorized|token/i)).toBeVisible();
  112 |   });
  113 | });
  114 |
```