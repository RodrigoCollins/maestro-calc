import { describe, expect, it } from 'vitest';
import { isLandJob, JOB_IDS, LAND_ACRES } from '../routing/jobs.ts';
import { LOCALES, pathOf } from '../routing/routes.ts';
import { jobLand, NIST_HB44_C } from './job-land.ts';

const LANDS = JOB_IDS.filter(isLandJob);
const PAIRS = LANDS.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

// queries: "how many square feet in an acre", "in a quarter acre", "in half an acre" (Ahrefs US,
// 2026-11-08). NIST Handbook 44 (2024), Appendix C: 1 acre = 43,560 ft² = 160 rods² = 10 chains²
// = 4,046.856 422 4 m² exactly; a square acre is about 208.710 ft on a side
describe('jobLand (what an acre is, and what a lot of land holds)', () => {
  // hand-verified: √43,560 = 208.7103 ft = 63.6149 m; √21,780 = 147.5805 ft = 44.9825 m;
  // √10,890 = 104.3552 ft = 31.8075 m; hectares are m² ÷ 10,000
  it('gives the acres, the hectares and the side of a square of the same area', () => {
    const facts = (id: (typeof LANDS)[number]) =>
      jobLand(id, 'en')
        ?.glance.facts.slice(0, 3)
        .map(({ value }) => value);
    expect(facts('square-feet-in-an-acre')).toEqual(['1', '0.4047 ha', '208.71 ft (63.61 m)']);
    expect(facts('square-feet-in-a-half-acre')).toEqual([
      '0.5',
      '0.2023 ha',
      '147.58 ft (44.98 m)',
    ]);
    expect(facts('square-feet-in-a-quarter-acre')).toEqual([
      '0.25',
      '0.1012 ha',
      '104.36 ft (31.81 m)',
    ]);
  });

  // hand-verified: 43,560 ÷ 144 = 302.5, ÷ 400 = 108.9, ÷ 576 = 75.625; 10,890 ÷ 144 = 75.625,
  // ÷ 400 = 27.225, ÷ 576 = 18.906
  it('counts the 12 × 12, 20 × 20 and 24 × 24 ft floors that make up the area', () => {
    const counts = (id: (typeof LANDS)[number]) =>
      jobLand(id, 'en')
        ?.glance.facts.slice(3)
        .map(({ value }) => value);
    expect(counts('square-feet-in-an-acre')).toEqual(['302.5', '108.9', '75.6']);
    expect(counts('square-feet-in-a-half-acre')).toEqual(['151.3', '54.5', '37.8']);
    expect(counts('square-feet-in-a-quarter-acre')).toEqual(['75.6', '27.2', '18.9']);
    const links = jobLand('square-feet-in-an-acre', 'es')?.glance.facts.map(({ href }) => href);
    expect(links).toEqual([
      undefined,
      undefined,
      undefined,
      pathOf('square-feet-12x12', 'es'),
      pathOf('square-feet-20x20', 'es'),
      undefined,
    ]);
  });

  // hand-verified: 10,890 ft² × 4 in = 3,630 ft³ = 134.44 yd³, × 1.10 = 147.89 yd³; × 6 in =
  // 201.67 yd³ × 1.10 = 221.83; mulch 3 in = 2,722.5 ft³ = 100.83 yd³ × 1.05 = 105.88 yd³
  it('works the topsoil and the mulch over the first lot out with their engines', () => {
    const cover = jobLand('square-feet-in-a-quarter-acre', 'en')?.cover;
    expect(cover?.rows.map(({ cells }) => cells)).toEqual([
      ['4 in', '147.89'],
      ['6 in', '221.83'],
      ['3 in', '105.88'],
    ]);
    expect(cover?.rows[0]?.href).toMatch(new RegExp(`^${pathOf('topsoil', 'en')}\\?`));
    expect(cover?.rows[2]?.href).toMatch(new RegExp(`^${pathOf('mulch', 'en')}\\?`));
    expect(cover?.columns).toHaveLength(3);
    const acre = jobLand('square-feet-in-an-acre', 'en')?.cover.rows.map(({ cells }) => cells[1]);
    expect(acre).toEqual(['591.56', '887.33', '423.50']);
  });

  it.each(PAIRS)('cites NIST Handbook 44 and writes %s its own shape text in %s', (id, locale) => {
    const land = jobLand(id, locale);
    expect(land?.source).toBe(NIST_HB44_C);
    expect(land?.definition).toContain('43,560');
    expect(land?.definition).toContain('4,046.856');
    expect(land?.surveyFoot).toContain('2023');
    expect(land?.shape.paragraphs).toHaveLength(2);
    for (const paragraph of land?.shape.paragraphs ?? []) {
      expect(paragraph.length).toBeGreaterThan(200);
    }
    expect(LAND_ACRES[id]).toBeGreaterThan(0);
  });

  it('writes the shape text of each lot and language once', () => {
    const paragraphs = PAIRS.flatMap(([id, locale]) => jobLand(id, locale)?.shape.paragraphs ?? []);
    expect(new Set(paragraphs).size).toBe(PAIRS.length * 2);
  });

  it('is only for the lots of land', () => {
    expect(jobLand('square-feet-12x12', 'en')).toBeUndefined();
    expect(jobLand('square-feet-to-square-meters-chart', 'es')).toBeUndefined();
    expect(NIST_HB44_C.url).toMatch(/^https:\/\/www\.nist\.gov\//);
  });
});
