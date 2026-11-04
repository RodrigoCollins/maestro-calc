// Renders docs/design/og/pool-figures-og.html to apps/pool/public/og.png at 1200x630 with the
// Chromium of this package. Run from the repository root: node tooling/site-browser/og/render-pool.mjs
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(resolve('docs/design/og/pool-figures-og.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: 'apps/pool/public/og.png',
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
await browser.close();
