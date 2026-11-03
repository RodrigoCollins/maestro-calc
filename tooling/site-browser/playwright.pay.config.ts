import { defineConfig } from '@playwright/test';

// Cuenta Horas (apps/pay): the same phone and no-js projects as Maestro Calc, against `wrangler dev`
// serving the built `apps/pay/dist` on a port of its own. `BASE_URL` points them at another server.
const local = 'http://127.0.0.1:8788';
const external = process.env['BASE_URL'];
const phone = {
  browserName: 'chromium' as const,
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

export default defineConfig({
  testDir: 'e2e-pay',
  outputDir: 'test-results-pay',
  forbidOnly: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-pay' }]],
  use: { baseURL: external ?? local, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'pay-phone', testIgnore: /no-js\.spec\.ts/, use: phone },
    {
      name: 'pay-no-js',
      testMatch: /no-js\.spec\.ts/,
      use: { ...phone, javaScriptEnabled: false },
    },
  ],
  ...(external === undefined
    ? {
        webServer: {
          command: 'npx wrangler dev --config wrangler.pay.e2e.jsonc --port 8788 --ip 127.0.0.1',
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
