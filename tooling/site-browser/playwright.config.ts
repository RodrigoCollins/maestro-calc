import { defineConfig } from '@playwright/test';

const local = 'http://127.0.0.1:8787';
// `BASE_URL` points the same tests at another server, for example the production site after a deploy
// (the post-deploy smoke of tasks F.4); without it they serve the local build.
const external = process.env['BASE_URL'];
const origin = external ?? local;

// Phone projects against `wrangler dev` serving the `dist` that `verify` built: Wrangler applies the
// same asset rules and `_headers` as production, which `astro preview` does not. The `no-js`
// project loads the pages with JavaScript off and runs `no-js.spec.ts` only.
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  // A failed test keeps its trace and screenshot in `test-results`, which CI uploads on failure.
  use: { baseURL: origin, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    {
      name: 'phone',
      testIgnore: /no-js\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'no-js',
      testMatch: /no-js\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        javaScriptEnabled: false,
      },
    },
  ],
  ...(external === undefined
    ? {
        webServer: {
          command: 'npx wrangler dev --config wrangler.e2e.jsonc --port 8787 --ip 127.0.0.1',
          url: local,
          reuseExistingServer: false,
          // Piped so a failed wrangler boot shows its own output instead of a bare timeout.
          stdout: 'pipe',
          stderr: 'pipe',
          env: { WRANGLER_SEND_METRICS: 'false' },
          timeout: 60_000,
        },
      }
    : {}),
});
