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
// `ROUTES`, `CALCULATOR_PAGES` and `PAGELESS`): the table holds fifty ids, so the site has one
// hundred routable pages and two not-found pages.
describe('end state of the guides index go-live (site-routing-i18n › [SR1], [SR19], site-seo › [SE10], [SE14])', () => {
  // spec: site-routing-i18n › [SR1], [SR19]
  it('has fifty page ids, one hundred routable paths and a hundred and two pages with the 404s', () => {
    expect(Object.keys(ROUTES)).toEqual([
      'home',
      'methodology',
      'about',
      'privacy',
      'terms',
      'contact',
      'embed-calculators',
      'glossary',
      'guides',
      'guide-concrete-bags-or-truck',
      'guide-tape-measure-fractions',
      'guide-square-footage',
      'guide-drywall-estimate',
      'guide-roof-pitch',
      'guide-concrete-quote',
      'guide-contractor-license',
      'guide-paint-quote',
      'guide-gravel-driveway',
      'guide-raised-bed-soil',
      'guide-roofing-quote',
      'guide-fence-post-concrete',
      'hub-concrete',
      'hub-roofing',
      'hub-drywall',
      'hub-landscaping',
      'hub-measurement',
      'hub-paint',
      'concrete-slab-10x10',
      'concrete-slab-10x12',
      'concrete-slab-12x12',
      'concrete-slab-20x20',
      'concrete-slab-24x24',
      'concrete-pad-4x4',
      'concrete-tube-8',
      'concrete-tube-10',
      'concrete-tube-12',
      'roof-pitch-4-12',
      'roof-pitch-6-12',
      'roof-pitch-8-12',
      'roof-pitch-12-12',
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
    expect(staticPaths()).toHaveLength(100);
    expect(Object.values(ROUTES).flatMap(({ en, es }) => [urlOf(en), urlOf(es)])).toHaveLength(100);
    // spec: site-seo › [SE14]
    expect(pageCount(ROUTES)).toBe(102);
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
  ] as const)(
    'has exactly a hundred and two page title and description keys in %s',
    (_locale, module) => {
      expect(
        Object.keys(module).filter((key) => /^page\.[^.]+\.(title|description)$/.test(key)),
      ).toHaveLength(102);
    },
  );

  // spec: trust-pages › [TP1], site-routing-i18n › [SR19]
  // two entries per calculator page: seventy-two content entries in all
  it('has fifty-two trust entries and twenty calculator entries', () => {
    expect(readEntries(fromRoot('apps/web/src/content/pages'))).toHaveLength(52);
    expect(readEntries(fromRoot('apps/web/src/content/calculators'))).toHaveLength(20);
  });

  // spec: site-seo › [SE10]
  it('lists one hundred URLs in the sitemap', () => {
    expect(sitemapXml().match(/<loc>/g)).toHaveLength(100);
  });
});
