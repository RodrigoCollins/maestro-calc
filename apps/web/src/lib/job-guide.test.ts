import { describe, expect, it } from 'vitest';
import { isChartJob, JOB_IDS, type JobId } from '../routing/jobs.ts';
import { LOCALES, ROUTES } from '../routing/routes.ts';
import { JOB_GUIDE_KINDS, jobCoverings, jobGuide, jobGuideKindOf } from './job-guide.ts';
import { jobView } from './job-view.ts';

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
