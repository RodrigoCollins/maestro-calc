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
// `ROUTES`, `CALCULATOR_PAGES` and `PAGELESS`): the table holds nineteen ids, so the site has thirty-eight
// routable pages and two not-found pages.
describe('end state of the tape measure guide go-live (site-routing-i18n › [SR1], [SR19], site-seo › [SE10], [SE14])', () => {
  // spec: site-routing-i18n › [SR1], [SR19]
  it('has nineteen page ids, thirty-eight routable paths and forty pages with the 404s', () => {
    expect(Object.keys(ROUTES)).toEqual([
      'home',
      'methodology',
      'about',
      'privacy',
      'terms',
      'contact',
      'embed-calculators',
      'guide-concrete-bags-or-truck',
      'guide-tape-measure-fractions',
      'concrete',
      'rectangle-area',
      'gravel',
      'mulch',
      'topsoil',
      'paint',
      'drywall',
      'roof-pitch',
      'roofing',
      'feet-inches',
    ]);
    expect(staticPaths()).toHaveLength(38);
    expect(Object.values(ROUTES).flatMap(({ en, es }) => [urlOf(en), urlOf(es)])).toHaveLength(38);
    // spec: site-seo › [SE14]
    expect(pageCount(ROUTES)).toBe(40);
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
      'feet-inches',
    ]);
    expect(PAGELESS).toEqual([]);
  });

  // spec: i18n-catalog › [ICW1]
  it.each([
    ['en', enSite],
    ['es', esSite],
  ] as const)('has exactly forty page title and description keys in %s', (_locale, module) => {
    expect(
      Object.keys(module).filter((key) => /^page\.[^.]+\.(title|description)$/.test(key)),
    ).toHaveLength(40);
  });

  // spec: trust-pages › [TP1], site-routing-i18n › [SR19]
  // two entries per calculator page: thirty-six content entries in all
  it('has sixteen trust entries and twenty calculator entries', () => {
    expect(readEntries(fromRoot('apps/web/src/content/pages'))).toHaveLength(16);
    expect(readEntries(fromRoot('apps/web/src/content/calculators'))).toHaveLength(20);
  });

  // spec: site-seo › [SE10]
  it('lists thirty-eight URLs in the sitemap', () => {
    expect(sitemapXml().match(/<loc>/g)).toHaveLength(38);
  });
});
