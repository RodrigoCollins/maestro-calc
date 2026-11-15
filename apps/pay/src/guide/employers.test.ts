import { describe, expect, it } from 'vitest';
import { decode } from '@maestro-calc/core';
import { timeCard } from '@maestro-calc/pay-core/time-card';
import { MEAL_PERIODS } from '../long-tail/meal-periods.ts';
import { statePathOf } from '../states/routes.ts';
import { GUIDE_CALCULATORS } from '../site-check/link-rules.ts';
import { TIME_CARD_PATHS } from '../long-tail/jobs.ts';
import {
  EMPLOYER_GUIDE_LINKS,
  EMPLOYER_HOURS_GUIDE,
  EMPLOYER_HOURS_GUIDE_LINKS,
  EMPLOYER_HOURS_GUIDE_PATHS,
  TIME_APPS,
  TIME_APPS_GUIDE,
  TIME_APPS_GUIDE_PATHS,
  TIMESHEET_CREW,
  TIMESHEET_GUIDE,
  TIMESHEET_GUIDE_PATHS,
} from './employers.ts';

const LANGS = ['en', 'es'] as const;
const GUIDES = [EMPLOYER_HOURS_GUIDE, TIMESHEET_GUIDE, TIME_APPS_GUIDE];

describe('the crew timesheet example', () => {
  // by hand: Ana 5 × (8:00 to 16:30 less 30 min) = 40 h × $18 = $720.00; Luis 5 × (7:00 to 16:00
  // less 30 min) = 42.5 h, 40 × $20 + 2.5 × $30 = $875.00; Marta 3 × (9:00 to 14:00) = 15 h × $16
  // = $240.00; the crew, 97.5 h and $1,835.00
  it('gives each worker the time card’s own week, hand-verified', () => {
    expect(
      TIMESHEET_CREW.rows.map(({ name, days, total, overtime, pay }) => ({
        name,
        days,
        total,
        overtime,
        pay,
      })),
    ).toEqual([
      {
        name: 'Ana',
        days: ['8', '8', '8', '8', '8', '0', '0'],
        total: '40',
        overtime: '0',
        pay: '$720.00',
      },
      {
        name: 'Luis',
        days: ['8.5', '8.5', '8.5', '8.5', '8.5', '0', '0'],
        total: '42.5',
        overtime: '2.5',
        pay: '$875.00',
      },
      {
        name: 'Marta',
        days: ['5', '0', '5', '0', '5', '0', '0'],
        total: '15',
        overtime: '0',
        pay: '$240.00',
      },
    ]);
    expect(TIMESHEET_CREW.total).toEqual({ hours: '97.5', pay: '$1,835.00' });
  });

  it.each(LANGS)('prints a blank sheet of numbered rows, a header on every row (%s)', (lang) => {
    const blank = TIMESHEET_GUIDE[lang].tables?.[0];
    expect(blank?.id).toBe('blank-timesheet');
    expect(blank?.columns).toHaveLength(11);
    expect(blank?.rows.map((row) => row[0]?.text)).toEqual(['1', '2', '3', '4', '5', '6']);
    for (const row of blank?.rows ?? []) expect(row).toHaveLength(11);
  });

  it.each(LANGS)('opens each worker’s week in the time card (%s)', (lang) => {
    for (const row of TIMESHEET_CREW.rows) {
      const [path, query] = row.href[lang].split('?');
      expect(path).toBe(TIME_CARD_PATHS[lang]);
      expect(decode(timeCard, query ?? '').state.rate).toBeDefined();
    }
  });
});

describe('the time-tracking apps table', () => {
  it('cites each fact on the vendor’s own pricing page, with the day it was read', () => {
    expect(TIME_APPS.map(({ id }) => id)).toEqual(['clockify', 'jibble', 'connecteam', 'deputy']);
    for (const app of TIME_APPS) {
      const home = new URL(app.homepage);
      const pricing = new URL(app.pricing);
      expect(pricing.hostname).toBe(home.hostname);
      expect(app.checked).toBe('2026-11-15');
    }
  });

  it.each(LANGS)('shows the facts as read, with no rank (%s)', (lang) => {
    const table = TIME_APPS_GUIDE[lang].tables?.[0];
    expect(table?.rows.map((row) => row[0]?.text)).toEqual([
      'Clockify',
      'Jibble',
      'Connecteam',
      'Deputy',
    ]);
    const text = JSON.stringify(TIME_APPS_GUIDE[lang]);
    expect(text).not.toMatch(/\b(best|top pick|#1|winner|mejor opción|el mejor)\b/i);
    expect(text).toContain('$3.99');
    expect(text).toContain('$29');
    expect(text).toContain('$5');
  });
});

describe('the employer guides', () => {
  it.each(LANGS)('fit the head limits of the site check (%s)', (lang) => {
    for (const guide of GUIDES) {
      expect(guide[lang].title.length, guide[lang].title).toBeLessThanOrEqual(70);
      expect(guide[lang].description.length, guide[lang].description).toBeGreaterThanOrEqual(70);
      expect(guide[lang].description.length, guide[lang].description).toBeLessThanOrEqual(160);
    }
  });

  it.each(LANGS)('keep the same sections in both languages (%s)', (lang) => {
    for (const guide of GUIDES) {
      expect(guide[lang].sections.map(({ id }) => id)).toEqual(
        guide.en.sections.map(({ id }) => id),
      );
    }
  });

  it('cite the FLSA record rules and the rounding rule on eCFR', () => {
    const hrefs = EMPLOYER_HOURS_GUIDE.en.sections.flatMap(({ sources }) =>
      sources.map(({ href }) => href),
    );
    for (const section of ['516.1', '516.2', '516.5', '516.6', '785.48'])
      expect(
        hrefs.some((href) => href.includes(`section-${section}`)),
        section,
      ).toBe(true);
  });

  it.each(LANGS)('send break rules to the state pages of the DOL meal table (%s)', (lang) => {
    expect(EMPLOYER_HOURS_GUIDE_LINKS[lang].links.map(({ href }) => href)).toEqual(
      MEAL_PERIODS.map(({ state }) => statePathOf(state[lang], lang)),
    );
  });

  it.each(LANGS)('are listed for employers on the calculators (%s)', (lang) => {
    expect(EMPLOYER_GUIDE_LINKS[lang].links.map(({ href }) => href)).toEqual([
      EMPLOYER_HOURS_GUIDE_PATHS[lang],
      TIMESHEET_GUIDE_PATHS[lang],
      TIME_APPS_GUIDE_PATHS[lang],
    ]);
  });

  it('explain the time card, and the overtime calculator for the record rules', () => {
    expect(GUIDE_CALCULATORS['employer-hours-guide']).toEqual(['time-card', 'overtime']);
    expect(GUIDE_CALCULATORS['timesheet-guide']).toEqual(['time-card']);
    expect(GUIDE_CALCULATORS['time-apps-guide']).toEqual(['time-card']);
  });
});
