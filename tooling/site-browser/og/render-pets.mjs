// Renders docs/design/og/bowl-figures-og.html to apps/pets/public/og.png at 1200x630 with the
// Chromium of this package. Run from the repository root: node tooling/site-browser/og/render-pets.mjs
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(resolve('docs/design/og/bowl-figures-og.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: 'apps/pets/public/og.png',
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
await browser.close();
