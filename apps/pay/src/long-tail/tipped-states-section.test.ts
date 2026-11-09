import { describe, expect, it } from 'vitest';
import {
  TIPPED_STATES,
  TIPPED_STATES_GUIDE_PATHS,
  TIPPED_STATES_SOURCES,
} from '../guide/tipped-states.ts';
import { longTailPageOf, TIPPED } from './jobs.ts';
import type { Tipped } from './routes.ts';
import type { LongTailSection } from './sections.ts';

const LANGS = ['en', 'es'] as const;

const jobOf = (slug: string): Tipped => {
  const job = TIPPED.find((each) => each.slug.en === slug);
  if (job === undefined) throw new Error(`no tipped page ${slug}`);
  return job;
};
const statesOf = (slug: string, lang: 'en' | 'es' = 'en'): LongTailSection => {
  const section = longTailPageOf(jobOf(slug), lang).sections?.find(({ id }) => id === 'states');
  if (section === undefined) throw new Error(`no states section on ${slug}`);
  return section;
};
const rowOf = (section: LongTailSection, state: string): readonly string[] | undefined =>
  section.table?.rows.find(([name]) => name === state);
const textOf = (section: LongTailSection): string =>
  [...section.paragraphs, ...(section.after ?? []), ...(section.table?.rows.flat() ?? [])].join(
    ' ',
  );

describe('the state section of a tipped page', () => {
  it('runs the page week under every state of the tipped minimum wage table, in both languages', () => {
    for (const job of TIPPED) {
      for (const lang of LANGS) {
        const section = statesOf(job.slug.en, lang);
        expect(section.table?.rows.map(([name]) => name)).toEqual(
          TIPPED_STATES.map(({ name }) => name[lang]),
        );
        expect(section.table?.head).toHaveLength(5);
        expect(textOf(section)).not.toMatch(/undefined|NaN|\$-/);
        expect(section.links?.map(({ href }) => href)).toEqual([TIPPED_STATES_GUIDE_PATHS[lang]]);
        const hrefs = longTailPageOf(job, lang).sources?.map(({ href }) => href) ?? [];
        for (const source of Object.values(TIPPED_STATES_SOURCES)) {
          expect(hrefs).toContain(source.href);
        }
      }
    }
  });

  it('works a 40-hour week with $100 in tips out under each state', () => {
    const section = statesOf('2-13-an-hour-plus-100-in-tips-for-40-hours');
    // 2.13 x 40 = 85.20; tips 100 count of the 5.12 x 40 = 204.80 credit; 290 - 185.20 = 104.80
    expect(rowOf(section, 'Alabama')).toEqual(['Alabama', '$2.13', '$104.80', '$290.00', '$7.25']);
    // no tip credit: 16.90 x 40 = 676 + 100 = 776, 19.40 an hour
    expect(rowOf(section, 'California')).toEqual([
      'California',
      '$16.90',
      '$0.00',
      '$776.00',
      '$19.40',
    ]);
    // 12.15 x 40 = 486; credit 100 of 3.00 x 40 = 120, so 20 is owed: 606, 15.15 an hour
    expect(rowOf(section, 'Arizona')).toEqual(['Arizona', '$12.15', '$20.00', '$606.00', '$15.15']);
    // Hawaii: 14.75 x 40 + 100 = 690 is under (16 + 7) x 40 = 920, so no tip credit: 16 x 40 + 100
    expect(rowOf(section, 'Hawaii')).toEqual(['Hawaii', '$16.00', '$0.00', '$740.00', '$18.50']);
    // the week pays least where the state keeps $7.25 and most in Washington, DC or California
    expect(section.paragraphs.join(' ')).toContain('$290.00');
  });

  it('prices the overtime of a 50-hour week on each state minimum', () => {
    const section = statesOf('tipped-overtime-for-50-hours-at-2-13-an-hour');
    // 2.13 x 50 = 106.50; 10 h x 7.25 / 2 = 36.25; + 400 = 542.75
    expect(rowOf(section, 'Alabama')).toEqual(['Alabama', '$2.13', '$0.00', '$542.75', '$10.86']);
    // 16.90 x 50 = 845; 10 h x 8.45 = 84.50; + 400 = 1,329.50, 26.59 an hour
    expect(rowOf(section, 'California')).toEqual([
      'California',
      '$16.90',
      '$0.00',
      '$1,329.50',
      '$26.59',
    ]);
    // Hawaii: 14.75 x 50 + 400 = 1,137.50 is under 23 x 50 = 1,150: the full $16.00
    expect(rowOf(section, 'Hawaii')?.[1]).toBe('$16.00');
  });

  it('keeps the tip credit in Hawaii when wages and tips clear the minimum by $7.00 an hour', () => {
    // 14.75 + 800 / 40 = 34.75 an hour, above 23: the $14.75 cash wage stands
    const section = statesOf('800-in-tips-over-40-hours-is-how-much-an-hour');
    expect(rowOf(section, 'Hawaii')).toEqual(['Hawaii', '$14.75', '$0.00', '$1,390.00', '$34.75']);
    expect(
      rowOf(statesOf('800-in-tips-over-40-hours-is-how-much-an-hour', 'es'), 'Hawái')?.[1],
    ).toBe('$14.75');
  });
});
