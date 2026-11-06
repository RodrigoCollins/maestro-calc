import { describe, expect, it } from 'vitest';
import { BYLINE_PAGES, bylinePageOf } from './bylines.ts';
import { DATA_PAGES_OF } from './charts.ts';
import { GUIDES } from './guide.ts';
import { JOB_PAGES } from './jobs.ts';
import { METHOD_SECTIONS } from './methodology.ts';
import { routeOf } from './routes.ts';

const paths = BYLINE_PAGES.map(({ path }) => path);

describe('the pages with a byline', () => {
  it('are every guide and data page in both languages, and every job page', () => {
    const guides = GUIDES.flatMap(({ path }) => [path, routeOf(path)?.es ?? path]);
    const data = (['en', 'es'] as const).flatMap((lang) =>
      DATA_PAGES_OF[lang].map(({ path }) => path),
    );
    expect([...paths].sort()).toEqual(
      [...new Set([...guides, ...data, ...JOB_PAGES.map(({ path }) => path)])].sort(),
    );
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) expect(routeOf(path), path).toBeDefined();
  });

  // the date is the one the page's data carries: the data pages have it, the others print none
  it('give the day a data page was last checked, and no day to a page whose data has none', () => {
    for (const lang of ['en', 'es'] as const)
      for (const { path, checked } of DATA_PAGES_OF[lang])
        expect(bylinePageOf(path).checked, path).toBe(checked);
    const dated = new Set(
      (['en', 'es'] as const).flatMap((lang) => DATA_PAGES_OF[lang].map(({ path }) => path)),
    );
    for (const { path, checked } of BYLINE_PAGES)
      if (!dated.has(path)) expect(checked, path).toBeUndefined();
  });

  it('list the sources of each page once each, every page with at least one', () => {
    for (const { path, sources } of BYLINE_PAGES) {
      expect(sources.length, path).toBeGreaterThan(0);
      const urls = sources.map(({ name, url }) => url ?? name);
      expect(new Set(urls).size, path).toBe(urls.length);
    }
  });

  // a job page works its figure out with its calculator, so it cites the calculator's sources
  it('give a job page the sources the methodology names for its calculator', () => {
    for (const page of JOB_PAGES) {
      const section = METHOD_SECTIONS.find(({ href }) => href === page.calculator.path);
      expect(section, page.path).toBeDefined();
      expect(bylinePageOf(page.path).sources.map(({ name, url }) => url ?? name)).toEqual([
        ...new Set(section?.sources.map(({ name, url }) => url ?? name)),
      ]);
    }
  });

  it('throws for a page that has no byline', () => {
    expect(() => bylinePageOf('/privacy')).toThrow('/privacy');
  });
});
