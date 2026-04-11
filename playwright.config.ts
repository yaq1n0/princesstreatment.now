import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5273', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://localhost:5273',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
