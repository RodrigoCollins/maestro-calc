import { describe, expect, it } from 'vitest';
import { isPitchJob, JOB_IDS } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import { jobRafter, rafterTable, sixteenths } from './job-rafter.ts';

const PITCHES = JOB_IDS.filter(isPitchJob);
const PAIRS = PITCHES.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

describe('jobRafter (the framing square at an exact pitch)', () => {
  it('rounds inches to the nearest sixteenth in lowest terms', () => {
    expect(sixteenths(14.4222)).toBe('14 7/16 in');
    expect(sixteenths(18.7617)).toBe('18 3/4 in');
    expect(sixteenths(9.98)).toBe('10 in');
    expect(sixteenths(16.97)).toBe('17 in');
  });

  // hand-verified against the rafter table of a steel framing square, 8 in 12: common √(144 + 64)
  // = 14.42, hip √(288 + 64) = 18.76, jacks 16 in 19.23 (19 1/4), 24 in 28.84 (28 7/8), side cut
  // of jacks 144 ÷ 14.42 = 9.98 (10), of hip 12 × 16.97 ÷ 18.76 = 10.85 (10 7/8)
  it('gives the six lines of the 8 in 12 rafter table', () => {
    const lines = rafterTable(8);
    expect(lines.common).toBeCloseTo(14.422, 3);
    expect(lines.hip).toBeCloseTo(18.762, 3);
    expect(jobRafter('roof-pitch-8-12', 'en')?.table?.rows.map(({ cells }) => cells)).toEqual([
      ['14.42', '14 7/16 in'],
      ['18.76', '18 3/4 in'],
      ['19.23', '19 1/4 in'],
      ['28.84', '28 7/8 in'],
      ['9.98', '10 in'],
      ['10.85', '10 7/8 in'],
    ]);
  });

  // hand-verified: atan(8/12) = 33.69°, atan(8/16.97) = 25.24°
  it('sets the square and gives the plumb cut angles of 8 in 12', () => {
    expect(jobRafter('roof-pitch-8-12', 'en')?.facts.map(({ value }) => value)).toEqual([
      '12 in on the body, 8 in on the tongue',
      'atan(8/12) = 33.69°',
      '17 in on the body, 8 in on the tongue',
      'atan(8/16.97) = 25.24°',
    ]);
  });

  // hand-verified, 8 in 12 over a 12 ft run: common 12 × 14.4222 = 173.07 in; jacks 16 in apart
  // step 19.2296 in, the first 153.84 in (153 13/16), the eighth 19.23 in (19 1/4); 24 in apart
  // step 28.8444 in, the first 144.22 in (144 1/4), the fifth 28.84 in (28 7/8), no sixth
  it('lists the jack rafters of a 12 ft run at 16 and 24 in centers', () => {
    const rows = jobRafter('roof-pitch-8-12', 'en')?.more?.table.rows.map(({ label, cells }) => [
      label,
      ...cells,
    ]);
    expect(rows).toHaveLength(8);
    expect(rows?.[0]).toEqual(['1', '153 13/16 in', '144 1/4 in']);
    expect(rows?.[4]).toEqual(['5', '76 15/16 in', '28 7/8 in']);
    expect(rows?.[5]?.[2]).toBe('–');
    expect(rows?.[7]).toEqual(['8', '19 1/4 in', '–']);
  });

  it.each(PAIRS)('explains %s in %s', (id, locale) => {
    const section = jobRafter(id, locale);
    expect(section?.table?.rows).toHaveLength(6);
    expect(section?.paragraphs.join(' ').length).toBeGreaterThan(150);
  });

  it('adds nothing to the pitch chart', () => {
    expect(jobRafter('roof-pitch-chart', 'en')).toBeUndefined();
  });
});
