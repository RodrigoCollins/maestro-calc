import { describe, expect, it } from 'vitest';
import { isChartJob, JOB_IDS, JOBS } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import { jobView } from './job-view.ts';
import { jobWorked, WORKED_CALCULATORS } from './job-worked.ts';

const mathOf = (worked: ReturnType<typeof jobWorked>) => worked?.steps.map(({ math }) => math);

// AdSense audit 2026-11-08: a job page shows how its first answer is worked out, step by step, in
// imperial and in metric, every figure from the engine
describe('jobWorked (the worked example of a job page)', () => {
  // hand-verified: 10 × 10 × 1/3 = 33.33 ft³; × 1.10 = 36.67 ft³ = 1.36 yd³ = 1.04 m³
  // (36.667 × 0.0283168); 36.667 ÷ 0.60 = 61.1, so 62 bags of 80 lb, 62 × 80 = 4,960 lb
  it('works a 10 × 10 ft slab 4 in thick out as the concrete calculator does', () => {
    expect(mathOf(jobWorked('concrete-slab-10x10', 'en'))).toEqual([
      '10 ft × 10 ft × 4 in = 33.33 ft³',
      '33.33 ft³ × 1.10 ≈ 36.67 ft³ = 1.36 yd³ = 1.04 m³',
      '36.67 ft³ ÷ 0.60 ft³ = 61.1 → 62',
      '62 × 80 lb = 4,960 lb',
    ]);
  });

  // hand-verified: π × (4/12)² × 2 = 0.70 ft³; × 1.10 = 0.77 ft³ = 0.03 yd³ = 0.02 m³; 0.768 ÷
  // 0.60 = 1.3, so 2 bags, 160 lb
  it('works an 8 in tube 24 in deep out, with the same arithmetic in Spanish', () => {
    expect(mathOf(jobWorked('concrete-tube-8', 'es'))).toEqual([
      '8 in × 24 in = 0.70 ft³',
      '0.70 ft³ × 1.10 = 0.77 ft³ = 0.03 yd³ = 0.02 m³',
      '0.77 ft³ ÷ 0.60 ft³ = 1.3 → 2',
      '2 × 80 lb = 160 lb',
    ]);
    const labels = (locale: 'en' | 'es') =>
      jobWorked('concrete-tube-8', locale)?.steps.map(({ label }) => label);
    expect(labels('es')).not.toEqual(labels('en'));
  });

  // hand-verified: 11 × 0.3048 = 3.3528 m, 14 × 0.3048 = 4.2672 m, 3.3528 × 4.2672 = 14.31 m²;
  // 154 ÷ 9 = 17.11 yd²; 154 × 1.10 = 169.40 ft²; 10 × 0.3048 = 3.048 m
  it('works an area out in both unit systems', () => {
    expect(mathOf(jobWorked('square-feet-11x14', 'en'))).toEqual([
      '11 ft × 14 ft = 154.00 ft²',
      '154.00 ft² ÷ 9 = 17.11 yd²',
      '3.3528 m × 4.2672 m = 14.31 m²',
      '154.00 ft² × 1.10 = 169.40 ft²',
    ]);
    expect(mathOf(jobWorked('square-feet-10x10', 'en'))?.[2]).toBe('3.048 m × 3.048 m = 9.29 m²');
  });

  // hand-verified: 66 × 0.3048 = 20.1168 m, 660 × 0.3048 = 201.168 m, their product 4,046.86 m²;
  // 43,560 ÷ 9 = 4,840 yd²; 43,560 ÷ 43,560 = 1 acre; 4,046.86 ÷ 10,000 = 0.4047 ha. A lot of
  // land takes no 10% for cuts: it is counted in acres and hectares instead
  it('works a lot of land out in acres and hectares', () => {
    expect(mathOf(jobWorked('square-feet-in-an-acre', 'en'))).toEqual([
      '66 ft × 660 ft = 43,560.00 ft²',
      '43,560.00 ft² ÷ 9 = 4,840.00 yd²',
      '20.1168 m × 201.168 m = 4,046.86 m²',
      '43,560.00 ft² ÷ 43,560 = 1.00 ac',
      '4,046.86 m² ÷ 10,000 = 0.4047 ha',
    ]);
    expect(mathOf(jobWorked('square-feet-in-a-quarter-acre', 'es'))?.[3]).toBe(
      '10,890.00 ft² ÷ 43,560 = 0.25 ac',
    );
    expect(jobWorked('square-feet-in-a-half-acre', 'en')?.steps[3]?.label).toBe(
      'In acres, 43,560 square feet each',
    );
  });

  // hand-verified: 2 × (12 + 12) × 8 = 384 ft²; − 20 − 2 × 15 = 334 ft²; 334 × 2 ÷ 350 = 1.91 gal;
  // 1.9086 × 3.785411784 = 7.22 L; 2 cans
  it('works the paint for a 12 × 12 ft room 8 ft high out as the paint calculator does', () => {
    expect(mathOf(jobWorked('paint-room-12x12', 'en'))).toEqual([
      '2 × (12 ft + 12 ft) × 8 ft = 384.00 ft²',
      '384.00 ft² − 20 ft² − 2 × 15 ft² = 334.00 ft²',
      '334.00 ft² × 2 ÷ 350 ft² = 1.91 gal = 7.22 L',
      '1.91 → 2',
    ]);
  });

  // hand-verified: 2 × 20 × 8 = 320 − 50 = 270 ft² of wall, + 100 ft² of ceiling = 370 ft² =
  // 34.37 m² (× 0.09290304); 370 × 1.10 ÷ 32 = 12.7, so 13 sheets of 4 × 8 ft
  it('works the drywall for a 10 × 10 ft room out as the drywall calculator does', () => {
    expect(mathOf(jobWorked('drywall-room-10x10', 'en'))).toEqual([
      '2 × (10 ft + 10 ft) × 8 ft − 20 ft² − 2 × 15 ft² = 270.00 ft²',
      '270.00 ft² + 10 ft × 10 ft = 370.00 ft² = 34.37 m²',
      '370.00 ft² × 1.10 ÷ 32 ft² = 12.7 → 13',
    ]);
  });

  // hand-verified: 24 × 24 = 576 ft²; √(1 + 1/4) = 1.118; 576 × 1.11803 = 643.99 ft² = 59.83 m²;
  // ÷ 100 = 6.44 squares; 643.99 × 1.10 ÷ 33.33 = 21.3, so 22 bundles
  it('works the shingles for a 24 × 24 ft roof at 6 in 12 out as the roofing calculator does', () => {
    expect(mathOf(jobWorked('roofing-24x24', 'en'))).toEqual([
      '24 ft × 24 ft = 576.00 ft²',
      '√(1 + (6/12)²) = 1.118',
      '576.00 ft² × √(1 + (6/12)²) = 643.99 ft² = 59.83 m²',
      '643.99 ft² ÷ 100 ft² = 6.44',
      '643.99 ft² × 1.10 ÷ 33.33 ft² = 21.3 → 22',
    ]);
  });

  // hand-verified: √(1 + 1/4) = 1.118; 8 × 1.11803 = 8.94 ft; 2.4384 × 1.11803 = 2.73 m;
  // atan(1/2) = 26.57°; at 7 1/2 in 12, 8 × √(1 + 0.390625) = 9.43 ft
  it('works the rafter of a roof pitch out over the first run, in feet and in meters', () => {
    expect(mathOf(jobWorked('roof-pitch-6-12', 'es'))).toEqual([
      '√(1 + (6/12)²) = 1.118',
      '8 ft × √(1 + (6/12)²) = 8.94 ft',
      '2.4384 m × √(1 + (6/12)²) = 2.73 m',
      'atan(6/12) = 26.57°',
    ]);
    expect(mathOf(jobWorked('roof-pitch-7-5-12', 'en'))?.[1]).toBe(
      '8 ft × √(1 + (7.5/12)²) = 9.43 ft',
    );
  });

  // hand-verified: 4 × 8 × 1 = 32 ft³; × 1.10 = 35.20 ft³ = 1.30 yd³ = 1.00 m³ (35.2 ×
  // 0.0283168 = 0.997); 35.2 ÷ 0.75 = 46.9, so 47 bags of 0.75 cu ft
  it('works the soil for a 4 × 8 ft raised bed out as the topsoil calculator does', () => {
    expect(mathOf(jobWorked('topsoil-raised-bed-4x8', 'en'))).toEqual([
      '4 ft × 8 ft × 12 in = 32.00 ft³',
      '32.00 ft³ × 1.10 = 35.20 ft³ = 1.30 yd³ = 1.00 m³',
      '35.20 ft³ ÷ 0.75 ft³ = 46.9 → 47',
    ]);
  });

  // hand-verified: 10 × 20 × 1/3 = 66.67 ft³ = 2.47 yd³; × 1.05 = 2.59 yd³; × 3,660 = 9,488.89 lb
  // (2.59 × 3,660 = 9,479.40, so ≈); ÷ 2,000 = 4.74 tons; ÷ 2,580 = 3.68 loose yd³
  it('works the gravel for a 10 × 20 ft driveway out as the gravel calculator does', () => {
    expect(mathOf(jobWorked('gravel-driveway-10x20', 'en'))).toEqual([
      '10 ft × 20 ft × 4 in = 66.67 ft³ = 2.47 yd³',
      '2.47 yd³ × 1.05 = 2.59 yd³',
      '2.59 yd³ × 3,660 lb ≈ 9,488.89 lb',
      '9,488.89 lb ÷ 2,000 lb = 4.74',
      '9,488.89 lb ÷ 2,580 lb = 3.68 yd³',
    ]);
  });

  // hand-verified: 29 1/4 in = 29.25 in; ÷ 2 = 14.625 in; × 16 = 234, so 14 5/8 in; × 0.0254 =
  // 0.371475 m; 9 ft 6 in = 114 in, ÷ 2 = 57 in; 22 in ÷ 10 = 2.2 in, × 16 = 35.2, so 2 3/16 in (a
  // length typed in plain inches skips the step to inches)
  it('works a length divided into equal parts out to the tape and to metric', () => {
    expect(mathOf(jobWorked('divide-29-1-4-in-by-2', 'en'))).toEqual([
      '29 1/4 in = 29.25 in',
      '29.25 in ÷ 2 = 14.625 in',
      '14.625 in × 16 = 234 → 14 5/8 in',
      '14.625 in × 0.0254 = 0.371 m',
    ]);
    expect(mathOf(jobWorked('divide-9-ft-6-in-by-2', 'es'))?.[0]).toBe('9 ft 6 in = 114 in');
    expect(mathOf(jobWorked('divide-22-in-by-10', 'en'))?.[1]).toBe(
      '2.2 in × 16 = 35.2 → 2 3/16 in',
    );
  });

  it.each(LOCALES)('arrives at the answer of the page it sits on in %s', (locale) => {
    for (const id of JOB_IDS) {
      const worked = jobWorked(id, locale);
      if (isChartJob(id) || !WORKED_CALCULATORS.includes(JOBS[id].calculator)) {
        expect(worked, id).toBeUndefined();
        continue;
      }
      expect(worked?.heading, id).toMatch(/\S/);
      for (const { label } of worked?.steps ?? []) expect(label, id).toMatch(/\S/);
      // the large figure of the page is one the steps arrive at
      const figure = /\d[\d,]*(?:\.\d+)?/.exec(jobView(id, locale).answer)?.[0];
      expect(figure, id).toBeDefined();
      expect(mathOf(worked)?.join(' '), id).toContain(String(figure));
    }
  });

  // hand-verified: one cubic yard of loose gravel, 9 × 9 ft × 4 in = 27 ft³ with no extra, weighs
  // 2,580 lb (WisDOT loose), 1.29 short tons, and is exactly the 1.00 loose yard to order
  it('weighs loose gravel loose and says when a question page adds no extra', () => {
    const worked = jobWorked('cubic-yards-to-tons', 'en');
    expect(mathOf(worked)).toEqual([
      '9 ft × 9 ft × 4 in = 27.00 ft³ = 1.00 yd³',
      '1.00 yd³ × 1.00 = 1.00 yd³',
      '1.00 yd³ × 2,580 lb = 2,580.00 lb',
      '2,580.00 lb ÷ 2,000 lb = 1.29',
      '2,580.00 lb ÷ 2,580 lb = 1.00 yd³',
    ]);
    expect(worked?.steps.map(({ label }) => label)).toContain('With no extra');
    expect(worked?.steps.map(({ label }) => label).join(' ')).toContain('Weight loose');
    const soil = jobWorked('cubic-feet-in-a-cubic-yard', 'es')?.steps.map(({ label }) => label);
    expect(soil).toContain('Sin extra, en pies cúbicos, yardas cúbicas y metros cúbicos');
  });
});
