import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';
import { GET } from '../pages/sitemap.xml.ts';
import { sitemapXml } from './sitemap.ts';

describe('sitemap endpoint (site-seo › Sitemap, [SE12] source side)', () => {
  it('answers 200 with XML and the body of sitemapXml()', async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/xml; charset=utf-8');
    expect(await response.text()).toBe(sitemapXml());
  });

  it('serves a urlset with a loc, so the body is the generated sitemap and not an empty one', async () => {
    expect(await GET().text()).toContain('<loc>https://maestrocalc.com/</loc>');
  });

  it('no longer depends on the sitemap integration', () => {
    const manifest = JSON.parse(readFileSync(fromRoot('apps/web/package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
    };
    expect(Object.keys(manifest.dependencies)).not.toContain('@astrojs/sitemap');
    const config = readFileSync(fromRoot('apps/web/astro.config.mjs'), 'utf8');
    expect(config).not.toContain('sitemap(');
    expect(config).not.toContain('@astrojs/sitemap');
  });
});
