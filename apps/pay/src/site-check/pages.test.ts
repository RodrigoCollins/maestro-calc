import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COUNTDOWNS, countdownPathOf } from '../dates/routes.ts';
import { LIVE_JOBS, LONG_TAIL_ROUTES } from '../long-tail/routes.ts';
import { CALCULATOR_PAGES, LIVE_PAGES } from './pages.ts';

const builtOf = (path: string): string => `${path.slice(1)}.html`;

describe('CALCULATOR_PAGES', () => {
  it('names a built page of a source page in src/pages, or a live long-tail page', () => {
    const longTail = new Set([
      ...LONG_TAIL_ROUTES.flatMap(({ en, es }) => [builtOf(en), builtOf(es)]),
      // the countdowns are built by `es/fechas/[slug].astro`
      ...COUNTDOWNS.map((job) => builtOf(countdownPathOf(job))),
    ]);
    for (const page of CALCULATOR_PAGES) {
      if (longTail.has(page)) continue;
      const source = resolve(import.meta.dirname, '../pages', page.replace(/\.html$/, '.astro'));
      expect(existsSync(source), source).toBe(true);
    }
  });

  it('lets each live time page, in both languages, load its one script', () => {
    expect(LIVE_PAGES).toHaveLength(LIVE_JOBS.length * 2);
    expect(LIVE_PAGES).toContain('pay/15-hours-ago.html');
    expect(LIVE_PAGES).toContain('es/pago/cuanto-falta-para-las-3-00-pm.html');
    expect(LIVE_PAGES).toContain('es/pago/hace-30-dias.html');
    for (const page of LIVE_PAGES) expect(CALCULATOR_PAGES).toContain(page);
    // the other long-tail pages load no script
    expect(CALCULATOR_PAGES).not.toContain('pay/how-many-days-is-72-hours.html');
  });
});
