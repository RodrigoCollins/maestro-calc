import { defineConfig } from '@playwright/test';

const origin = 'http://127.0.0.1:8787';

// One phone project against `wrangler dev` serving the `dist` that `verify` built: Wrangler applies
// the same asset rules and `_headers` as production, which `astro preview` does not.
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: origin },
  projects: [
    {
      name: 'phone',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'npx wrangler dev --config wrangler.e2e.jsonc --port 8787 --ip 127.0.0.1',
    url: origin,
    reuseExistingServer: false,
    // Piped so a failed wrangler boot shows its own output instead of a bare timeout.
    stdout: 'pipe',
    stderr: 'pipe',
    env: { WRANGLER_SEND_METRICS: 'false' },
    timeout: 60_000,
  },
});
