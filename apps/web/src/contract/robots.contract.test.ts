import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

const lines = readFileSync(fromRoot('apps/web/public/robots.txt'), 'utf8')
  .split('\n')
  .filter((line) => line !== '');

describe('robots.txt (site-seo › Robots, [SE9])', () => {
  it('allows everything and names the sitemap, nothing else', () => {
    expect(lines).toEqual([
      'User-agent: *',
      'Allow: /',
      'Sitemap: https://maestrocalc.com/sitemap.xml',
    ]);
  });

  it('disallows nothing', () => {
    expect(lines.filter((line) => line.startsWith('Disallow: /'))).toEqual([]);
    expect(lines.length).toBeGreaterThan(0);
  });
});
