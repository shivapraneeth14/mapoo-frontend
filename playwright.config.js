import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 1,
  reporter: 'list',
  use: {
    baseURL: 'https://localhost:5173',
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'node src/index.js',
      port: 5001,
      cwd: '../server',
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: 'npx vite --host',
      port: 5173,
      cwd: '.',
      reuseExistingServer: true,
      timeout: 15000,
    },
  ],
})
