import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'bun run dev',
    port: 4174,
    timeout: 120_000,
    reuseExistingServer: true,
  },
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:4174',
    headless: false,
    viewport: { width: 1280, height: 720 },
  },
});
