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
// `ROUTES`, `CALCULATOR_PAGES` and `PAGELESS`): the table holds a hundred and fifteen ids, so the
// site has two hundred and thirty routable pages and two not-found pages.
describe('end state of the square feet to square meters chart (site-routing-i18n › [SR1], [SR19], site-seo › [SE10], [SE14])', () => {
  // spec: site-routing-i18n › [SR1], [SR19]
  it('has a hundred and fifteen page ids, two hundred and thirty routable paths and two hundred and thirty-two pages with the 404s', () => {
    expect(Object.keys(ROUTES)).toEqual([
      'home',
      'methodology',
      'about',
      'editorial-policy',
      'privacy',
      'terms',
      'contact',
      'embed-calculators',
      'glossary',
      'guides',
      'charts',
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
      'guide-mulch',
      'guide-cubic-yards',
      'guide-concrete-bag-coverage',
      'guide-paint-coverage',
      'guide-gravel-coverage',
      'hub-concrete',
      'hub-roofing',
      'hub-drywall',
      'hub-landscaping',
      'hub-measurement',
      'hub-paint',
      'concrete-slab-10x10',
      'concrete-slab-10x12',
      'concrete-slab-10x20',
      'concrete-slab-12x12',
      'concrete-slab-12x20',
      'concrete-slab-12x24',
      'concrete-slab-20x20',
      'concrete-slab-24x24',
      'concrete-slab-500-sq-ft',
      'concrete-slab-650-sq-ft',
      'concrete-slab-1000-sq-ft',
      'concrete-slab-chart',
      'concrete-pad-4x4',
      'concrete-tube-8',
      'concrete-tube-10',
      'concrete-tube-12',
      'concrete-footing-16x8',
      'concrete-footing-20x10',
      'roof-pitch-3-12',
      'roof-pitch-4-12',
      'roof-pitch-5-12',
      'roof-pitch-6-12',
      'roof-pitch-7-12',
      'roof-pitch-7-5-12',
      'roof-pitch-8-12',
      'roof-pitch-9-12',
      'roof-pitch-10-12',
      'roof-pitch-12-12',
      'roof-pitch-chart',
      'square-feet-5x5',
      'square-feet-5x10',
      'square-feet-7x12',
      'square-feet-10x10',
      'square-feet-10x12',
      'square-feet-11x14',
      'square-feet-11x16',
      'square-feet-12x12',
      'square-feet-12x14',
      'square-feet-12x30',
      'square-feet-20x20',
      'square-feet-to-square-meters-chart',
      'mulch-bags-per-yard',
      'gravel-driveway-10x20',
      'gravel-driveway-12x50',
      'gravel-driveway-12x100',
      'cubic-yard-weight-chart',
      'paint-room-10x10',
      'paint-room-10x12',
      'paint-room-12x12',
      'paint-room-12x14',
      'paint-room-12x16',
      'drywall-room-10x10',
      'drywall-room-10x12',
      'drywall-room-12x12',
      'drywall-room-12x14',
      'drywall-room-12x16',
      'topsoil-raised-bed-4x4',
      'topsoil-raised-bed-4x8',
      'topsoil-10x10',
      'topsoil-20x20',
      'roofing-12x16',
      'roofing-24x24',
      'roofing-30x40',
      'roofing-30x50',
      'divide-29-1-4-in-by-2',
      'divide-23-5-8-in-by-2',
      'divide-35-5-in-by-2',
      'divide-22-in-by-10',
      'divide-9-ft-6-in-by-2',
      'divide-3-ft-9-in-by-2',
      'decimal-feet-chart',
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
    expect(staticPaths()).toHaveLength(230);
    expect(Object.values(ROUTES).flatMap(({ en, es }) => [urlOf(en), urlOf(es)])).toHaveLength(230);
    // spec: site-seo › [SE14]
    expect(pageCount(ROUTES)).toBe(232);
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
    'has exactly two hundred and thirty-two page title and description keys in %s',
    (_locale, module) => {
      expect(
        Object.keys(module).filter((key) => /^page\.[^.]+\.(title|description)$/.test(key)),
      ).toHaveLength(232);
    },
  );

  // spec: trust-pages › [TP1], site-routing-i18n › [SR19]
  // two entries per calculator page: eighty-six content entries in all
  it('has sixty-six trust entries and twenty calculator entries', () => {
    expect(readEntries(fromRoot('apps/web/src/content/pages'))).toHaveLength(66);
    expect(readEntries(fromRoot('apps/web/src/content/calculators'))).toHaveLength(20);
  });

  // spec: site-seo › [SE10]
  it('lists two hundred and thirty URLs in the sitemap', () => {
    expect(sitemapXml().match(/<loc>/g)).toHaveLength(230);
  });
});
