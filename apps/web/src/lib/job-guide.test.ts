import { describe, expect, it } from 'vitest';
import { isChartJob, JOB_IDS, type JobId } from '../routing/jobs.ts';
import { LOCALES, ROUTES } from '../routing/routes.ts';
import { JOB_GUIDE_KINDS, jobCoverings, jobGuide, jobGuideKindOf } from './job-guide.ts';
import { jobView } from './job-view.ts';
import { drywallCostOf } from './drywall-cost.ts';
import { houseCostOf, roomCostOf } from './paint-cost.ts';

const JOBS_OF_ONE_SIZE = JOB_IDS.filter((id) => !isChartJob(id));
const CHARTS = JOB_IDS.filter((id) => isChartJob(id));
const PAIRS = JOBS_OF_ONE_SIZE.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

// AdSense audit 2026-11-08: a job page answered with a number and a table, and little else
describe('jobGuide (the buying advice of a job page)', () => {
  it.each(PAIRS)('gives %s a heading, four tips and its in-depth guide in %s', (id, locale) => {
    const guide = jobGuide(id, locale);
    expect(guide?.heading).toMatch(/\S/);
    expect(guide?.tips).toHaveLength(4);
    for (const tip of guide?.tips ?? []) expect(tip.length).toBeGreaterThan(60);
    expect(Object.keys(ROUTES)).toContain(guide?.read);
  });

  it.each(CHARTS)('leaves the chart %s alone: it carries its own sources and basis', (id) => {
    expect(jobGuideKindOf(id)).toBeUndefined();
    expect(jobGuide(id, 'en')).toBeUndefined();
  });

  it('sorts the concrete jobs by the pour they are: slab, tube or footing', () => {
    const kinds = (ids: readonly JobId[]) => [...new Set(ids.map(jobGuideKindOf))];
    expect(kinds(['concrete-slab-10x10', 'concrete-slab-650-sq-ft', 'concrete-pad-4x4'])).toEqual([
      'concrete-slab',
    ]);
    expect(kinds(['concrete-tube-8', 'concrete-tube-12'])).toEqual(['concrete-tube']);
    expect(kinds(['concrete-footing-16x8', 'concrete-footing-20x10'])).toEqual([
      'concrete-footing',
    ]);
    expect(jobGuide('concrete-tube-8', 'en')?.read).toBe('guide-fence-post-concrete');
    expect(jobGuide('concrete-slab-10x10', 'en')?.read).toBe('guide-concrete-bags-or-truck');
    expect(jobGuide('roof-pitch-6-12', 'es')?.read).toBe('guide-roof-pitch');
    expect(jobGuide('divide-22-in-by-10', 'en')?.read).toBe('guide-tape-measure-fractions');
  });

  it('writes the lots of land their own advice, apart from the rooms of the same calculator', () => {
    expect(jobGuideKindOf('square-feet-in-an-acre')).toBe('land');
    expect(jobGuideKindOf('square-feet-in-a-quarter-acre')).toBe('land');
    expect(jobGuideKindOf('square-feet-12x12')).toBe('rectangle-area');
    expect(jobGuide('square-feet-in-a-half-acre', 'es')?.read).toBe('guide-square-footage');
  });

  it('uses every kind, and no two kinds share a heading or a tip', () => {
    const used = new Set(JOBS_OF_ONE_SIZE.map(jobGuideKindOf));
    expect([...used].toSorted()).toEqual([...JOB_GUIDE_KINDS].toSorted());
    for (const locale of LOCALES) {
      const byKind = JOB_GUIDE_KINDS.map((kind) => {
        const id = JOBS_OF_ONE_SIZE.find((each) => jobGuideKindOf(each) === kind);
        if (id === undefined) throw new Error(`no job of kind ${kind}`);
        return jobGuide(id, locale);
      });
      const headings = byKind.map((guide) => guide?.heading);
      const tips = byKind.flatMap((guide) => guide?.tips ?? []);
      expect(new Set(headings).size).toBe(JOB_GUIDE_KINDS.length);
      expect(new Set(tips).size).toBe(JOB_GUIDE_KINDS.length * 4);
    }
  });

  it('is written in each language, not copied across', () => {
    for (const id of JOBS_OF_ONE_SIZE) {
      expect(jobGuide(id, 'es')?.tips).not.toEqual(jobGuide(id, 'en')?.tips);
    }
  });
});

