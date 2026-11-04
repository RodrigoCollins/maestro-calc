import { describe, expect, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import { HUBS } from './hubs.ts';
import { isJobPage, JOB_IDS, JOBS, jobsOf } from './jobs.ts';
import { ROUTES } from './routes.ts';
import { CALCULATOR_PAGES, templateOf } from './templates.ts';

describe('job pages (growth plan › lever 1)', () => {
  it('gives every job a route under the hub of its calculator, in both locales', () => {
    expect(JOB_IDS.length).toBeGreaterThan(0);
    for (const id of JOB_IDS) {
      expect(CALCULATOR_PAGES, id).toContain(JOBS[id].calculator);
      expect(ROUTES[id].en, id).toMatch(/^\/concrete\/[a-z0-9-]+$/);
      expect(ROUTES[id].es, id).toMatch(/^\/es\/concreto\/[a-z0-9-]+$/);
      expect(templateOf(id), id).toBe('job');
    }
  });

  it('holds cases of one shape per job, each a state the engine accepts', () => {
    for (const id of JOB_IDS) {
      const [first, ...rest] = JOBS[id].cases;
      for (const each of rest) expect(Object.keys(each), id).toEqual(Object.keys(first));
      for (const each of JOBS[id].cases) expect(concrete.validate(each).ok, id).toBe(true);
    }
  });

  it('lists the jobs of a calculator in table order, and tells a job id apart', () => {
    expect(jobsOf('concrete')).toEqual(JOB_IDS);
    expect(jobsOf('paint')).toEqual([]);
    expect(isJobPage('concrete-slab-10x10')).toBe(true);
    expect(isJobPage('hub-concrete')).toBe(false);
    expect(templateOf('hub-concrete')).toBe('trust');
  });

  it('lists every job under a hub that holds its calculator', () => {
    const hubbed = Object.values(HUBS).flatMap(({ calculators }) => calculators);
    for (const id of JOB_IDS) expect(hubbed, id).toContain(JOBS[id].calculator);
  });
});
