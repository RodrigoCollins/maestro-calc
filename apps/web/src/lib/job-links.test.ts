import { describe, expect, it } from 'vitest';
import { JOBS, jobsOf } from '../routing/jobs.ts';
import { LOCALES, pathOf } from '../routing/routes.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { jobLinks } from './job-links.ts';
import { siteText } from './site-text.ts';

// spec: growth › lever 1, the "Common jobs" list of a calculator page and of its hub
describe('jobLinks', () => {
  it.each(LOCALES)(
    'links every job of a calculator, in table order, by its heading and its short label (%s)',
    (locale) => {
      expect(jobLinks('concrete', locale)).toEqual(
        jobsOf('concrete').map((id) => ({
          href: pathOf(id, locale),
          title: siteText(locale)(`page.${id}.heading`),
          label: siteText(locale)(`page.${id}.label`),
        })),
      );
    },
  );

  it.each(LOCALES)(
    'keeps every short label short: a calculator page lists them all (%s)',
    (locale) => {
      for (const id of CALCULATOR_PAGES) {
        for (const { label, title } of jobLinks(id, locale)) {
          expect(label.length, label).toBeLessThanOrEqual(28);
          expect(label.length, label).toBeLessThan(title.length);
        }
      }
    },
  );

  it('gives a calculator with no job pages an empty list', () => {
    const jobless = CALCULATOR_PAGES.filter((id) => jobsOf(id).length === 0);
    expect(jobless.length).toBeGreaterThan(0);
    for (const id of jobless) expect(jobLinks(id, 'en')).toEqual([]);
  });

  it('can leave one job out: a job page lists the others', () => {
    const [first, ...rest] = jobsOf('concrete');
    expect(jobLinks('concrete', 'en', first).map(({ href }) => href)).toEqual(
      rest.map((id) => pathOf(id, 'en')),
    );
  });

  it('covers every job of the table once across the calculators', () => {
    const all = CALCULATOR_PAGES.flatMap((id) => jobLinks(id, 'es').map(({ href }) => href));
    expect(all).toEqual(CALCULATOR_PAGES.flatMap(jobsOf).map((id) => pathOf(id, 'es')));
    expect(new Set(all).size).toBe(Object.keys(JOBS).length);
  });
});
