import { describe, expect, it } from 'vitest';
import { LOCALES } from '../routing/routes.ts';
import { siteText } from './site-text.ts';
import {
  INSTALLED_PRICES,
  READY_MIX_PRICES,
  concreteCostPerSquareFoot,
  installedRange,
  slabCostOf,
} from './slab-cost.ts';

const slab = (length: number, width: number, thickness = 4) => ({
  length: `${String(length)}ft`,
  width: `${String(width)}ft`,
  thickness: `${String(thickness)}in`,
});

// Prices read 2026-11-09: Eagle Materials and Knife River report the average selling price of
// their ready-mix concrete per cubic yard in their third quarter 2026 releases (SEC Form 8-K,
// exhibit 99.1); This Old House (updated 2026-03-17) and Concrete Network (updated 2026-07-14)
// publish the installed price of a plain slab per square foot.
describe('slab cost (dated, cited prices over the concrete engine)', () => {
  it('keeps the published prices, lowest first, each with its source and the day it was read', () => {
    expect(READY_MIX_PRICES.map(({ perYard }) => perYard)).toEqual(['160.18', '201.90']);
    expect(INSTALLED_PRICES.map(({ low, high }) => [low, high])).toEqual([
      ['4.00', '8.00'],
      ['6.50', '10.50'],
    ]);
    for (const { source } of [...READY_MIX_PRICES, ...INSTALLED_PRICES]) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.retrieved).toBe('2026-11-09');
    }
    expect(installedRange()).toBe('$4.00–$10.50');
  });

  // hand-verified, 4 in thick with the calculator's 10% extra: yd³ = L × W × 1/3 × 1.1 ÷ 27.
  // 10 × 10: 110/81 = 1.358 yd³; × 160.18 = 217.53, × 201.90 = 274.19; installed 100 sq ft ×
  // 4 to 8 = 400 to 800 and × 6.50 to 10.50 = 650 to 1,050.
  // 30 × 30: 990/81 = 12.222 yd³; × 160.18 = 1,957.76, × 201.90 = 2,467.67; 900 sq ft × 4 to 8 =
  // 3,600 to 7,200 (This Old House prints the same range for a 30 × 30 slab) and × 6.50 to 10.50
  // = 5,850 to 9,450.
  // 40 × 60: 2,640/81 = 32.593 yd³; × 160.18 = 5,220.68, × 201.90 = 6,580.44; 2,400 sq ft × 4 to 8
  // = 9,600 to 19,200 and × 6.50 to 10.50 = 15,600 to 25,200.
  it('prices the ready-mix of a slab with the engine and its installed cost by its area', () => {
    expect(slabCostOf(slab(10, 10))).toEqual({
      label: '10 ft × 10 ft × 4 in',
      area: '100',
      yards: '1.36',
      readyMix: '$218–$274',
      readyMixExact: ['$217.53', '$274.19'],
      installed: ['$400–$800', '$650–$1,050'],
      installedAll: '$400–$1,050',
    });
    expect(slabCostOf(slab(30, 30))).toMatchObject({
      yards: '12.22',
      readyMix: '$1,958–$2,468',
      installed: ['$3,600–$7,200', '$5,850–$9,450'],
    });
    expect(slabCostOf(slab(40, 60))).toMatchObject({
      area: '2,400',
      yards: '32.59',
      readyMix: '$5,221–$6,580',
      installed: ['$9,600–$19,200', '$15,600–$25,200'],
      installedAll: '$9,600–$25,200',
    });
  });

  // hand-verified, one square foot with 10% extra: 1.1 × t/12 ÷ 27 yd³. 4 in: 0.013580 yd³ ×
  // 160.18 = 2.175, × 201.90 = 2.742; 6 in: 0.020370 × 160.18 = 3.263, × 201.90 = 4.113; 8 in:
  // 0.027160 × 160.18 = 4.351, × 201.90 = 5.484.
  it('prices the concrete alone of one square foot at each thickness', () => {
    expect(concreteCostPerSquareFoot(4)).toBe('$2.18–$2.74');
    expect(concreteCostPerSquareFoot(5)).toBe('$2.72–$3.43');
    expect(concreteCostPerSquareFoot(6)).toBe('$3.26–$4.11');
    expect(concreteCostPerSquareFoot(8)).toBe('$4.35–$5.48');
  });

  // hand-verified: one inch of a 30 × 30 ft slab is 900 ÷ 12 × 1.1 ÷ 27 = 3.06 yd³, × 160.18 =
  // 489.44 and × 201.90 = 616.94
  it.each(LOCALES)('writes the prices into the copy as the data holds them in %s', (locale) => {
    expect(slabCostOf(slab(30, 30, 1))).toMatchObject({ yards: '3.06', readyMix: '$489–$617' });
    const text = siteText(locale);
    const copy = [text('page.concrete-slab-cost.intro'), text('page.concrete-slab-cost.p2')];
    for (const each of copy) {
      for (const figure of ['$160.18', '$201.90']) expect(each).toContain(figure);
    }
    expect(text('page.concrete-slab-cost.intro')).toContain('$4.00');
    expect(text('page.concrete-slab-cost.intro')).toContain('$10.50');
    expect(text('page.concrete-slab-cost.intro')).toContain('$2.18');
    expect(text('site.job.question.slabCost.lead')).toContain('$489');
    expect(text('site.job.question.slabCost.lead')).toContain('$617');
  });
});
