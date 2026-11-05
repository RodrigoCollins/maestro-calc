import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routes.ts';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { longTailTextProblems } from '../site-check/seo.ts';
import { longTailPageOf } from './jobs.ts';
import { LONG_TAIL_JOBS, pathOf } from './routes.ts';

const PAGES = LONG_TAIL_JOBS.flatMap((job) =>
  (['en', 'es'] as const).map((lang) => ({
    ...longTailPageOf(job, lang),
    path: pathOf(job, lang),
  })),
);

describe('the search result of every long-tail page', () => {
  it.each(PAGES)('$path has a title a result shows whole', ({ title }) => {
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
  });

  it.each(PAGES)('$path has a description a result does not cut', ({ description }) => {
    expect(description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
    expect(description.length).toBeLessThanOrEqual(DESCRIPTION.max);
  });

  it.each(PAGES)('$path names the calculator it answers for, for its breadcrumb', (page) => {
    const path = page.calculator.href.replace(/\?.*$/, '');
    const route = ROUTES.find((each) => each.en === path || each.es === path);
    expect(route?.kind).toBe('calculator');
    expect(page.calculator.title).toMatch(/\S \| Cuenta Horas$/);
  });

  it('carries the numbers of its own address in its title and its description', () => {
    expect(longTailTextProblems(PAGES)).toEqual([]);
  });
});
