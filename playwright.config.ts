import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/test-results',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  
  fullyParallel: false, // Pour éviter les conflits de DB de test
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'e2e-results.xml' }],
    ['github'],
  ],
  
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-safari',
      testMatch: /.*\.mobile\.spec\.ts/,
      use: { ...devices['iPhone 14 Pro'] },
    },
    {
      name: 'firefox',
      testMatch: /.*\.cross-browser\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 60_000,
        env: {
          NODE_ENV: 'test',
          E2E_BASE_URL: 'http://localhost:5173',
        },
      },
  
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
});
