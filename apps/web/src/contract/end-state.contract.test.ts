import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { ROUTES, staticPaths, urlOf } from '../routing/routes.ts';
import { sitemapXml } from '../seo/sitemap.ts';
import { pageCount } from '../site-check/files.ts';
import { readEntries } from './content.ts';
import { fromRoot } from './root.ts';

// The only place where the end-of-change counts are pinned (every other test derives them from
// `ROUTES`): the table holds six ids, so the site has twelve routable pages and two not-found pages.
describe('end state of the web shell change (site-routing-i18n › [SR1], site-seo › [SE10], [SE14])', () => {
  // spec: site-routing-i18n › [SR1]
  it('has six page ids, twelve routable paths and fourteen pages with the 404s', () => {
    expect(Object.keys(ROUTES)).toEqual([
      'home',
      'methodology',
      'about',
      'privacy',
      'terms',
      'contact',
    ]);
    expect(staticPaths()).toHaveLength(12);
    expect(Object.values(ROUTES).flatMap(({ en, es }) => [urlOf(en), urlOf(es)])).toHaveLength(12);
    // spec: site-seo › [SE14]
    expect(pageCount(ROUTES)).toBe(14);
  });

  // spec: i18n-catalog › [ICW1]
  it.each([
    ['en', enSite],
    ['es', esSite],
  ] as const)('has exactly fourteen page title and description keys in %s', (_locale, module) => {
    expect(
      Object.keys(module).filter((key) => /^page\.[^.]+\.(title|description)$/.test(key)),
    ).toHaveLength(14);
  });

  // spec: trust-pages › [TP1]
  it('has ten content entries', () => {
    expect(readEntries(fromRoot('apps/web/src/content/pages'))).toHaveLength(10);
  });

  // spec: site-seo › [SE10]
  it('lists twelve URLs in the sitemap', () => {
    expect(sitemapXml().match(/<loc>/g)).toHaveLength(12);
  });
});
