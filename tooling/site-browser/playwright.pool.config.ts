import { defineConfig } from '@playwright/test';

// Pool Figures (apps/pool): the same phone and no-js projects as Maestro Calc, against `wrangler dev`
// serving the built `apps/pool/dist` on a port of its own. `BASE_URL` points them at another server.
const local = 'http://127.0.0.1:8789';
const external = process.env['BASE_URL'];
// `SHARD=1/2` runs one half of the suites, as in playwright.config.ts; unset, all.
const [current, total] = (process.env['SHARD'] ?? '').split('/').map(Number);
const shard =
  current !== undefined && total !== undefined && current > 0 && total > 0
    ? { current, total }
    : null;
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
  fullyParallel: true,
  shard,
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
