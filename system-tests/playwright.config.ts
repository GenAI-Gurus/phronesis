import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'https://ambitious-ground-0a5060803.6.azurestaticapps.net/',
    headless: false,
    slowMo: 200,
    video: 'on', // Record video for every test
    screenshot: 'on', // Take screenshot for every test
    expect: {
      timeout: 15000, // 15 seconds for all expect assertions
    },
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 15 Pro'] },
    },
  ],

});
