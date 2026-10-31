import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';
import { SITE } from '../site.config.ts';
import { indexNowRequest } from './indexnow.ts';
import { sitemapXml } from './sitemap.ts';

const locsOf = (xml: string): string[] =>
  Array.from(xml.matchAll(/<loc>([^<]*)<\/loc>/g), (match) => match[1] ?? '');

const fixture = {
  about: { en: '/about', es: '/es/sobre-nosotros' },
} as const;

describe('IndexNow (site-seo › IndexNow)', () => {
  // spec: site-seo › [IN1]
  it('publishes the key at /<key>.txt with the key as the whole body', () => {
    expect(SITE.indexNowKey).toMatch(/^[0-9a-f]{32}$/);
    const body = readFileSync(fromRoot(`apps/web/public/${SITE.indexNowKey}.txt`), 'utf8');
    expect(body).toBe(SITE.indexNowKey);
  });

  // spec: site-seo › [IN2]
  it('names the host, the key and its location, and lists the sitemap URLs in order', () => {
    const request = indexNowRequest();
    expect(request).toEqual({
      host: 'maestrocalc.com',
      key: SITE.indexNowKey,
      keyLocation: `https://maestrocalc.com/${SITE.indexNowKey}.txt`,
      urlList: locsOf(sitemapXml()),
    });
    expect(new Set(request.urlList).size).toBe(request.urlList.length);
    expect(request.urlList.filter((url) => url.includes('?'))).toEqual([]);
  });

  it('derives the list from the table it is given, both locales per page', () => {
    expect(indexNowRequest(fixture).urlList).toEqual([
      'https://maestrocalc.com/about',
      'https://maestrocalc.com/es/sobre-nosotros',
    ]);
  });
});
