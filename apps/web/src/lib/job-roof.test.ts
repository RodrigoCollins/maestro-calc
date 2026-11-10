import { describe, expect, it } from 'vitest';
import { JOB_IDS } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import { isRoofJob, jobRoof } from './job-roof.ts';

const ROOFS = JOB_IDS.filter(isRoofJob);
const PAIRS = ROOFS.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

const valuesOf = (id: (typeof ROOFS)[number]) => jobRoof(id, 'en')?.facts.map(({ value }) => value);
const rowsOf = (id: (typeof ROOFS)[number]) =>
  jobRoof(id, 'en')?.table?.rows.map(({ label, cells }) => [label, ...cells]);

describe('jobRoof (a footprint, edge by edge)', () => {
  it('is for the four roofing footprints', () => {
    expect(ROOFS).toEqual(['roofing-12x16', 'roofing-24x24', 'roofing-30x40', 'roofing-30x50']);
  });

  // hand-verified, 12 × 16 ft at 6/12, ridge along the 16 ft side: eaves 2 × 16 = 32 ft; slope
  // factor √(1 + 0.25) = 1.1180; each rake 6 × 1.1180 = 6.708 ft, four 26.83 ft; drip edge 58.83 ft,
  // 6 pieces of 10 ft; ridge 16 ft; rise 6 × 6/12 = 3 ft. At 3/12: 192 × √(1 + 1/16) = 197.9 sq ft,
  // 1.98 squares, × 1.10 ÷ 33.33 = 6.53 → 7 bundles, rake 6 × 1.0308 = 6.18 ft
  it('works the eaves, the rakes, the drip edge and the ridge of a 12 × 16 ft gable out', () => {
    expect(valuesOf('roofing-12x16')).toEqual([
      '2 × 16 ft = 32 ft',
      '4 × 6.00 ft × 1.118 = 26.83 ft',
      '32 ft + 26.83 ft = 58.83 ft, 6 pieces of 10 ft',
      '16 ft',
      '6.00 ft × 6/12 = 3.00 ft',
    ]);
    expect(rowsOf('roofing-12x16')?.[0]).toEqual(['3/12', '198', '1.98', '7', '6.18']);
  });

  it.each(PAIRS)('explains %s in %s at the pitches the sizes table leaves out', (id, locale) => {
    const section = jobRoof(id, locale);
    expect(section?.table?.rows.map(({ label }) => label)).toEqual([
      '3/12',
      '4/12',
      '5/12',
      '7/12',
      '9/12',
      '12/12',
    ]);
    expect(section?.paragraphs.join(' ').length).toBeGreaterThan(150);
  });
});