// content audit 2026-11-10: the four tips of a kind were the same words on every page of the
// family, the largest block a pitch or a room page shared with its siblings; where a tip names a
// figure of the job, it now gives that page's own figure
describe('jobGuide tips with the figures of the page', () => {
  // hand-verified: √(1 + (6/12)²) = 1.11803; 12 in × 1.11803 = 13.416 in → 13 7/16 in, 24 in →
  // 26.833 in → 26 13/16 in; atan(6/12) = 26.57°, atan(5/12) = 22.62°, atan(7/12) = 30.26°;
  // √(1 + (7/12)²) = 1.15770, so 100 sq ft is 111.80 sq ft of roof at 6/12, 115.77 at 7/12
  it('works the tips of a 6/12 pitch out', () => {
    const [tip1, tip2, tip3, tip4] = jobGuide('roof-pitch-6-12', 'en')?.tips ?? [];
    expect(tip1).toContain('At 6/12 it reads 6 in, and 12 in over a 24 in level');
    expect(tip2).toContain(
      'a 12 in overhang adds 13 7/16 in of rafter and a 24 in one 26 13/16 in',
    );
    expect(tip3).toContain('at 6/12 it should show 26.57°');
    expect(tip3).toContain('22.62° at 5/12 and 30.26° at 7/12');
    expect(tip4).toContain('every 100 sq ft of footprint is 111.80 sq ft of roof at 6/12');
    expect(tip4).toContain('115.77 sq ft at 7/12');
  });

  // hand-verified: atan(6.5/12) = 28.44°, atan(8.5/12) = 35.31°; √(1 + (8.5/12)²) = 1.22545
  it('works a half-inch pitch and the low end of the table out, in Spanish too', () => {
    const [, , tip3, tip4] = jobGuide('roof-pitch-7-5-12', 'es')?.tips ?? [];
    expect(tip3).toContain('28.44° con 6.5/12 y 35.31° con 8.5/12');
    expect(tip4).toContain('122.55 sq ft con 8.5/12');
    // atan(1/12) = 4.76°, atan(3/12) = 14.04°
    expect(jobGuide('roof-pitch-2-12', 'en')?.tips[2]).toContain(
      '4.76° at 1/12 and 14.04° at 3/12',
    );
  });

  // hand-verified, 10 × 10 ft room 8 ft high, one 20 sq ft door and two 15 sq ft windows, 10%
  // extra: walls 2 × (10 + 10) × 8 = 320 − 50 = 270 sq ft, × 1.1 ÷ 32 = 9.28 → 10 sheets; ceiling
  // 100 × 1.1 ÷ 32 = 3.44 → 4; together 370 × 1.1 ÷ 32 = 12.72 → 13, ÷ 48 = 8.48 → 9; the 10% of
  // 370 sq ft is 37 sq ft; compound and tape as the drywall engine gives them
  it('works the tips of a 10x10 room of drywall out', () => {
    const [tip1, tip2, tip3, tip4] = jobGuide('drywall-room-10x10', 'en')?.tips ?? [];
    expect(tip1).toContain('in this room it takes 4 sheets of 4 × 8 ft, the walls 10');
    expect(tip2).toContain('9 sheets of 4 × 12 ft cover this room where 13 of 4 × 8 ft do');
    expect(tip3).toContain('3.33 gal of compound and 136.90 ft of tape for this room');
    expect(tip4).toContain('the 10% on the 370 sq ft of this room is 37 sq ft of board');
  });

  // hand-verified, 12 × 16 × 8 ft: walls 448 − 50 = 398 sq ft, ceiling 192 sq ft; 398 × 2 ÷ 350 =
  // 2.27 → 3 gallon cans; the ceiling in two coats 384 ÷ 350 = 1.10 gal
  it('works the tips of a 12x16 room of paint out, in Spanish too', () => {
    const [tip1, , tip3, tip4] = jobGuide('paint-room-12x16', 'en')?.tips ?? [];
    expect(tip1).toContain('This 12 by 16 ft room 8 ft high has 448 sq ft of wall and only 192');
    expect(tip3).toContain('Buy the 3 gallons for the walls at once');
    expect(tip4).toContain('this ceiling is 192 sq ft, 1.10 gal in two coats');
    expect(jobGuide('paint-room-10x10', 'es')?.tips[0]).toContain('320 sq ft de pared');
  });

  // hand-verified, 30 × 40 ft footprint with 1 ft overhangs, 6/12: the house is 28 × 38 ft; the
  // roof is 1,200 × 1.11803 = 1,341.64 sq ft = 13.42 squares, × 1.1 ÷ 33.33 = 44.3 → 45 bundles; at
  // 3/12 it is 1,200 × √(1 + 1/16) = 1,236.93 sq ft, two layers 2,473.86 → 2,474 sq ft
  it('works the tips of a 30x40 roof out', () => {
    const [tip1, tip2, tip3] = jobGuide('roofing-30x40', 'en')?.tips ?? [];
    expect(tip1).toContain('a 28 by 38 ft house makes this 30 by 40 ft footprint');
    expect(tip2).toContain('so the 13.42 squares of this roof at 6/12 take 45 bundles');
    expect(tip3).toContain('at 3/12 this roof takes 2,474 sq ft of underlayment');
    expect(tip3).toContain('against 1,342 sq ft at 6/12');
    expect(jobGuide('roofing-30x50', 'es')?.tips[0]).toContain('una casa de 28 por 48 ft');
    // the 10% of 1,341.64 sq ft is 134.16 sq ft; the ridge runs along the 40 ft side; at 30 × 50,
    // 1,500 × 1.11803 = 1,677.05 sq ft, 167.71 sq ft of extra and 50 ft of ridge
    expect(jobGuide('roofing-30x40', 'en')?.tips[3]).toContain(
      'The extra on this roof, 134.16 sq ft, covers the starter course, the hip and ridge caps, with 40 ft of ridge here,',
    );
    expect(jobGuide('roofing-30x50', 'es')?.tips[3]).toContain('167.71 sq ft');
    expect(jobGuide('roofing-30x50', 'es')?.tips[3]).toContain('con 50 ft de cumbrera aquí,');
  });

  // hand-verified: 10% of 16 in is 1.6 in, of 8 in 0.8 in; a foot of 16 × 8 in footing is 128 ÷
  // 144 = 0.8889 ft³, × 1.1 = 0.97778 ft³, so 27 ÷ 0.97778 = 27.61 ft of it is a cubic yard; at
  // 20 × 10 in, 200 ÷ 144 × 1.1 = 1.52778 ft³ a foot, 17.67 ft a cubic yard
  it('works the tips of a 16x8 footing out', () => {
    const [tip1, , tip3] = jobGuide('concrete-footing-16x8', 'en')?.tips ?? [];
    expect(tip1).toContain('at 16 × 8 in, it covers a trench 1.6 in too wide or 0.8 in too deep');
    expect(tip3).toContain('at 16 × 8 in, every 27.61 ft of trench takes a cubic yard');
    expect(jobGuide('concrete-footing-20x10', 'es')?.tips[2]).toContain('cada 17.67 ft de zanja');
  });

  // hand-verified: 3 ft 9 in = 45 in, one cut of 1/8 in, (45 − 0.125) ÷ 2 = 22.4375 = 22 7/16 in;
  // 22 in in 10 parts: 9 cuts, 9/8 = 1 1/8 in, (22 − 1.125) ÷ 10 = 2.0875 → 2 1/16 in
  // hand-verified: 22 ÷ 10 = 2.2 in, × 16 = 35.2 → 35/16 = 2 3/16 in; 45 ÷ 2 = 22.5 = 22 1/2 in
  it('reads the decimal of a division on the tape', () => {
    expect(jobGuide('divide-22-in-by-10', 'en')?.tips[0]).toContain(
      'Mark from the tape column, not the decimals: 2.20 in is 2 3/16 in on the tape.',
    );
    expect(jobGuide('divide-3-ft-9-in-by-2', 'es')?.tips[0]).toContain(
      '22.50 in son 22 1/2 in en la cinta.',
    );
  });

  it('takes the saw cuts off a division', () => {
    expect(jobGuide('divide-3-ft-9-in-by-2', 'en')?.tips[1]).toContain(
      'here 1 × 1/8 in = 1/8 in goes to the saw, and each of the 2 pieces is 22 7/16 in',
    );
    expect(jobGuide('divide-22-in-by-10', 'es')?.tips[1]).toContain(
      'aquí 9 × 1/8 in = 1 1/8 in se van en la sierra, y cada una de las 10 piezas mide 2 1/16 in',
    );
  });

  it('gives each page of a figured family tips of its own', () => {
    const families = [
      JOBS_OF_ONE_SIZE.filter((id) => id.startsWith('concrete-footing-')),
      JOBS_OF_ONE_SIZE.filter((id) => id.startsWith('divide-')),
      JOBS_OF_ONE_SIZE.filter((id) => id.startsWith('roofing-')),
      JOBS_OF_ONE_SIZE.filter((id) => id.startsWith('roof-pitch-')),
      JOBS_OF_ONE_SIZE.filter((id) => id.startsWith('drywall-room-')),
      JOBS_OF_ONE_SIZE.filter((id) => id.startsWith('paint-room-')),
    ];
    for (const locale of LOCALES) {
      for (const family of families) {
        const tips = family.map((id) => jobGuide(id, locale)?.tips.join(' '));
        expect(new Set(tips).size).toBe(family.length);
      }
    }
  });
});

