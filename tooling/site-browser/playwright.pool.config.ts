import { defineConfig } from '@playwright/test';

// Pool Figures (apps/pool): the same phone and no-js projects as Maestro Calc, against `wrangler dev`
// serving the built `apps/pool/dist` on a port of its own. `BASE_URL` points them at another server.
const local = 'http://127.0.0.1:8789';
const external = process.env['BASE_URL'];
const phone = {
  browserName: 'chromium' as const,
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

export default defineConfig({
  testDir: 'e2e-pool',
  outputDir: 'test-results-pool',
  forbidOnly: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-pool' }]],
  use: { baseURL: external ?? local, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'pool-phone', testIgnore: /no-js\.spec\.ts/, use: phone },
    {
      name: 'pool-no-js',
      testMatch: /no-js\.spec\.ts/,
      use: { ...phone, javaScriptEnabled: false },
    },
  ],
  ...(external === undefined
    ? {
        webServer: {
          command: 'npx wrangler dev --config wrangler.pool.e2e.jsonc --port 8789 --ip 127.0.0.1',
          url: local,
          reuseExistingServer: false,
          stdout: 'pipe',
          stderr: 'pipe',
          env: { WRANGLER_SEND_METRICS: 'false' },
          timeout: 60_000,
        },
      }
    : {}),
});
