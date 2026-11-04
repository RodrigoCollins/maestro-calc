import { describe, expect, it } from 'vitest';
import { hoursText, moneyText } from '../format.ts';
import { figuresOf } from '../methodology/examples.ts';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { ROUTES } from '../routes.ts';
import {
  OVERTIME_GUIDE_PATHS,
  OVERTIME_GUIDE_WEEKS,
  OVERTIME_GUIDES,
  type OvertimeGuide,
} from './overtime.ts';

// The weeks the two guides publish, verified by hand at $22 an hour (time and a half $33,
// double time $44). The pages render what the engine returns; this pins it.
const HAND = {
  federal: {
    // 49.5 h: 40 regular, 9.5 over 40
    'federal-week': { regular: '40', overtime: '9.5', double: '0', pay: '$1,193.50' },
    // 40 h with no daily overtime
    'federal-four-tens': { regular: '40', overtime: '0', double: '0', pay: '$880.00' },
    // 2 h over 8 on each of four days
    'california-four-tens': { regular: '32', overtime: '8', double: '0', pay: '$968.00' },
  },
  california: {
    // DLSE 2000.01.19: 10 hours of overtime, none counted again for the week
    'california-ten-hour-days': { regular: '40', overtime: '10', double: '0', pay: '$1,210.00' },
    // DLSE 2000.01.19: a 40-hour week with 4 hours of daily overtime
    'california-nine-and-four': { regular: '36', overtime: '4', double: '0', pay: '$924.00' },
    // DLSE 2000.01.19: no daily overtime, 2 hours over 40 in the week
    'california-six-sevens': { regular: '40', overtime: '2', double: '0', pay: '$946.00' },
    // 8 regular, 4 to 12 at time and a half, 1 past 12 at double time
    'california-long-day': { regular: '8', overtime: '4', double: '1', pay: '$352.00' },
    // Mon-Sat 48 h: 40 regular, 8 over 40; Sunday: 8 at time and a half, 2 at double time
    'california-seventh-day': { regular: '40', overtime: '16', double: '2', pay: '$1,496.00' },
  },
} as const satisfies Record<OvertimeGuide, Record<string, unknown>>;

const GUIDES = Object.keys(OVERTIME_GUIDES) as OvertimeGuide[];
const PRIMARY = /^https:\/\/www\.(dol\.gov|ecfr\.gov|dir\.ca\.gov)\//;

describe('the overtime guides', () => {
  it.each(GUIDES)('%s: publishes exactly the hand-verified weeks, in order', (guide) => {
    expect(OVERTIME_GUIDE_WEEKS[guide].map(({ id }) => id)).toEqual(Object.keys(HAND[guide]));
  });

  const cases = GUIDES.flatMap((guide) =>
    OVERTIME_GUIDE_WEEKS[guide].map((week) => ({
      guide,
      week,
      hand: (HAND[guide] as Readonly<Record<string, unknown>>)[week.id],
    })),
  );

  it.each(cases)('$guide: the time card gives the hand-verified figures for $week.id', (row) => {
    const figures = figuresOf(row.week);
    expect({
      regular: hoursText(figures.regularHours),
      overtime: hoursText(figures.overtimeHours),
      double: hoursText(figures.doubleHours),
      pay: moneyText(figures.pay),
    }).toEqual(row.hand);
  });

  it.each(GUIDES)('%s: labels every week in both languages', (guide) => {
    const ids = OVERTIME_GUIDE_WEEKS[guide].map(({ id }) => id).sort();
    for (const texts of Object.values(OVERTIME_GUIDES[guide])) {
      expect(Object.keys(texts.examples?.labels ?? {}).sort()).toEqual(ids);
    }
  });

  it.each(GUIDES)(
    '%s: has the same sections in both languages, each with a primary source',
    (guide) => {
      const { en, es } = OVERTIME_GUIDES[guide];
      expect(es.sections.map(({ sources }) => sources)).toEqual(
        en.sections.map(({ sources }) => sources),
      );
      for (const { sources } of en.sections) {
        expect(sources.length).toBeGreaterThan(0);
        for (const { href } of sources) expect(href).toMatch(PRIMARY);
      }
    },
  );

  it.each(GUIDES)('%s: keeps titles short and links pages of its own language', (guide) => {
    for (const [lang, texts] of Object.entries(OVERTIME_GUIDES[guide])) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.ctas.length).toBeGreaterThan(0);
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
  });

  it.each(GUIDES)('%s: is an article of the route table', (guide) => {
    expect(ROUTES).toContainEqual(
      expect.objectContaining({ kind: 'article', ...OVERTIME_GUIDE_PATHS[guide] }),
    );
  });
});

describe('overtime guides: the calculator they open', () => {
  it.each(['federal', 'california'] as const)(
    '%s: the first call to action opens the overtime calculator in its own language',
    (guide) => {
      expect(OVERTIME_GUIDES[guide].en.ctas[0]?.href).toBe(OVERTIME_PATHS.en);
      expect(OVERTIME_GUIDES[guide].es.ctas[0]?.href).toBe(OVERTIME_PATHS.es);
    },
  );
});
