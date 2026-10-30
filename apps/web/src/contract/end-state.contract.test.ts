import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { ROUTES, staticPaths, urlOf } from '../routing/routes.ts';
import { CALCULATOR_PAGES, PAGELESS } from '../routing/templates.ts';
import { sitemapXml } from '../seo/sitemap.ts';
import { pageCount } from '../site-check/files.ts';
import { readEntries } from './content.ts';
import { fromRoot } from './root.ts';

// The only place where the end-of-change counts are pinned (every other test derives them from
// `ROUTES`, `CALCULATOR_PAGES` and `PAGELESS`): the table holds fifteen ids, so the site has thirty
// routable pages and two not-found pages.
describe('end state of the roofing go-live (site-routing-i18n › [SR1], [SR19], site-seo › [SE10], [SE14])', () => {
  // spec: site-routing-i18n › [SR1], [SR19]
  it('has fifteen page ids, thirty routable paths and thirty-two pages with the 404s', () => {
    expect(Object.keys(ROUTES)).toEqual([
      'home',
      'methodology',
      'about',
      'privacy',
      'terms',
      'contact',
      'concrete',
      'rectangle-area',
      'gravel',
      'mulch',
      'topsoil',
      'paint',
      'drywall',
      'roof-pitch',
      'roofing',
    ]);
    expect(staticPaths()).toHaveLength(30);
    expect(Object.values(ROUTES).flatMap(({ en, es }) => [urlOf(en), urlOf(es)])).toHaveLength(30);
    // spec: site-seo › [SE14]
    expect(pageCount(ROUTES)).toBe(32);
  });

  // spec: site-routing-i18n › [SR17] every registry calculator has a page (gravel, mulch and
  // topsoil after the owner approved them on 2026-10-29, paint and drywall on 2026-10-30 under the same
  // advance approval; PLAN §5.2), so no calculator is pageless
  it('routes every calculator with the calculator template and leaves none without a page', () => {
    expect(CALCULATOR_PAGES).toEqual([
      'concrete',
      'rectangle-area',
      'gravel',
      'mulch',
      'topsoil',
      'paint',
      'drywall',
      'roof-pitch',
      'roofing',
    ]);
    expect(PAGELESS).toEqual([]);
  });

  // spec: i18n-catalog › [ICW1]
  it.each([
    ['en', enSite],
    ['es', esSite],
  ] as const)('has exactly thirty-two page title and description keys in %s', (_locale, module) => {
    expect(
      Object.keys(module).filter((key) => /^page\.[^.]+\.(title|description)$/.test(key)),
    ).toHaveLength(32);
  });

  // spec: trust-pages › [TP1], site-routing-i18n › [SR19]
  // two entries per calculator page: twenty-eight content entries in all
  it('has ten trust entries and eighteen calculator entries', () => {
    expect(readEntries(fromRoot('apps/web/src/content/pages'))).toHaveLength(10);
    expect(readEntries(fromRoot('apps/web/src/content/calculators'))).toHaveLength(18);
  });

  // spec: site-seo › [SE10]
  it('lists thirty URLs in the sitemap', () => {
    expect(sitemapXml().match(/<loc>/g)).toHaveLength(30);
  });
});
