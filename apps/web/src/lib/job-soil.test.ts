import { describe, expect, it } from 'vitest';
import { JOB_IDS } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import { isSoilJob, jobSoil } from './job-soil.ts';

const SOILS = JOB_IDS.filter(isSoilJob);
const PAIRS = SOILS.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

const valuesOf = (id: (typeof SOILS)[number]) => jobSoil(id, 'en')?.facts.map(({ value }) => value);
const rowsOf = (id: (typeof SOILS)[number]) =>
  jobSoil(id, 'en')?.table?.rows.map(({ label, cells }) => [label, ...cells]);

describe('jobSoil (an area or a bed of topsoil, inch by inch)', () => {
  it('is for the topsoil areas and raised beds, not the question pages', () => {
    expect(SOILS).toEqual([
      'topsoil-raised-bed-4x4',
      'topsoil-raised-bed-4x8',
      'topsoil-10x10',
      'topsoil-20x20',
    ]);
  });

  // hand-verified, 10 × 10 ft: 100 sq ft × 0.3048² = 9.29 m²; one inch 100 ÷ 12 = 8.33 ft³ ÷ 27 =
  // 0.309 yd³ = 235.97 L (× 28.3168); × 0.80 ton = 0.247 ton = 494 lb. 4 in: 33.33 ft³ = 1.23 yd³,
  // 0.99 ton; bags 33.33 ÷ 0.75 = 44.4 → 45, ÷ 1 → 34, ÷ 1.5 = 22.2 → 23
  it('works one inch, its weight and the depths of a 10 × 10 ft area out', () => {
    expect(valuesOf('topsoil-10x10')).toEqual([
      '10 ft × 10 ft = 100 sq ft (9.29 m²)',
      '100 sq ft × 1 in = 8.33 ft³ = 0.31 yd³ (235.97 L)',
      '0.31 yd³ × 0.80 ton per yd³ ≈ 0.25 tons (494 lb)',
    ]);
    expect(rowsOf('topsoil-10x10')?.[3]).toEqual([
      '4 in',
      '33.33 ft³ (1.23 yd³)',
      '0.99 tons',
      '45 / 34 / 23',
    ]);
  });

  // hand-verified, 4 × 4 ft bed 12 in deep: 16 ft³ = 0.593 yd³, 0.47 ton; 16 ÷ 0.75 = 21.3 → 22
  it('fills a raised bed to the depths of a bed', () => {
    expect(rowsOf('topsoil-raised-bed-4x4')?.map(([depth]) => depth)).toEqual([
      '6 in',
      '8 in',
      '10 in',
      '12 in',
      '18 in',
      '24 in',
    ]);
    expect(rowsOf('topsoil-raised-bed-4x4')?.[3]).toEqual([
      '12 in',
      '16.00 ft³ (0.59 yd³)',
      '0.47 tons',
      '22 / 16 / 11',
    ]);
  });

  it.each(PAIRS)('explains %s in %s and cites the topsoil weight', (id, locale) => {
    const section = jobSoil(id, locale);
    expect(section?.sources).toHaveLength(1);
    expect(section?.sources[0]?.url).toContain('emnrd.nm.gov');
    expect(section?.paragraphs.join(' ').length).toBeGreaterThan(150);
  });
});
