import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { imageProblems } from '@maestro-calc/site-kit/seo-check';
import { describe, expect, it } from 'vitest';

// The one image every indexable page names (`og:image`), rendered from
// docs/design/og/pool-figures-og.html by tooling/site-browser/og/render-pool.mjs.
describe('the link preview image', () => {
  it('is a PNG of 1200 by 630 pixels, under 100 KB', () => {
    const png = readFileSync(resolve(import.meta.dirname, '../public/og.png'));
    expect(imageProblems('og.png', png)).toEqual([]);
    expect(png.length).toBeLessThan(100 * 1024);
  });
});
