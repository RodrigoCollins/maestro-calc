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
// `ROUTES`, `CALCULATOR_PAGES` and `PAGELESS`): the table holds nine ids, so the site has eighteen
// routable pages and two not-found pages.
describe('end state of the gravel go-live (site-routing-i18n › [SR1], [SR19], site-seo › [SE10], [SE14])', () => {
  // spec: site-routing-i18n › [SR1], [SR19]
  it('has nine page ids, eighteen routable paths and twenty pages with the 404s', () => {
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
    ]);
    expect(staticPaths()).toHaveLength(18);
    expect(Object.values(ROUTES).flatMap(({ en, es }) => [urlOf(en), urlOf(es)])).toHaveLength(18);
    // spec: site-seo › [SE14]
    expect(pageCount(ROUTES)).toBe(20);
  });

  // spec: site-routing-i18n › [SR17] concrete, rectangle-area and gravel have a page (gravel after
  // the owner approved its numbers on 2026-10-29); mulch and topsoil follow (PLAN §5.2)
  it('routes concrete, rectangle-area and gravel with the calculator template and leaves mulch and topsoil without a page', () => {
    expect(CALCULATOR_PAGES).toEqual(['concrete', 'rectangle-area', 'gravel']);
    expect(PAGELESS).toEqual(['mulch', 'topsoil']);
  });

  // spec: i18n-catalog › [ICW1]
  it.each([
    ['en', enSite],
    ['es', esSite],
  ] as const)('has exactly twenty page title and description keys in %s', (_locale, module) => {
    expect(
      Object.keys(module).filter((key) => /^page\.[^.]+\.(title|description)$/.test(key)),
    ).toHaveLength(20);
  });

  // spec: trust-pages › [TP1], site-routing-i18n › [SR19]
  // two entries per calculator page: sixteen content entries in all
  it('has ten trust entries and six calculator entries', () => {
    expect(readEntries(fromRoot('apps/web/src/content/pages'))).toHaveLength(10);
    expect(readEntries(fromRoot('apps/web/src/content/calculators'))).toHaveLength(6);
  });

  // spec: site-seo › [SE10]
  it('lists eighteen URLs in the sitemap', () => {
    expect(sitemapXml().match(/<loc>/g)).toHaveLength(18);
  });
});
