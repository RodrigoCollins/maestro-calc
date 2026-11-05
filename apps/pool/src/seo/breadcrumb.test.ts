import { describe, expect, it } from 'vitest';
import { HOME_TOOLS } from '../home.ts';
import { JOB_PAGES } from '../jobs.ts';
import { jobTrailOf } from './breadcrumb.ts';

const SALT_JOB = {
  path: '/how-much-salt-for-a-15000-gallon-pool',
  title: 'How Much Salt for a 15,000 Gallon Pool? | Pool Figures',
  calculator: { path: '/pool-salt-calculator' },
};

describe('jobTrailOf', () => {
  it('leads from the home to the calculator of the job, then to the job page', () => {
    expect(jobTrailOf(SALT_JOB)).toEqual([
      { name: 'Pool Figures', path: '/' },
      { name: 'Pool salt calculator', path: '/pool-salt-calculator' },
      { name: 'How Much Salt for a 15,000 Gallon Pool?', path: SALT_JOB.path },
    ]);
  });

  it('names every calculator a job page belongs to', () => {
    const calculators = new Set(HOME_TOOLS.map(({ href }) => href));
    for (const job of JOB_PAGES) {
      expect(calculators.has(job.calculator.path), job.path).toBe(true);
      expect(jobTrailOf(job)[1]?.name).toMatch(/ calculator$/);
    }
  });

  it('refuses a job of a calculator the home does not list', () => {
    expect(() => jobTrailOf({ ...SALT_JOB, calculator: { path: '/nowhere' } })).toThrow(
      'no calculator /nowhere',
    );
  });
});