// the cost pages work their own prices into their tips: `$144–$576` reads `$144 to $576` in English
// and `$144 a $576` in Spanish, so each tip is held to the price module, not typed twice
describe('jobGuide (the cost pages)', () => {
  const room = (length: number, width: number) => ({
    length: `${String(length)}ft`,
    width: `${String(width)}ft`,
    height: '8ft',
  });
  const house = (length: number, width: number, height: number) => ({
    ...room(length, width),
    height: `${String(height)}ft`,
    doors: '0',
    windows: '0',
  });
  it.each(LOCALES)('writes the prices of each cost page into its tips in %s', (locale) => {
    const words = (span: string) => span.replace('–', locale === 'en' ? ' to ' : ' a ');
    const tips = (id: JobId) => jobGuide(id, locale)?.tips ?? [];
    const [roomTip1, roomTip2, roomTip3] = tips('cost-to-paint-a-room');
    expect(roomTip1).toContain(words(roomCostOf(room(12, 12)).pro[0]));
    expect(roomTip1).toContain(words(roomCostOf(room(12, 12)).pro[1]));
    expect(roomTip2).toContain(roomCostOf(room(10, 10)).gallons);
    expect(roomTip2).toContain(roomCostOf(room(12, 16)).gallons);
    expect(roomTip3).toContain('$105');
    const [houseTip1, houseTip2, houseTip3, houseTip4] = tips('cost-to-paint-a-house');
    expect(houseTip1).toContain(words(houseCostOf(house(30, 50, 9)).outside));
    expect(houseTip2).toContain(houseCostOf(house(30, 50, 8)).walls);
    expect(houseTip2).toContain(houseCostOf(house(30, 50, 10)).walls);
    expect(houseTip3).toContain(words(houseCostOf(house(50, 50, 9)).paint[1]));
    expect(houseTip4).toContain(words(houseCostOf(house(40, 50, 9)).inside));
    const [wallTip1, wallTip2, wallTip3, wallTip4] = tips('drywall-installation-cost');
    expect(wallTip1).toContain(words(drywallCostOf(room(12, 12)).installed));
    expect(wallTip2).toContain(words(drywallCostOf(room(12, 16)).walls.installed));
    expect(wallTip3).toContain(words(drywallCostOf(room(10, 10)).labor));
    expect(wallTip4).toContain(words(drywallCostOf(room(12, 14)).bySheet));
  });
});

