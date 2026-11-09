import { describe, expect, it } from 'vitest';
import { JOB_IDS } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import { isFloorJob, jobFloor } from './job-floor.ts';
import { QUALI_KOTE_PDS } from './job-room.ts';

const FLOORS = JOB_IDS.filter(isFloorJob);
const PAIRS = FLOORS.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

const valuesOf = (id: (typeof FLOORS)[number]) =>
  jobFloor(id, 'en')?.facts.map(({ value }) => value);
const tilesOf = (id: (typeof FLOORS)[number]) =>
  jobFloor(id, 'en')?.table?.rows.map(({ label, cells }) => [label, ...cells]);

describe('jobFloor (what fits on a floor of a size)', () => {
  it('is for the floor pages of square footage, not the acres or the chart', () => {
    expect(FLOORS).toHaveLength(11);
    expect(FLOORS).toContain('square-feet-12x12');
    expect(FLOORS).not.toContain('square-feet-in-an-acre');
    expect(FLOORS).not.toContain('square-feet-to-square-meters-chart');
    expect(jobFloor('paint-room-12x12', 'en')).toBeUndefined();
  });

  // hand-verified, 12 × 12 ft: perimeter 2 × 24 = 48 ft = 14.63 m (× 0.3048); one 12 ft length of
  // a 12 ft roll, 144 sq ft = 16.00 sq yd; walls 8 ft high 48 × 8 = 384 sq ft; two coats 768 ÷ 350 =
  // 2.194 gal; ceiling 288 ÷ 350 = 0.823 gal; drywall (384 + 144) × 1.10 ÷ 32 = 18.2 → 19 sheets;
  // a 4 in slab 48 ft³ × 1.10 = 52.8 ft³ = 1.96 yd³ = 1.50 m³ (× 0.0283168), ÷ 0.6 = 88 bags
  it('works the perimeter, the carpet and the paint of a 12 × 12 ft floor out', () => {
    expect(valuesOf('square-feet-12x12')).toEqual([
      '2 × (12 ft + 12 ft) = 48 ft (14.63 m)',
      '12 ft × 12 ft = 144 sq ft (16.00 sq yd)',
      '48 ft × 8 ft = 384 sq ft',
      '384 sq ft × 2 ÷ 350 ≈ 2.19 gal',
      '144 sq ft × 2 ÷ 350 ≈ 0.82 gal',
      '528 sq ft: 19 sheets of 4 × 8 ft with 10% extra',
      '1.96 yd³ (1.50 m³), 88 bags of 80 lb',
    ]);
  });

  // hand-verified, 5 × 10 ft: the roll runs across the 10 ft side, a 5 ft length, 60 sq ft = 6.67
  // sq yd; 20 × 20 ft takes two 20 ft strips, 480 sq ft = 53.33 sq yd; 12 × 30 ft one 30 ft length,
  // 360 sq ft = 40.00 sq yd
  it('cuts the carpet from a 12 ft roll the short way when it fits', () => {
    expect(valuesOf('square-feet-5x10')?.[1]).toBe('5 ft × 12 ft = 60 sq ft (6.67 sq yd)');
    expect(valuesOf('square-feet-20x20')?.[1]).toBe(
      '40 ft × 12 ft = 480 sq ft (53.33 sq yd), 2 strips with a seam between them',
    );
    expect(valuesOf('square-feet-12x30')?.[1]).toBe('30 ft × 12 ft = 360 sq ft (40.00 sq yd)');
  });

  // hand-verified: tiles per side = ⌈side ÷ tile⌉; 12 × 12 ft: 12 in 12 × 12 = 144, × 1.1 = 158.4 →
  // 159; 18 in 8 × 8 = 64 → 70.4 → 71; 24 in 6 × 6 = 36 → 39.6 → 40. 5 × 10 ft: 5 × 10 = 50 → 55;
  // 60 ÷ 18 = 3.3 → 4 and 120 ÷ 18 = 6.7 → 7, 28 → 30.8 → 31; 60 ÷ 24 = 2.5 → 3 and 5, 15 → 17.
  // Metric, 1 ft = 30.48 cm: 12 ft = 365.76 cm, ÷ 30 = 12.2 → 13, 169 → 185.9 → 186; ÷ 60 = 6.1 → 7,
  // 49 → 54; 5 ft = 152.4 cm and 10 ft = 304.8 cm: 6 × 11 = 66 → 73, 3 × 6 = 18 → 20
  it('lays whole tiles of 12, 18 and 24 in and 30 and 60 cm along each side and adds 10%', () => {
    expect(tilesOf('square-feet-12x12')).toEqual([
      ['12 × 12 in', '12 × 12', '144', '159'],
      ['18 × 18 in', '8 × 8', '64', '71'],
      ['24 × 24 in', '6 × 6', '36', '40'],
      ['30 × 30 cm', '13 × 13', '169', '186'],
      ['60 × 60 cm', '7 × 7', '49', '54'],
    ]);
    expect(tilesOf('square-feet-5x10')).toEqual([
      ['12 × 12 in', '5 × 10', '50', '55'],
      ['18 × 18 in', '4 × 7', '28', '31'],
      ['24 × 24 in', '3 × 5', '15', '17'],
      ['30 × 30 cm', '6 × 11', '66', '73'],
      ['60 × 60 cm', '3 × 6', '18', '20'],
    ]);
  });

  it.each(PAIRS)('explains %s in %s and cites the paint rate', (id, locale) => {
    const floor = jobFloor(id, locale);
    expect(floor?.sources).toEqual([QUALI_KOTE_PDS]);
    expect(floor?.paragraphs.join(' ').length).toBeGreaterThan(100);
    expect(floor?.table?.columns).toHaveLength(4);
  });

  it('gives each floor figures no other floor has', () => {
    const all = FLOORS.map((id) => JSON.stringify([valuesOf(id), tilesOf(id)]));
    expect(new Set(all).size).toBe(FLOORS.length);
  });
});
