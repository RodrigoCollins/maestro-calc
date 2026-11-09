import { describe, expect, it } from 'vitest';
import { JOB_IDS } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import { isConcreteJob, jobConcrete } from './job-concrete.ts';

const CONCRETE = JOB_IDS.filter(isConcreteJob);
const PAIRS = CONCRETE.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

const valuesOf = (id: (typeof CONCRETE)[number]) =>
  jobConcrete(id, 'en')?.facts.map(({ value }) => value);
const rowsOf = (id: (typeof CONCRETE)[number]) =>
  jobConcrete(id, 'en')?.table?.rows.map(({ label, cells }) => [label, ...cells]);

describe('jobConcrete (a slab, a tube or a footing works its own size out)', () => {
  it('is for the slab, pad, tube and footing pages, not the chart or the question page', () => {
    expect(CONCRETE).toHaveLength(17);
    expect(CONCRETE).toContain('concrete-pad-4x4');
    expect(CONCRETE).toContain('concrete-tube-10');
    expect(CONCRETE).toContain('concrete-footing-20x10');
    expect(CONCRETE).not.toContain('concrete-slab-chart');
    expect(CONCRETE).not.toContain('concrete-cubic-yard-weight');
    expect(jobConcrete('topsoil-10x10', 'en')).toBeUndefined();
  });

  // hand-verified, 12 × 12 ft: 144 sq ft × 0.3048² = 13.378 m²; edge 2 × 24 = 48 ft = 14.63 m; base
  // 144 × 4/12 = 48 ft³ ÷ 27 = 1.778 yd³ × 1.80 = 3.20 and × 1.86 = 3.31 tons (WisDOT); weights at
  // 145 and 150 lb/ft³: 48 ft³ = 6,960 to 7,200 lb, 48.33 to 50 lb per sq ft; 60 ft³ = 8,700 to
  // 9,000 lb, 60.4 to 62.5; 72 ft³ = 10,440 to 10,800 lb, 72.5 to 75; 48 ft³ × 0.0283168 = 1.36 m³
  it('works the area, the edge, the gravel base and the weight of a 12 × 12 ft slab out', () => {
    expect(valuesOf('concrete-slab-12x12')).toEqual([
      '12 ft × 12 ft = 144 sq ft (13.38 m²)',
      '2 × (12 ft + 12 ft) = 48 ft (14.63 m)',
      '144 sq ft × 4 in = 48.00 ft³ = 1.78 yd³, 3.20–3.31 tons',
    ]);
    expect(rowsOf('concrete-slab-12x12')).toEqual([
      ['4 in', '48.00 ft³ (1.36 m³)', '6,960–7,200 lb', '48–50 lb'],
      ['5 in', '60.00 ft³ (1.70 m³)', '8,700–9,000 lb', '60–63 lb'],
      ['6 in', '72.00 ft³ (2.04 m³)', '10,440–10,800 lb', '73–75 lb'],
    ]);
  });

  // hand-verified, 10 in tube: π × 5² = 78.54 sq in = 0.5454 ft² = 0.5454 ft³ per foot = 15.44 L;
  // one bag fills 0.60 ÷ 0.5454 = 1.10 ft, 0.45 → 0.83 ft, 0.30 → 0.55 ft; 4 ft of tube is 2.18 ft³
  // = 316 to 327 lb; four tubes 48 in: 8.727 ft³ × 1.10 = 9.60 ft³ = 0.36 yd³, ÷ 0.60 = 16 bags of
  // 80 lb, ÷ 0.45 = 21.3 → 22 of 60 lb
  it('works the section, the concrete per foot and a row of 10 in tubes out', () => {
    expect(valuesOf('concrete-tube-10')).toEqual([
      'π × (10 in ÷ 2)² ≈ 78.54 sq in (0.55 sq ft)',
      '0.55 ft³ (15.44 L)',
      '1.10 ft / 0.83 ft / 0.55 ft',
      '316–327 lb',
    ]);
    expect(rowsOf('concrete-tube-10')?.[0]).toEqual(['4 × 48 in', '0.36', '16', '22']);
  });

  // hand-verified, 16 × 8 in footing: 128 sq in = 0.889 ft² = 25.17 L per foot; a bag of 80 lb
  // fills 0.60 ÷ 0.889 = 0.68 ft; a foot weighs 128.9 to 133.3 lb; a 12 × 16 ft building runs 56 ft,
  // 49.78 ft³ × 1.10 = 54.76 ft³ = 2.03 yd³, ÷ 0.60 = 91.3 → 92 bags
  it('works the section, the concrete per foot and four buildings of a 16 × 8 in footing out', () => {
    expect(valuesOf('concrete-footing-16x8')).toEqual([
      '16 in × 8 in = 128 sq in (0.89 sq ft)',
      '0.89 ft³ (25.17 L)',
      '0.68 ft / 0.51 ft / 0.34 ft',
      '129–133 lb',
    ]);
    expect(rowsOf('concrete-footing-16x8')?.[0]).toEqual(['12 × 16 ft', '56 ft', '2.03', '92']);
  });

  it.each(PAIRS)('explains %s in %s and cites the weights it uses', (id, locale) => {
    const section = jobConcrete(id, locale);
    expect(section?.sources.length).toBeGreaterThanOrEqual(2);
    expect(section?.paragraphs.join(' ').length).toBeGreaterThan(150);
    expect(section?.table?.rows.length).toBeGreaterThanOrEqual(3);
  });

  it('gives each page figures no other page has', () => {
    const all = CONCRETE.map((id) => JSON.stringify([valuesOf(id), rowsOf(id)]));
    expect(new Set(all).size).toBe(CONCRETE.length);
  });
});