describe('job intros', () => {
  it.each(LOCALES)('opens every job of one size with a sentence of its own in %s', (locale) => {
    const intros = JOBS_OF_ONE_SIZE.map((id) => jobView(id, locale).intro);
    for (const [index, intro] of intros.entries()) {
      expect(intro, JOBS_OF_ONE_SIZE[index]).toMatch(/\S/);
    }
    expect(new Set(intros).size).toBe(intros.length);
  });

  // hand-verified: a rise of 3 in 12 is a grade of 3/12 = 25%, 7.5 in 12 is 62.5%, 12 in 12 is 100%
  it('gives each roof pitch its grade in percent', () => {
    expect(jobView('roof-pitch-3-12', 'en').intro).toContain('25%');
    expect(jobView('roof-pitch-7-5-12', 'en').intro).toContain('62.5%');
    expect(jobView('roof-pitch-12-12', 'es').intro).toContain('100%');
  });
});

describe('jobCoverings (the IRC check of each covering at a roof pitch)', () => {
  // hand-verified against IRC 2021 R905: roll roofing 1, asphalt shingles 2, tile 2 1/2, metal
  // shingles 3, wood 3 and slate 4 in 12; asphalt and tile take two layers of underlayment below 4
  it('checks every covering at 3 in 12 as the roof pitch engine does', () => {
    const coverings = jobCoverings('roof-pitch-3-12', 'en');
    expect(coverings?.rows).toEqual([
      { label: 'Asphalt', minimum: '2 in 12', status: 'Allowed with two layers of underlayment' },
      { label: 'Tile', minimum: '2.5 in 12', status: 'Allowed with two layers of underlayment' },
      { label: 'Metal', minimum: '3 in 12', status: 'Meets the minimum' },
      { label: 'Roll', minimum: '1 in 12', status: 'Meets the minimum' },
      { label: 'Slate', minimum: '4 in 12', status: 'Below the minimum' },
      { label: 'Wood', minimum: '3 in 12', status: 'Meets the minimum' },
    ]);
    expect(coverings?.columns).toHaveLength(3);
  });

  it('passes every covering from 4 in 12 up, in Spanish too', () => {
    for (const id of ['roof-pitch-4-12', 'roof-pitch-12-12'] as const) {
      const rows = jobCoverings(id, 'es')?.rows ?? [];
      expect(rows).toHaveLength(6);
      expect(new Set(rows.map(({ status }) => status)).size).toBe(1);
    }
    expect(jobCoverings('roof-pitch-4-12', 'es')?.rows[4]?.minimum).toBe('4 en 12');
  });

  it('is only for the roof pitch jobs of one pitch', () => {
    expect(jobCoverings('roof-pitch-chart', 'en')).toBeUndefined();
    expect(jobCoverings('concrete-slab-10x10', 'en')).toBeUndefined();
  });
});
