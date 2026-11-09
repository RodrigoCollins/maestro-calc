import { describe, expect, it } from 'vitest';
import { isPitchJob, JOB_IDS, PITCH_RISES } from '../routing/jobs.ts';
import { LOCALES, pathOf } from '../routing/routes.ts';
import { jobSlope, OSHA_1926_500, OSHA_1926_501 } from './job-slope.ts';

const PITCHES = JOB_IDS.filter(isPitchJob);
const PAIRS = PITCHES.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

// queries: "6/12 roof pitch" (1.8K), "4/12 roof pitch" (900), "roof pitch multiplier" (800)
// (Ahrefs US, 2026-11-08). OSHA 29 CFR 1926.500(b): a low-slope roof is 4 in 12 or less, a steep
// roof more than 4 in 12; 1926.501(b)(10) and (b)(11) set the fall protection of each
describe('jobSlope (working on an exact pitch, and the roof over a footprint)', () => {
  it('classes 4/12 and below as low-slope and every steeper pitch as steep, as OSHA does', () => {
    const steep = PITCHES.filter((id) => jobSlope(id, 'en')?.steep === true);
    expect(steep).toEqual(PITCHES.filter((id) => PITCH_RISES[id] > 4));
    expect(steep).not.toContain('roof-pitch-4-12');
    expect(steep).toContain('roof-pitch-5-12');
    expect(jobSlope('roof-pitch-4-12', 'en')?.osha).toContain('1926.501(b)(10)');
    expect(jobSlope('roof-pitch-5-12', 'en')?.osha).toContain('1926.501(b)(11)');
    expect(jobSlope('roof-pitch-2-12', 'es')?.osha).toContain('1926.501(b)(10)');
    expect(jobSlope('roof-pitch-12-12', 'es')?.osha).toContain('1926.501(b)(11)');
  });

  // hand-verified: rise = pitch ÷ 12 × half the span; 6/12 over 12, 15 and 18 ft of run is 6, 7.5
  // and 9 ft (1.8288, 2.286, 2.7432 m); 2/12 is 2, 2.5 and 3 ft (0.6096, 0.762, 0.9144 m); 12/12 is
  // 12, 15 and 18 ft (3.6576, 4.572, 5.4864 m)
  it('gives the ridge height of a 24, 30 and 36 ft wide gable at the pitch', () => {
    const heights = (id: (typeof PITCHES)[number]) =>
      jobSlope(id, 'en')?.ridge.facts.map(({ value }) => value);
    expect(heights('roof-pitch-6-12')).toEqual([
      '6.00 ft (1.83 m)',
      '7.50 ft (2.29 m)',
      '9.00 ft (2.74 m)',
    ]);
    expect(heights('roof-pitch-2-12')).toEqual([
      '2.00 ft (0.61 m)',
      '2.50 ft (0.76 m)',
      '3.00 ft (0.91 m)',
    ]);
    expect(heights('roof-pitch-12-12')).toEqual([
      '12.00 ft (3.66 m)',
      '15.00 ft (4.57 m)',
      '18.00 ft (5.49 m)',
    ]);
  });

  // hand-verified: roof = footprint × √(1 + (rise ÷ 12)²) before waste; 6/12: √1.25 = 1.118034,
  // 1,118.03, 1,677.05 and 2,236.07 sq ft; 9/12: exactly 1.25; 2/12: √(37/36) = 1.013794, 1,013.79,
  // 1,520.69, 2,027.59; 11/12: √265 ÷ 12 = 1.356568, 1,356.57, 2,034.85, 2,713.14; a square is
  // 100 sq ft
  it('works the roof surface and the squares over 1,000, 1,500 and 2,000 sq ft out', () => {
    const cells = (id: (typeof PITCHES)[number]) =>
      jobSlope(id, 'en')?.area.rows.map(({ label, cells: each }) => [label, ...each]);
    expect(cells('roof-pitch-6-12')).toEqual([
      ['1,000 sq ft', '1,118 sq ft', '11.18'],
      ['1,500 sq ft', '1,677 sq ft', '16.77'],
      ['2,000 sq ft', '2,236 sq ft', '22.36'],
    ]);
    expect(cells('roof-pitch-9-12')).toEqual([
      ['1,000 sq ft', '1,250 sq ft', '12.50'],
      ['1,500 sq ft', '1,875 sq ft', '18.75'],
      ['2,000 sq ft', '2,500 sq ft', '25.00'],
    ]);
    expect(cells('roof-pitch-2-12')?.map((row) => row.slice(1))).toEqual([
      ['1,014 sq ft', '10.14'],
      ['1,521 sq ft', '15.21'],
      ['2,028 sq ft', '20.28'],
    ]);
    expect(cells('roof-pitch-11-12')?.map((row) => row.slice(1))).toEqual([
      ['1,357 sq ft', '13.57'],
      ['2,035 sq ft', '20.35'],
      ['2,713 sq ft', '27.13'],
    ]);
    const area = jobSlope('roof-pitch-6-12', 'es')?.area;
    expect(area?.columns).toHaveLength(3);
    expect(area?.href).toBe(pathOf('roofing', 'es'));
  });

  it.each(PAIRS)('cites OSHA and writes %s a note of its own in %s', (id, locale) => {
    const slope = jobSlope(id, locale);
    expect(slope?.sources).toEqual([OSHA_1926_500, OSHA_1926_501]);
    expect(slope?.osha).toContain('1926.500(b)');
    expect(slope?.note.length).toBeGreaterThan(200);
  });

  it('writes the note of each pitch and language once', () => {
    const notes = PAIRS.map(([id, locale]) => jobSlope(id, locale)?.note);
    expect(new Set(notes).size).toBe(PAIRS.length);
  });

  it('is only for the exact pitch pages', () => {
    expect(jobSlope('roof-pitch-chart', 'en')).toBeUndefined();
    expect(jobSlope('square-feet-12x12', 'es')).toBeUndefined();
    for (const source of [OSHA_1926_500, OSHA_1926_501]) {
      expect(source.url).toMatch(
        /^https:\/\/www\.osha\.gov\/laws-regs\/regulations\/standardnumber\/1926\//,
      );
      expect(source.retrieved).toBe('2026-11-08');
    }
  });
});
