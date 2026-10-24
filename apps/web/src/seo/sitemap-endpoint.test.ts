import { describe, expect, it } from 'vitest';
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
});
