import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { describe, expect, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import { HUBS, hubOfCalculator } from './hubs.ts';
import { isJobPage, JOB_IDS, JOBS, jobsOf } from './jobs.ts';
import { ROUTES } from './routes.ts';
import { CALCULATOR_PAGES, templateOf } from './templates.ts';

/** The engine of each calculator a job can belong to. */
const ENGINES = { concrete, 'roof-pitch': roofPitch, 'rectangle-area': rectangleArea } as const;

describe('job pages (growth plan › lever 1)', () => {
  it('gives every job a route under the hub of its calculator, in both locales', () => {
    expect(JOB_IDS.length).toBeGreaterThan(0);
    for (const id of JOB_IDS) {
      const { calculator } = JOBS[id];
      expect(CALCULATOR_PAGES, id).toContain(calculator);
      const hub = hubOfCalculator(calculator);
      expect(hub, id).toBeDefined();
      if (hub === undefined) continue;
      expect(ROUTES[id].en.startsWith(`${ROUTES[hub].en}/`), id).toBe(true);
      expect(ROUTES[id].es.startsWith(`${ROUTES[hub].es}/`), id).toBe(true);
      expect(ROUTES[id].en, id).toMatch(/^(\/[a-z0-9-]+){2}$/);
      expect(ROUTES[id].es, id).toMatch(/^\/es(\/[a-z0-9-]+){2}$/);
      expect(templateOf(id), id).toBe('job');
    }
  });

  it('holds cases of one shape per job, each a state its engine accepts', () => {
    for (const id of JOB_IDS) {
      const [first, ...rest] = JOBS[id].cases;
      for (const each of rest) expect(Object.keys(each), id).toEqual(Object.keys(first));
      for (const each of JOBS[id].cases) {
        expect(ENGINES[JOBS[id].calculator].validate(each).ok, id).toBe(true);
      }
    }
  });

  it('lists the jobs of a calculator in table order, and tells a job id apart', () => {
    expect(jobsOf('concrete')).toEqual(JOB_IDS.filter((id) => id.startsWith('concrete-')));
    expect(jobsOf('roof-pitch')).toEqual([
      'roof-pitch-3-12',
      'roof-pitch-4-12',
      'roof-pitch-5-12',
      'roof-pitch-6-12',
      'roof-pitch-7-12',
      'roof-pitch-8-12',
      'roof-pitch-9-12',
      'roof-pitch-10-12',
      'roof-pitch-12-12',
    ]);
    expect(jobsOf('rectangle-area')).toEqual([
      'square-feet-5x5',
      'square-feet-5x10',
      'square-feet-7x12',
      'square-feet-10x10',
      'square-feet-10x12',
      'square-feet-11x14',
      'square-feet-11x16',
      'square-feet-12x12',
      'square-feet-12x14',
      'square-feet-12x30',
      'square-feet-20x20',
    ]);
    expect([...jobsOf('concrete'), ...jobsOf('roof-pitch'), ...jobsOf('rectangle-area')]).toEqual(
      JOB_IDS,
    );
    expect(jobsOf('paint')).toEqual([]);
    expect(isJobPage('concrete-slab-10x10')).toBe(true);
    expect(isJobPage('roof-pitch-6-12')).toBe(true);
    expect(isJobPage('square-feet-12x14')).toBe(true);
    expect(isJobPage('hub-concrete')).toBe(false);
    expect(templateOf('hub-concrete')).toBe('trust');
  });

  it('names each square footage job after the length and the width of its first case', () => {
    for (const id of jobsOf('rectangle-area')) {
      const [first] = JOBS[id].cases;
      expect(
        `square-feet-${first['length'] ?? ''}x${first['width'] ?? ''}`.replaceAll('ft', ''),
        id,
      ).toBe(id);
      expect(ROUTES[id].en, id).toBe(`/measurement/${id.replace('square-feet-', '')}-square-feet`);
      expect(ROUTES[id].es, id).toBe(
        `/es/medidas/${id.replace('square-feet-', '')}-pies-cuadrados`,
      );
    }
  });

  it('lists every job under a hub that holds its calculator', () => {
    const hubbed = Object.values(HUBS).flatMap(({ calculators }) => calculators);
    for (const id of JOB_IDS) expect(hubbed, id).toContain(JOBS[id].calculator);
  });
});
